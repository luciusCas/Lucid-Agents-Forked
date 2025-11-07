import { TrendingUp, Users, Zap, DollarSign } from 'lucide-react'

interface StatsBarProps {
  totalAgents: number
  totalEarnings: number
  totalRequests: number
  avgReputation: number
}

export default function StatsBar({ totalAgents, totalEarnings, totalRequests, avgReputation }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-400 text-sm mb-1">Total Agents</p>
            <p className="text-3xl font-bold text-white">{totalAgents}</p>
          </div>
          <Users className="w-12 h-12 text-blue-400 opacity-50" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-400 text-sm mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
          </div>
          <DollarSign className="w-12 h-12 text-purple-400 opacity-50" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-400 text-sm mb-1">Total Requests</p>
            <p className="text-3xl font-bold text-white">{totalRequests}</p>
          </div>
          <Zap className="w-12 h-12 text-green-400 opacity-50" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-400 text-sm mb-1">Avg Reputation</p>
            <p className="text-3xl font-bold text-white">{(avgReputation * 100).toFixed(1)}%</p>
          </div>
          <TrendingUp className="w-12 h-12 text-yellow-400 opacity-50" />
        </div>
      </div>
    </div>
  )
}
