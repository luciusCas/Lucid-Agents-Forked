// src/components/AgentGenerator.tsx
/**
 * Component for creating new agents from templates
 * Integrated with backend API and terminal output
 */

import { useState, useEffect } from 'react'
import { Loader2, Plus, AlertCircle, Terminal } from 'lucide-react'
import TerminalOutput from './TerminalOutput'
import useTerminalSocket from '../hooks/useTerminalSocket'

interface Template {
    id: string
    name: string
    path: string
    icon: string
    description: string
    color: string
}

interface CreateResponse {
    success: boolean
    message?: string
    error?: string
    agent?: {
        id: string
        name: string
        type: string
        language: string
        path: string
        status: string
        createdAt: string
    }
}

export default function AgentGenerator() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
    const [agentName, setAgentName] = useState('')
    const [language, setLanguage] = useState<'javascript' | 'typescript'>('javascript')
    const [features, setFeatures] = useState<string[]>([])
    const [creating, setCreating] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [showTerminal, setShowTerminal] = useState(false)
    const [currentAgentName, setCurrentAgentName] = useState<string>('')

    // Terminal socket hook
    const { isConnected, messages, clearMessages } = useTerminalSocket(showTerminal, currentAgentName)

    // Fetch templates on mount
    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch('/api/agents-cli/templates')
            const data = await response.json()

            if (data.success) {
                setTemplates(data.templates)
            } else {
                setError(data.error || 'Failed to load templates')
            }
        } catch (err) {
            setError('Failed to fetch templates: ' + (err instanceof Error ? err.message : 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    // Create new agent
    const handleCreateAgent = async () => {
        if (!agentName.trim()) {
            setError('Please enter an agent name')
            return
        }

        if (!selectedTemplate) {
            setError('Please select an agent type')
            return
        }

        // Validate agent name
        if (!/^[a-zA-Z0-9_-]+$/.test(agentName)) {
            setError('Agent name can only contain letters, numbers, underscores, and hyphens')
            return
        }

        try {
            setCreating(true)
            setError(null)
            setSuccessMessage(null)
            setCurrentAgentName(agentName)
            setShowTerminal(true)
            clearMessages()

            const response = await fetch('/api/agents-cli/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: agentName,
                    type: selectedTemplate,
                    language: language,
                    features: features
                })
            })

            const data: CreateResponse = await response.json()

            if (data.success) {
                setSuccessMessage(`✅ Agent "${agentName}" created successfully and saved to database!`)
                setAgentName('')
                setSelectedTemplate(null)
                setFeatures([])
                setLanguage('javascript')

                // Clear success message after 7 seconds
                setTimeout(() => {
                    setSuccessMessage(null)
                    setShowTerminal(false)
                }, 7000)
            } else {
                setError(data.error || 'Failed to create agent')
                setTimeout(() => setShowTerminal(false), 3000)
            }
        } catch (err) {
            setError('Error creating agent: ' + (err instanceof Error ? err.message : 'Unknown error'))
            setTimeout(() => setShowTerminal(false), 3000)
        } finally {
            setCreating(false)
        }
    }

    const toggleFeature = (feature: string) => {
        setFeatures(prev =>
            prev.includes(feature)
                ? prev.filter(f => f !== feature)
                : [...prev, feature]
        )
    }

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg border border-gray-800">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                        <p className="text-gray-400">Loading templates...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg border border-gray-800">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    🤖 Create New Agent
                </h2>
                <p className="text-gray-400">
                    Select a template, name your agent, and customize it to your needs
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded flex gap-3">
                    <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {/* Success Alert */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded">
                    <p className="text-green-300">{successMessage}</p>
                </div>
            )}

            {/* Agent Name Input */}
            <div className="mb-8">
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    Agent Name
                </label>
                <input
                    type="text"
                    value={agentName}
                    onChange={(e) => {
                        setAgentName(e.target.value)
                        setError(null)
                    }}
                    placeholder="e.g., my-trading-bot"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Name can only contain letters, numbers, underscores, and hyphens
                </p>
            </div>

            {/* Template Selection */}
            <div className="mb-8">
                <label className="block text-sm font-medium mb-3 text-gray-300">
                    Select Agent Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {templates.map((template) => (
                        <button
                            key={template.path}
                            onClick={() => {
                                setSelectedTemplate(template.path)
                                setError(null)
                            }}
                            className={`p-4 rounded border transition text-center ${selectedTemplate === template.path
                                    ? 'border-blue-500 bg-blue-900/20 ring-2 ring-blue-500'
                                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                                }`}
                        >
                            <div className="text-3xl mb-2">{template.icon}</div>
                            <div className="font-medium text-sm text-gray-200">{template.name}</div>
                            <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Language Selection */}
            <div className="mb-8">
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    Programming Language
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {(['javascript', 'typescript'] as const).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`p-4 rounded border transition text-center ${language === lang
                                    ? 'border-blue-500 bg-blue-900/20'
                                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                }`}
                        >
                            <div className="font-medium">
                                {lang === 'javascript' ? '📝 JavaScript' : '🔷 TypeScript'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Additional Features */}
            <div className="mb-8">
                <label className="block text-sm font-medium mb-3 text-gray-300">
                    Additional Features (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        { id: 'api', label: '🔌 API Integration' },
                        { id: 'database', label: '🗄️ Database' },
                        { id: 'auth', label: '🔐 Authentication' },
                        { id: 'logging', label: '📝 Logging' },
                        { id: 'testing', label: '🧪 Testing' },
                        { id: 'docker', label: '🐳 Docker' }
                    ].map((feature) => (
                        <button
                            key={feature.id}
                            onClick={() => toggleFeature(feature.id)}
                            className={`p-3 rounded border transition text-sm ${features.includes(feature.id)
                                    ? 'border-green-500 bg-green-900/20 text-green-300'
                                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                }`}
                        >
                            {feature.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary */}
            {selectedTemplate && agentName && (
                <div className="mb-8 p-4 bg-gray-800/50 border border-gray-700 rounded">
                    <h4 className="font-medium mb-2 text-gray-300">Summary</h4>
                    <div className="text-sm text-gray-400 space-y-1">
                        <p>📛 Name: <span className="text-white">{agentName}</span></p>
                        <p>🎯 Type: <span className="text-white">{selectedTemplate.replace('-', ' ')}</span></p>
                        <p>💻 Language: <span className="text-white">{language}</span></p>
                        {features.length > 0 && (
                            <p>✨ Features: <span className="text-white">{features.join(', ')}</span></p>
                        )}
                    </div>
                </div>
            )}

            {/* Create Button */}
            <div className="flex gap-3">
                <button
                    onClick={handleCreateAgent}
                    disabled={creating || !agentName || !selectedTemplate}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {creating ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Creating & Saving...
                        </>
                    ) : (
                        <>
                            <Plus size={20} />
                            Create & Deploy
                        </>
                    )}
                </button>
                <button
                    onClick={() => {
                        setAgentName('')
                        setSelectedTemplate(null)
                        setLanguage('javascript')
                        setFeatures([])
                        setError(null)
                    }}
                    className="px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded font-medium hover:bg-gray-700 transition"
                >
                    Clear
                </button>
            </div>

            {/* Terminal Output Modal */}
            <TerminalOutput
                isOpen={showTerminal}
                onClose={() => setShowTerminal(false)}
                title="Agent Deployment Terminal"
                agentName={currentAgentName}
            />
        </div>
    )
}
