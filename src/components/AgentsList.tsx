// src/components/AgentsList.tsx
/**
 * Component for displaying and managing agent lists
 */

import { useEffect, useState } from 'react'
import { Trash2, Settings, Play, Square, RefreshCw, Loader2, Terminal } from 'lucide-react'
import TerminalOutput from './TerminalOutput'
import { useTerminalSocket } from '../hooks/useTerminalSocket'

interface Agent {
    name: string
    version: string
    description: string
    path: string
    type?: string
    language?: string
    createdAt?: string
    size?: number
}

interface AgentsListProps {
    onAgentSelect?: (agent: Agent) => void
    refreshTrigger?: number
}

export default function AgentsList({ onAgentSelect, refreshTrigger }: AgentsListProps) {
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deletingAgent, setDeletingAgent] = useState<string | null>(null)
    const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
    const [deployingAgent, setDeployingAgent] = useState<string | null>(null)
    const [showTerminal, setShowTerminal] = useState(false)
    const [currentAgentDeploy, setCurrentAgentDeploy] = useState<string | null>(null)
    const { isConnected, messages, clearMessages } = useTerminalSocket(showTerminal, currentAgentDeploy || undefined)

    // Fetch agents on mount and when refreshTrigger changes
    useEffect(() => {
        fetchAgents()
    }, [refreshTrigger])

    const fetchAgents = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch('/api/agents-cli/list')
            const data = await response.json()

            if (data.success) {
                setAgents(data.agents)
            } else {
                setError(data.error || 'Failed to load agents')
            }
        } catch (err) {
            setError('Failed to fetch agents: ' + (err instanceof Error ? err.message : 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAgent = async (agentName: string) => {
        if (!confirm(`Are you sure you want to delete "${agentName}"? This action cannot be undone.`)) {
            return
        }

        try {
            setDeletingAgent(agentName)
            const response = await fetch(`/api/agents-cli/${agentName}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (data.success) {
                setAgents(prev => prev.filter(a => a.name !== agentName))
                alert(`Agent "${agentName}" deleted successfully`)
            } else {
                alert(`Error: ${data.error}`)
            }
        } catch (err) {
            alert('Error deleting agent: ' + (err instanceof Error ? err.message : 'Unknown error'))
        } finally {
            setDeletingAgent(null)
        }
    }

    const handleDeployAgent = async (agentName: string) => {
        try {
            setDeployingAgent(agentName)
            setCurrentAgentDeploy(agentName)
            setShowTerminal(true)
            clearMessages()

            const response = await fetch('/api/agents-cli/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: agentName })
            })

            const data = await response.json()

            if (data.success) {
                // Wait for deployment to complete (3.5 seconds based on backend simulation)
                await new Promise(resolve => setTimeout(resolve, 3500))

                // Update agent status in list
                setAgents(prev => prev.map(a =>
                    a.name === agentName
                        ? { ...a, status: 'running' }
                        : a
                ))

                // Keep terminal open for 2 more seconds to show completion
                await new Promise(resolve => setTimeout(resolve, 2000))
            }
        } catch (err) {
            console.error('Error deploying agent:', err)
        } finally {
            setDeployingAgent(null)
            setShowTerminal(false)
        }
    }

    const getAgentIcon = (type?: string) => {
        const icons: { [key: string]: string } = {
            'macro': '⚙️',
            'arbitrage': '🧠',
            'game': '🤖',
            'creative': '✨',
            'e-commerce': '💼'
        }
        return icons[type || ''] || '🤖'
    }

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="w-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg border border-gray-800 p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                        <p className="text-gray-400">Loading agents...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg border border-gray-800">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        📋 Your Agents
                    </h2>
                    <p className="text-gray-400">
                        {agents.length} agent{agents.length !== 1 ? 's' : ''} created
                    </p>
                </div>
                <button
                    onClick={fetchAgents}
                    className="p-2 hover:bg-gray-800 rounded transition text-gray-400 hover:text-white"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="p-6 border-b border-red-700 bg-red-900/20 text-red-300">
                    {error}
                </div>
            )}

            {/* Agents List */}
            <div className="divide-y divide-gray-800">
                {agents.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-400 mb-4">No agents created yet</p>
                        <p className="text-gray-500 text-sm">Create your first agent to get started</p>
                    </div>
                ) : (
                    agents.map((agent) => (
                        <div key={agent.name} className="p-6 hover:bg-gray-900/50 transition">
                            {/* Main Agent Row */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1 cursor-pointer" onClick={() => setExpandedAgent(expandedAgent === agent.name ? null : agent.name)}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">{getAgentIcon(agent.type)}</span>
                                        <div>
                                            <h3 className="font-medium text-lg text-white">{agent.name}</h3>
                                            {agent.description && (
                                                <p className="text-sm text-gray-400">{agent.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-xs text-gray-500">
                                        {agent.type && <span>Type: {agent.type}</span>}
                                        {agent.language && <span>Language: {agent.language}</span>}
                                        {agent.version && <span>v{agent.version}</span>}
                                        {agent.size && <span>Size: {formatSize(agent.size)}</span>}
                                        {agent.createdAt && <span>{formatDate(agent.createdAt)}</span>}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 ml-4">
                                    <button
                                        className="p-2 hover:bg-gray-800 rounded transition text-gray-400 hover:text-blue-400"
                                        title="Start Agent"
                                    >
                                        <Play size={18} />
                                    </button>
                                    <button
                                        className="p-2 hover:bg-gray-800 rounded transition text-gray-400 hover:text-purple-400"
                                        title="Settings"
                                    >
                                        <Settings size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAgent(agent.name)}
                                        disabled={deletingAgent === agent.name}
                                        className="p-2 hover:bg-red-900/30 rounded transition text-gray-400 hover:text-red-400 disabled:opacity-50"
                                        title="Delete Agent"
                                    >
                                        {deletingAgent === agent.name ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedAgent === agent.name && (
                                <div className="mt-4 pt-4 border-t border-gray-800">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 mb-1">Type</p>
                                            <p className="text-gray-300 font-medium">{agent.type || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Language</p>
                                            <p className="text-gray-300 font-medium">{agent.language || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Version</p>
                                            <p className="text-gray-300 font-medium">{agent.version}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Size</p>
                                            <p className="text-gray-300 font-medium">{formatSize(agent.size || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Created</p>
                                            <p className="text-gray-300 font-medium text-xs">{formatDate(agent.createdAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Path</p>
                                            <p className="text-gray-300 font-medium text-xs truncate">{agent.path}</p>
                                        </div>
                                    </div>

                                    {/* Detailed Actions */}
                                    <div className="mt-4 pt-4 border-t border-gray-800 flex gap-2">
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition">
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => handleDeployAgent(agent.name)}
                                            disabled={deployingAgent === agent.name}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition flex items-center gap-2"
                                        >
                                            {deployingAgent === agent.name ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Deploying...
                                                </>
                                            ) : (
                                                <>
                                                    <Terminal size={16} />
                                                    Deploy
                                                </>
                                            )}
                                        </button>
                                        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Footer Stats */}
            {agents.length > 0 && (
                <div className="p-6 bg-gray-900/50 border-t border-gray-800 text-sm text-gray-400">
                    <p>Total size: {formatSize(agents.reduce((sum, a) => sum + (a.size || 0), 0))}</p>
                </div>
            )}

            {/* Terminal Output Modal */}
            <TerminalOutput
                isOpen={showTerminal}
                onClose={() => setShowTerminal(false)}
                title="Deploying Agent"
                agentName={currentAgentDeploy || undefined}
            />
        </div>
    )
}
