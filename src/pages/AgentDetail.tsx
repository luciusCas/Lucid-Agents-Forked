import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Activity, DollarSign, Star, Clock, TrendingUp, Cpu, ExternalLink, PlayCircle, AlertCircle } from 'lucide-react'
import { AgentMarketplace, AgentTransaction } from '@/types/agent'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PaymentModal from '@/components/PaymentModal'
import { getAgentImageUrl } from '@/lib/agentImageMap'

const SUPABASE_URL = 'https://hvkuuuhijtlhsogzgbix.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2a3V1dWhpanRsaHNvZ3pnYml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0ODE4OTMsImV4cCI6MjA3ODA1Nzg5M30.ztW5p4qZreDA8cy4jrWxc32LJFHTN6dVbtLrVCL8eeU'

export default function AgentDetail() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const [agent, setAgent] = useState<AgentMarketplace | null>(null)
  const [transactions, setTransactions] = useState<AgentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected'>('disconnected')

  // Fetch agent details
  useEffect(() => {
    if (!agentId) return

    const fetchAgentDetail = async () => {
      try {
        setLoading(true)

        // Fetch agent from marketplace with identity
        const { data: agentData, error: agentError } = await supabase
          .from('agent_marketplace')
          .select(`
            *,
            identity:agent_identities(*)
          `)
          .eq('agent_id', agentId)
          .single()

        if (agentError) throw agentError

        setAgent(agentData)

        // Fetch transactions for this agent
        const { data: txData, error: txError } = await supabase
          .from('agent_transactions')
          .select('*')
          .eq('agent_id', agentId)
          .order('created_at', { ascending: false })
          .limit(20)

        if (txError) throw txError
        setTransactions(txData || [])

      } catch (error) {
        console.error('Error fetching agent details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgentDetail()
  }, [agentId])

  // Setup Realtime subscription for agent updates
  useEffect(() => {
    if (!agentId) return

    const channel = supabase
      .channel(`agent-${agentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_marketplace',
          filter: `agent_id=eq.${agentId}`
        },
        (payload) => {
          console.log('Realtime update:', payload)
          if (payload.new) {
            setAgent(prev => prev ? { ...prev, ...payload.new } : null)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_transactions',
          filter: `agent_id=eq.${agentId}`
        },
        (payload) => {
          console.log('New transaction:', payload)
          if (payload.new) {
            setTransactions(prev => [payload.new as AgentTransaction, ...prev])
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status)
        setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [agentId])

  // Generate performance chart data from transactions
  const performanceData = transactions
    .slice(0, 10)
    .reverse()
    .map((tx, idx) => ({
      name: `Tx ${idx + 1}`,
      earnings: parseFloat(tx.amount.toString()),
      date: new Date(tx.created_at).toLocaleDateString()
    }))

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-500'
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'ACTIVE' : 'INACTIVE'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading agent details...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <div className="text-white text-xl mb-4">Agent tidak ditemukan</div>
          <Link to="/" className="text-blue-400 hover:underline">Back to Marketplace</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold">Agent Details</h1>
          </div>

          {/* Agent Header Info */}
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-700">
              <img
                src={getAgentImageUrl(agent.agent_id, agent.agent_type, agent.identity?.image_url)}
                alt={agent.identity?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold">{agent.identity?.name || 'Unknown Agent'}</h2>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.is_active)} animate-pulse`} />
                  <span className={`text-sm font-medium ${agent.is_active ? 'text-green-400' : 'text-gray-400'}`}>
                    {getStatusText(agent.is_active)}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-700/50 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-400">
                    {realtimeStatus === 'connected' ? 'Real-time Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
              <p className="text-gray-400 mb-4">{agent.identity?.description || 'No description available'}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
                  {agent.category}
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">
                  {agent.agent_type}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Deploy Agent
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-green-400">${agent.total_earnings.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Total Earnings</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-blue-400">{agent.total_requests}</div>
                <div className="text-sm text-gray-400">Total Requests</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-yellow-400">{(agent.avg_reputation * 100).toFixed(0)}%</div>
                <div className="text-sm text-gray-400">Reputation Score</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-purple-400">${agent.price_per_request.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Per Request</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold">Performance Metrics</h3>
            </div>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Line type="monotone" dataKey="earnings" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No performance data available
              </div>
            )}
          </div>

          {/* Capabilities & Frameworks */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Capabilities & Frameworks</h3>

            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">Capabilities:</div>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((cap, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-700 rounded-lg text-sm">
                    {cap.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-2">Frameworks Supported:</div>
              <div className="flex flex-wrap gap-2">
                {agent.frameworks_supported.map((fw, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-sm text-indigo-400">
                    {fw}
                  </span>
                ))}
              </div>
            </div>

            {agent.identity?.agent_wallet && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Agent Wallet:</div>
                <div className="font-mono text-xs text-gray-300 break-all bg-gray-700/50 p-3 rounded">
                  {agent.identity.agent_wallet}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6 mt-8">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold">Transaction History</h3>
            <span className="ml-auto text-sm text-gray-400">{transactions.length} transaksi</span>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm text-gray-400">Waktu</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400">Dari</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400">Jumlah</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400">Network</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4 text-sm">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-mono text-gray-400">
                        {tx.from_address.substring(0, 10)}...{tx.from_address.substring(tx.from_address.length - 8)}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-green-400">
                        +${tx.amount.toFixed(2)} {tx.asset}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {tx.network}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                          }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No transactions for this agent yet
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          agent={agent}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  )
}
