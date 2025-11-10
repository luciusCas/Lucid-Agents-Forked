import { useState, useEffect } from 'react'
import { AgentMarketplace } from '@/types/agent'
import { EDGE_FUNCTIONS, SUPABASE_ANON_KEY } from '@/lib/supabase'
import { Loader2, Search, Filter } from 'lucide-react'
import AgentCard from '@/components/AgentCard'
import StatsBar from '@/components/StatsBar'
import HeroSection from '@/components/HeroSection'
import CLISection from '@/components/CLISection'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function Marketplace() {
  const [agents, setAgents] = useState<AgentMarketplace[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('avg_reputation')

  useEffect(() => {
    fetchAgents()
  }, [sortBy])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        sort_by: sortBy,
        order: 'desc',
        limit: '50'
      })

      const response = await fetch(`${EDGE_FUNCTIONS.GET_MARKETPLACE}?${params}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()

      if (data.success) {
        setAgents(data.agents)
      } else {
        console.error('API Error:', data.error)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.identity?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.identity?.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || agent.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(agents.map(a => a.category)))]

  const totalEarnings = agents.reduce((sum, a) => sum + a.total_earnings, 0)
  const totalRequests = agents.reduce((sum, a) => sum + a.total_requests, 0)
  const avgReputation = agents.length > 0 ? agents.reduce((sum, a) => sum + a.avg_reputation, 0) / agents.length : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* CLI Section with Scroll Animation */}
      <CLISection />

      {/* Marketplace Section */}
      <div id="marketplace" className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Stats Bar */}
        <div className="animate-slide-in-up [animation-delay:0.2s]">
          <StatsBar
            totalAgents={agents.length}
            totalEarnings={totalEarnings}
            totalRequests={totalRequests}
            avgReputation={avgReputation}
          />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3 animate-fade-in [animation-delay:0.3s]">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
            <Input
              type="text"
              placeholder="Search agents by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(c => c !== 'all').map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avg_reputation">Highest Reputation</SelectItem>
                <SelectItem value="total_earnings">Earnings Tertinggi</SelectItem>
                <SelectItem value="total_requests">Most Popular</SelectItem>
                <SelectItem value="created_at">Terbaru</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground animate-fade-in [animation-delay:0.4s]">
              Showing {filteredAgents.length} of {agents.length} agents
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAgents.map((agent, idx) => (
                <div key={agent.id} style={{ animationDelay: `${0.4 + idx * 0.08}s` }}>
                  <AgentCard agent={agent} />
                </div>
              ))}
            </div>

            {filteredAgents.length === 0 && (
              <div className="text-center py-20 animate-fade-in [animation-delay:0.4s]">
                <Filter className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-base">No agents match your filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
