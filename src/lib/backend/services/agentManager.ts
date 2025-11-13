import { EventEmitter } from 'events';
import { database } from '../config/database';
import { logger } from '../utils/logger';

interface AgentProcess {
  agent: any;
  config: any;
  pid: number;
  kill: (signal: string) => void;
  on: (event: string, callback: Function) => void;
}

interface RunningAgentInfo {
  process: AgentProcess;
  agent: any;
  startTime: Date;
  healthStatus: string;
}

class AgentManager extends EventEmitter {
  private runningAgents: Map<number, RunningAgentInfo>;
  private executingTasks: Map<number, Promise<any>>;
  private healthCheckInterval: NodeJS.Timeout | null;
  private isInitialized: boolean;

  constructor() {
    super();
    this.runningAgents = new Map();
    this.executingTasks = new Map();
    this.healthCheckInterval = null;
    this.isInitialized = false;
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Agent Manager...');
      await this.loadRunningAgents();
      this.startHealthCheck();
      this.isInitialized = true;
      logger.info('Agent Manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Agent Manager:', error as Error);
      throw error;
    }
  }

  async loadRunningAgents(): Promise<void> {
    try {
      const runningAgents = await database.all(
        'SELECT * FROM agents WHERE status = ?',
        ['running']
      );

      for (const agent of runningAgents) {
        try {
          await this.startAgent(agent.id, false);
          logger.info(`Loaded running agent: ${agent.name}`, { agentId: agent.id });
        } catch (error: any) {
          logger.error(`Failed to load agent ${agent.name}:`, error, { agentId: agent.id });
          await database.run(
            'UPDATE agents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['error', agent.id]
          );
        }
      }
    } catch (error) {
      logger.error('Failed to load running agents:', error as Error);
    }
  }

  async startAgent(agentId: number, updateStatus: boolean = true): Promise<AgentProcess> {
    try {
      const agent = await database.get('SELECT * FROM agents WHERE id = ?', [agentId]);
      
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }

      if (this.runningAgents.has(agentId)) {
        throw new Error(`Agent ${agent.name} is already running`);
      }

      logger.info(`Starting agent: ${agent.name}`, { agentId });

      const agentProcess = await this.createAgentProcess(agent);
      
      this.runningAgents.set(agentId, {
        process: agentProcess,
        agent,
        startTime: new Date(),
        healthStatus: 'healthy'
      });

      if (updateStatus) {
        await database.run(
          'UPDATE agents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['running', agentId]
        );
      }

      this.emit('agentStarted', { agentId, agent });
      logger.info(`Agent started successfully: ${agent.name}`, { agentId });
      
      return agentProcess;
    } catch (error: any) {
      logger.error(`Failed to start agent:`, error, { agentId });
      
      if (updateStatus) {
        await database.run(
          'UPDATE agents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['error', agentId]
        );
      }
      
      throw error;
    }
  }

  async stopAgent(agentId: number, updateStatus: boolean = true): Promise<void> {
    try {
      if (!this.runningAgents.has(agentId)) {
        throw new Error(`Agent with ID ${agentId} is not running`);
      }

      const agentInfo = this.runningAgents.get(agentId)!;
      const agent = agentInfo.agent;

      logger.info(`Stopping agent: ${agent.name}`, { agentId });

      await this.cancelAgentTasks(agentId);

      if (agentInfo.process && agentInfo.process.kill) {
        agentInfo.process.kill('SIGTERM');
        
        await new Promise<void>((resolve) => {
          agentInfo.process.on('exit', () => resolve());
          setTimeout(resolve, 5000);
        });
      }

      this.runningAgents.delete(agentId);

      if (updateStatus) {
        await database.run(
          'UPDATE agents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['stopped', agentId]
        );
      }

      this.emit('agentStopped', { agentId, agent });
      logger.info(`Agent stopped successfully: ${agent.name}`, { agentId });
    } catch (error: any) {
      logger.error(`Failed to stop agent:`, error, { agentId });
      throw error;
    }
  }

  async restartAgent(agentId: number): Promise<void> {
    try {
      logger.info(`Restarting agent:`, { agentId });
      await this.stopAgent(agentId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.startAgent(agentId);
      logger.info(`Agent restarted successfully`, { agentId });
    } catch (error: any) {
      logger.error(`Failed to restart agent:`, error, { agentId });
      throw error;
    }
  }

  async getAgentHealth(agentId: number): Promise<any> {
    try {
      const agentInfo = this.runningAgents.get(agentId);
      
      if (!agentInfo) {
        throw new Error(`Agent with ID ${agentId} is not running`);
      }
      
      const recentExecutions = await database.all(
        'SELECT status, execution_time_ms, start_time FROM agent_executions WHERE agent_id = ? ORDER BY start_time DESC LIMIT 10',
        [agentId]
      );
      
      const totalExecutions = recentExecutions.length;
      const successfulExecutions = recentExecutions.filter((e: any) => e.status === 'completed').length;
      const avgExecutionTime = totalExecutions > 0 
        ? recentExecutions.reduce((sum: number, e: any) => sum + (e.execution_time_ms || 0), 0) / totalExecutions
        : 0;
      
      const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
      const healthStatus = successRate >= 80 ? 'healthy' : 'degraded';
      
      await database.run(
        'UPDATE agents SET health_status = ?, last_health_check = CURRENT_TIMESTAMP WHERE id = ?',
        [healthStatus, agentId]
      );
      
      return {
        status: healthStatus,
        uptime: Date.now() - agentInfo.startTime.getTime(),
        successRate: Math.round(successRate * 100) / 100,
        avgExecutionTime: Math.round(avgExecutionTime),
        totalExecutions,
        lastExecution: recentExecutions[0] ? recentExecutions[0].start_time : null
      };
      
    } catch (error: any) {
      logger.error(`Failed to get agent health:`, error, { agentId });
      throw error;
    }
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        for (const [agentId] of this.runningAgents) {
          try {
            await this.getAgentHealth(agentId);
          } catch (error: any) {
            logger.error(`Health check failed for agent:`, error, { agentId });
          }
        }
      } catch (error) {
        logger.error('Health check interval error:', error as Error);
      }
    }, 30000);
  }

  private async createAgentProcess(agent: any): Promise<AgentProcess> {
    const config = agent.config ? JSON.parse(agent.config) : {};
    
    return {
      agent,
      config,
      pid: Math.random() * 10000,
      kill: () => {
        logger.info(`Mock agent process killed:`, { agentId: agent.id });
      },
      on: (event: string, callback: Function) => {
        // Mock event handling
      }
    };
  }

  private async cancelAgentTasks(agentId: number): Promise<void> {
    try {
      const runningTasks = await database.all(
        'SELECT id FROM tasks WHERE agent_id = ? AND status = ?',
        [agentId, 'running']
      );
      
      for (const task of runningTasks) {
        // Mark as cancelled
        await database.run(
          'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['cancelled', task.id]
        );
      }
      
      logger.info(`Cancelled ${runningTasks.length} tasks for agent`, { agentId });
    } catch (error) {
      logger.error(`Failed to cancel agent tasks:`, error as Error, { agentId });
    }
  }

  getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      runningAgents: this.runningAgents.size,
      executingTasks: this.executingTasks.size,
      totalAgents: this.runningAgents.size
    };
  }

  async cleanup(): Promise<void> {
    try {
      logger.info('Cleaning up Agent Manager...');
      
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      for (const [agentId] of this.runningAgents) {
        try {
          await this.stopAgent(agentId, false);
        } catch (error) {
          logger.error(`Failed to stop agent during cleanup:`, error as Error, { agentId });
        }
      }
      
      this.runningAgents.clear();
      this.executingTasks.clear();
      
      logger.info('Agent Manager cleanup completed');
    } catch (error) {
      logger.error('Agent Manager cleanup failed:', error as Error);
    }
  }
}

export const agentManager = new AgentManager();
export default agentManager;
