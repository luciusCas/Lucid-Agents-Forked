// Export all backend modules for easy importing
export * from './config/database';
export * from './middleware/auth';
export * from './middleware/errorHandler';
export * from './services/agentManager';
export * from './utils/logger';
export * from './routes/authRoutes';

// Default exports
import { database } from './config/database';
import { logger } from './utils/logger';
import { agentManager } from './services/agentManager';

export default {
  database,
  logger,
  agentManager
};
