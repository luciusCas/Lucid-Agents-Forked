import { TrendingUp, Users, Zap, DollarSign } from 'lucide-react'
import { Card, CardContent } from './ui/card'

interface StatsBarProps {
  totalAgents: number
  totalEarnings: number
  totalRequests: number
  avgReputation: number
}

export default function StatsBar({ totalAgents, totalEarnings, totalRequests, avgReputation }: StatsBarProps) {
  const stats = [
    {
      label: 'Total Agents',
      value: totalAgents.toString(),
      icon: Users,
      gradient: 'from-primary/20 to-primary/5',
      border: 'border-primary/20',
      iconColor: 'text-primary',
    },
    {
      label: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      gradient: 'from-accent/20 to-accent/5',
      border: 'border-accent/20',
      iconColor: 'text-accent-foreground',
    },
    {
      label: 'Total Requests',
      value: totalRequests.toString(),
      icon: Zap,
      gradient: 'from-primary/15 to-primary/5',
      border: 'border-primary/15',
      iconColor: 'text-primary',
    },
    {
      label: 'Avg Reputation',
      value: `${(avgReputation * 100).toFixed(1)}%`,
      icon: TrendingUp,
      gradient: 'from-primary/20 to-accent/10',
      border: 'border-primary/20',
      iconColor: 'text-primary',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className={`bg-gradient-to-br ${stat.gradient} border ${stat.border} transition-all duration-300 hover:scale-105 animate-slide-in-up`}
            style={{
              animationDelay: `${0.2 + index * 0.1}s`
            }}
          >
            <CardContent className="p-6 animate-fade-in" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold font-serif text-foreground">
                    {stat.value}
                  </p>
                </div>
                <Icon className={`w-10 h-10 ${stat.iconColor} opacity-40 animate-float-in`} style={{ animationDelay: `${0.4 + index * 0.1}s` }} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
