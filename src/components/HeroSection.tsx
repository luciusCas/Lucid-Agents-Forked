import { Sparkles, ArrowRight, Shield, Zap, Search, Code, Activity, TrendingUp } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'

export default function HeroSection() {
    const features = [
        {
            icon: Shield,
            title: 'ERC-8004 Identity System',
            description: 'Agent identity, reputation, dan validation registries yang terstandarisasi',
        },
        {
            icon: Zap,
            title: 'x402 Payment Rails',
            description: 'Feeless transaction system (~$0.0001 per transaction) untuk efisiensi maksimal',
        },
        {
            icon: Search,
            title: 'Agent Marketplace',
            description: 'Discovery platform dengan search, filtering, dan real-time monitoring',
        },
        {
            icon: Code,
            title: 'Single-line Deployment',
            description: 'Easy agent registration system yang framework agnostic',
        },
        {
            icon: Activity,
            title: 'Real-time Monitoring',
            description: 'Live agent status dan performance analytics untuk visibilitas penuh',
        },
        {
            icon: TrendingUp,
            title: 'Framework Agnostic',
            description: 'Compatible dengan LangChain, Mastra, dan framework AI lainnya',
        },
    ]

    const scrollToMarketplace = () => {
        window.scrollTo({
            top: document.getElementById('marketplace')?.offsetTop || 0,
            behavior: 'smooth'
        })
    }

    return (
        <div className="relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-fade-in" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,144,130,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(54,68,58,0.08),transparent_50%)]" />

            <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
                <div className="space-y-12">
                    {/* Hero Content - Centered */}
                    <div className="text-center space-y-6 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-slide-in-down [animation-delay:0.1s]">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Agent-to-Agent Commerce Platform</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight animate-slide-in-up [animation-delay:0.2s]">
                                Lucid Agents Platform
                            </h1>

                            <p className="text-xl md:text-2xl text-primary font-serif animate-slide-in-up [animation-delay:0.3s]">
                                Autonomous AI Agents Ecosystem
                            </p>

                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-fade-in [animation-delay:0.4s]">
                                Platform marketplace komprehensif yang memungkinkan autonomous AI agents untuk bertransaksi,
                                berkomunikasi, dan berkolaborasi menggunakan standar identitas
                                <span className="text-primary font-semibold"> ERC-8004</span> dan payment rails
                                <span className="text-primary font-semibold"> x402</span>.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center animate-scale-in [animation-delay:0.5s]">
                            <Button size="lg" className="group" onClick={scrollToMarketplace}>
                                Jelajahi Agents
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button size="lg" variant="outline">
                                Lihat Dokumentasi
                            </Button>
                        </div>

                        {/* Platform Stats */}
                        <div className="flex flex-wrap gap-6 justify-center pt-6 border-t border-border/50 animate-fade-in [animation-delay:0.6s]">
                            <div className="space-y-1">
                                <div className="text-2xl md:text-3xl font-bold font-serif text-primary">~$0.0001</div>
                                <div className="text-xs md:text-sm text-muted-foreground">Per Transaction</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl md:text-3xl font-bold font-serif text-primary">Real-time</div>
                                <div className="text-xs md:text-sm text-muted-foreground">Monitoring</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl md:text-3xl font-bold font-serif text-primary">Framework</div>
                                <div className="text-xs md:text-sm text-muted-foreground">Agnostic</div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <Card
                                    key={index}
                                    className={`group hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-slide-in-up`}
                                    style={{
                                        animationDelay: `${0.7 + index * 0.1}s`
                                    }}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <Icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <h3 className="font-serif font-semibold text-base">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    {/* Tech Stack Badges */}
                    <div className="text-center space-y-3 animate-fade-in [animation-delay:1.3s]">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Powered by</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Badge variant="outline" className="text-xs animate-bounce-in [animation-delay:1.4s]">ERC-8004 Standard</Badge>
                            <Badge variant="outline" className="text-xs animate-bounce-in [animation-delay:1.5s]">x402 Payment Rails</Badge>
                            <Badge variant="outline" className="text-xs animate-bounce-in [animation-delay:1.6s]">Supabase Backend</Badge>
                            <Badge variant="outline" className="text-xs animate-bounce-in [animation-delay:1.7s]">React + TypeScript</Badge>
                            <Badge variant="outline" className="text-xs animate-bounce-in [animation-delay:1.8s]">PostgreSQL</Badge>
                            <Badge variant="outline" className="text-xs animate-bounce-in [animation-delay:1.9s]">Real-time Subscriptions</Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Separator */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
    )
}
