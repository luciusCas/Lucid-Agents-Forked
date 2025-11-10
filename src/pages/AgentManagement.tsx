// src/pages/AgentManagement.tsx
/**
 * Page for managing agents (create, list, deploy)
 */

import { useState } from 'react'
import AgentGenerator from '@/components/AgentGenerator'
import AgentsList from '@/components/AgentsList'
import { Plus, List } from 'lucide-react'

export default function AgentManagement() {
    const [activeTab, setActiveTab] = useState('list')
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const handleAgentCreated = () => {
        // Trigger refresh of agents list
        setRefreshTrigger(prev => prev + 1)
        // Switch to list tab
        setActiveTab('list')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        🤖 Agent Management
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Create, configure, and deploy your AI agents
                    </p>
                </div>

                {/* Tabs */}
                <div className="w-full">
                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-8 border-b border-gray-800">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`pb-3 px-4 flex items-center gap-2 font-medium transition ${activeTab === 'list'
                                    ? 'border-b-2 border-blue-500 text-blue-400'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            <List size={18} />
                            <span className="hidden sm:inline">Your Agents</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`pb-3 px-4 flex items-center gap-2 font-medium transition ${activeTab === 'create'
                                    ? 'border-b-2 border-blue-500 text-blue-400'
                                    : 'text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Create New</span>
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'list' && (
                        <div className="space-y-4">
                            <AgentsList refreshTrigger={refreshTrigger} />
                        </div>
                    )}

                    {activeTab === 'create' && (
                        <div className="space-y-4">
                            <AgentGenerator />
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
                        <h3 className="text-gray-400 text-sm mb-2">Quick Start</h3>
                        <p className="text-2xl font-bold text-white mb-3">5 Templates</p>
                        <p className="text-sm text-gray-500">
                            Choose from Macro, Arbitrage, Game, Creative, or E-commerce agents
                        </p>
                    </div>

                    <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
                        <h3 className="text-gray-400 text-sm mb-2">Programming</h3>
                        <p className="text-2xl font-bold text-white mb-3">JavaScript & TypeScript</p>
                        <p className="text-sm text-gray-500">
                            Write your agents in JavaScript or TypeScript
                        </p>
                    </div>

                    <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
                        <h3 className="text-gray-400 text-sm mb-2">Deployment</h3>
                        <p className="text-2xl font-bold text-white mb-3">Multi-Platform</p>
                        <p className="text-sm text-gray-500">
                            Deploy to Local, Docker, Cloud, or Serverless
                        </p>
                    </div>
                </div>

                {/* Documentation Link */}
                <div className="mt-12 text-center">
                    <a
                        href="/docs/agents"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded font-medium hover:shadow-lg transition"
                    >
                        📖 Read Documentation
                    </a>
                </div>
            </div>
        </div>
    )
}
