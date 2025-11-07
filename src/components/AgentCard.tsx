import { AgentMarketplace } from '@/types/agent'
import { Star, DollarSign, Activity, Cpu, ExternalLink, Eye } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PaymentModal from './PaymentModal'

interface AgentCardProps {
  agent: AgentMarketplace
}

export default function AgentCard({ agent }: AgentCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const navigate = useNavigate()

  const getReputationColor = (score: number) => {
    if (score >= 0.9) return 'text-green-400'
    if (score >= 0.7) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getReputationBg = (score: number) => {
    if (score >= 0.9) return 'bg-green-500/20 border-green-500/30'
    if (score >= 0.7) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-orange-500/20 border-orange-500/30'
  }

  const handleCardClick = () => {
    navigate(`/agent/${agent.agent_id}`)
  }

  const handleDeployClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowPaymentModal(true)
  }

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 overflow-hidden cursor-pointer"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-blue-500/10 transition-all duration-500" />
        
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-700/50">
              <img 
                src={agent.identity?.image_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=default'} 
                alt={agent.identity?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-1 truncate">
                {agent.identity?.name || 'Unknown Agent'}
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {agent.category}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {agent.identity?.description || 'No description available'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getReputationBg(agent.avg_reputation)}`}>
              <Star className={`w-4 h-4 ${getReputationColor(agent.avg_reputation)}`} />
              <div>
                <div className={`text-sm font-bold ${getReputationColor(agent.avg_reputation)}`}>
                  {(agent.avg_reputation * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">Reputasi</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-sm font-bold text-purple-400">
                  ${agent.total_earnings.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Earnings</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <Activity className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-sm font-bold text-blue-400">
                  {agent.total_requests}
                </div>
                <div className="text-xs text-gray-500">Requests</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <Cpu className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-sm font-bold text-green-400">
                  ${agent.price_per_request.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Per Request</div>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Capabilities:</div>
            <div className="flex flex-wrap gap-1">
              {agent.capabilities.slice(0, 3).map((cap, idx) => (
                <span key={idx} className="inline-block px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                  {cap.replace(/_/g, ' ')}
                </span>
              ))}
              {agent.capabilities.length > 3 && (
                <span className="inline-block px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-500">
                  +{agent.capabilities.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Frameworks */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Frameworks Supported:</div>
            <div className="flex flex-wrap gap-1">
              {agent.frameworks_supported.map((fw, idx) => (
                <span key={idx} className="inline-block px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded text-xs text-indigo-400">
                  {fw}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCardClick}
              className="py-3 px-4 bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-gray-600"
            >
              <Eye className="w-4 h-4" />
              Lihat Detail
            </button>
            <button
              onClick={handleDeployClick}
              className="py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Deploy
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal 
          agent={agent}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  )
}
