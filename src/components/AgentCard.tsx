import { AgentMarketplace } from '@/types/agent'
import { Star, DollarSign, Activity, Cpu, ExternalLink, Eye } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PaymentModal from './PaymentModal'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface AgentCardProps {
  agent: AgentMarketplace
}

export default function AgentCard({ agent }: AgentCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const navigate = useNavigate()

  const getReputationColor = (score: number) => {
    if (score >= 0.9) return 'text-emerald-400'
    if (score >= 0.7) return 'text-amber-400'
    return 'text-orange-400'
  }

  const getReputationBg = (score: number) => {
    if (score >= 0.9) return 'bg-emerald-500/10 border-emerald-500/20'
    if (score >= 0.7) return 'bg-amber-500/10 border-amber-500/20'
    return 'bg-orange-500/10 border-orange-500/20'
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
      <Card
        onClick={handleCardClick}
        className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:scale-[1.02] animate-slide-in-up"
      >
        {/* Subtle Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-3 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted ring-1 ring-border animate-scale-in">
              <img
                src={agent.identity?.image_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=default'}
                alt={agent.identity?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-1 truncate">
                {agent.identity?.name || 'Unknown Agent'}
              </CardTitle>
              <Badge variant="secondary" className="text-xs animate-bounce-in">
                {agent.category}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Description */}
          <CardDescription className="line-clamp-2 text-xs leading-relaxed animate-fade-in [animation-delay:0.1s]">
            {agent.identity?.description || 'No description available'}
          </CardDescription>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${getReputationBg(agent.avg_reputation)} animate-slide-in-up [animation-delay:0.2s]`}>
              <Star className={`w-3.5 h-3.5 ${getReputationColor(agent.avg_reputation)}`} fill="currentColor" />
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-bold ${getReputationColor(agent.avg_reputation)}`}>
                  {(agent.avg_reputation * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-muted-foreground">Reputation</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-md animate-slide-in-up [animation-delay:0.25s]">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-primary">
                  ${agent.total_earnings.toFixed(2)}
                </div>
                <div className="text-[10px] text-muted-foreground">Earnings</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/20 rounded-md animate-slide-in-up [animation-delay:0.3s]">
              <Activity className="w-3.5 h-3.5 text-accent-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-accent-foreground">
                  {agent.total_requests}
                </div>
                <div className="text-[10px] text-muted-foreground">Requests</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-md animate-slide-in-up [animation-delay:0.35s]">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-primary">
                  ${agent.price_per_request.toFixed(2)}
                </div>
                <div className="text-[10px] text-muted-foreground">Per Request</div>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-2 animate-fade-in [animation-delay:0.4s]">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Capabilities</p>
            <div className="flex flex-wrap gap-1.5">
              {agent.capabilities.slice(0, 3).map((cap, idx) => (
                <Badge key={idx} variant="outline" className="text-[10px] py-0.5 px-2 animate-scale-in" style={{ animationDelay: `${0.45 + idx * 0.05}s` }}>
                  {cap.replace(/_/g, ' ')}
                </Badge>
              ))}
              {agent.capabilities.length > 3 && (
                <Badge variant="outline" className="text-[10px] py-0.5 px-2 text-muted-foreground animate-scale-in" style={{ animationDelay: '0.6s' }}>
                  +{agent.capabilities.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Frameworks */}
          <div className="space-y-2 animate-fade-in [animation-delay:0.5s]">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Frameworks</p>
            <div className="flex flex-wrap gap-1.5">
              {agent.frameworks_supported.map((fw, idx) => (
                <Badge key={idx} className="text-[10px] py-0.5 px-2 bg-primary/20 text-primary border-primary/30 animate-scale-in" style={{ animationDelay: `${0.55 + idx * 0.05}s` }}>
                  {fw}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="relative grid grid-cols-2 gap-2 pt-4 animate-fade-in [animation-delay:0.6s]">
          <Button
            onClick={handleCardClick}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </Button>
          <Button
            onClick={handleDeployClick}
            size="sm"
            className="w-full bg-primary hover:bg-primary/90"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Deploy
          </Button>
        </CardFooter>
      </Card>

      {showPaymentModal && (
        <PaymentModal
          agent={agent}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  )
}
