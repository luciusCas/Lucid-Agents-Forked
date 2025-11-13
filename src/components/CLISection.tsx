import { useState, useEffect } from "react";
import { ContainerScroll } from "./ui/container-scroll-animation";
import { Terminal, Copy, Check, PlayCircle, Code2, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

export default function CLISection() {
    const [copied, setCopied] = useState(false);
    const [currentCommand, setCurrentCommand] = useState(0);
    const [terminalLines, setTerminalLines] = useState<string[]>([]);

    const commands = [
        {
            command: "npx lucid-agents-cli create my-agent --type macro",
            description: "Create a new macro agent"
        },
        {
            command: "lucid-agent create trading-bot --type arbitrage",
            description: "Create arbitrage trading bot"
        },
        {
            command: "lucid-agent deploy --env production",
            description: "Deploy to production"
        }
    ];

    const installCommand = "npm install -g lucid-agents-cli";

    // Simulate terminal output
    useEffect(() => {
        const terminalOutput = [
            "$ " + commands[currentCommand].command,
            "",
            "🚀 Lucid Agents CLI v1.0.0",
            "📦 Creating new agent...",
            "✓ Agent directory created: ./my-agent",
            "✓ Installing dependencies...",
            "✓ Generating manifest.json (ERC-8004)",
            "✓ Setting up configuration files",
            "✓ Creating example code",
            "",
            "✨ Success! Agent created at ./my-agent",
            "",
            "Next steps:",
            "  cd my-agent",
            "  npm start",
            "",
            "Ready to deploy your agent! 🎉"
        ];

        setTerminalLines([]);
        let index = 0;

        const interval = setInterval(() => {
            if (index < terminalOutput.length) {
                setTerminalLines(prev => [...prev, terminalOutput[index]]);
                index++;
            } else {
                clearInterval(interval);
                // Switch to next command after completion
                setTimeout(() => {
                    setCurrentCommand((prev) => (prev + 1) % commands.length);
                }, 3000);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [currentCommand]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const features = [
        {
            icon: Zap,
            title: "Instant Setup",
            description: "Get started in seconds with one command"
        },
        {
            icon: Code2,
            title: "Template Library",
            description: "5+ agent templates ready to use"
        },
        {
            icon: PlayCircle,
            title: "Deploy Anywhere",
            description: "Local, Docker, Cloud, or Serverless"
        }
    ];

    return (
        <div className="relative overflow-hidden bg-background">

            <ContainerScroll
                titleComponent={
                    <div className="space-y-6 pb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <Terminal className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Developer Tools</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight text-foreground">
                            Build Agents with
                            <br />
                            <span className="text-primary">One Command</span>
                        </h2>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                            Lucid Agents CLI makes it easy for you to create, manage, and deploy AI agents
                            with automatic scaffolding and optimized templates.
                        </p>

                        {/* Installation Command */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                                <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                                    <code className="text-green-400 font-mono text-sm md:text-base">
                                        {installCommand}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(installCommand)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <Card key={index} className="bg-card/50 backdrop-blur border-border/50">
                                        <CardContent className="p-4 flex items-start gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-semibold text-sm">{feature.title}</h4>
                                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                }
            >
                {/* Terminal Window */}
                <div className="h-full w-full bg-gray-950 rounded-lg overflow-hidden flex flex-col">
                    {/* Terminal Header */}
                    <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-gray-400 text-sm font-mono ml-3">
                                terminal — lucid-agents-cli
                            </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                            Live Demo
                        </Badge>
                    </div>

                    {/* Terminal Content */}
                    <div className="flex-1 p-4 md:p-6 font-mono text-xs md:text-sm overflow-auto">
                        <div className="space-y-1">
                            {terminalLines.map((line, index) => {
                                // Determine line color based on content
                                let colorClass = "text-gray-300";
                                if (line && line.startsWith("$")) colorClass = "text-blue-400";
                                else if (line && line.includes("✓")) colorClass = "text-green-400";
                                else if (line && line.includes("✨")) colorClass = "text-yellow-400";
                                else if (line && (line.includes("🚀") || line.includes("📦"))) colorClass = "text-cyan-400";
                                else if (line && (line.startsWith("Next steps:") || line.startsWith("Ready"))) {
                                    colorClass = "text-purple-400";
                                }

                                return (
                                    <div key={index} className={`${colorClass} leading-relaxed`}>
                                        {line || '\u00A0'}
                                    </div>
                                );
                            })}
                            <div className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1"></div>
                        </div>
                    </div>

                    {/* Terminal Footer - Command Tabs */}
                    <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
                        <div className="flex gap-2 overflow-x-auto">
                            {commands.map((cmd, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentCommand(index)}
                                    className={`px-3 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors ${currentCommand === index
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                                        }`}
                                >
                                    {cmd.description}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </ContainerScroll>

            {/* CLI Features Section */}
            <div className="max-w-7xl mx-auto px-4 pb-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                        {
                            title: "Macro Agent",
                            description: "Automated task execution and workflow processing",
                            icon: "⚙️"
                        },
                        {
                            title: "Arbitrage Agent",
                            description: "Real-time market analysis and trading opportunities",
                            icon: "🧠"
                        },
                        {
                            title: "Game Agent",
                            description: "Gaming automation and strategy optimization",
                            icon: "🤖"
                        },
                        {
                            title: "Creative Agent",
                            description: "Content generation and artistic capabilities",
                            icon: "✨"
                        },
                        {
                            title: "E-commerce Agent",
                            description: "Store management and customer analytics",
                            icon: "💼"
                        }
                    ].map((agent, index) => (
                        <Card
                            key={index}
                            className="group hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        >
                            <CardContent className="p-5 text-center">
                                <div className="text-4xl mb-3">{agent.icon}</div>
                                <h3 className="font-serif font-semibold text-base mb-2">
                                    {agent.title}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {agent.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* CTA Section with Mascot */}
                <div className="relative mt-12 py-6">
                    {/* Left Side - Mascot Fixed at Left Edge */}
                    <div className="hidden lg:block fixed left-0 top-1/3 z-20">
                        <div className="relative w-48">
                            {/* Mascot Image */}
                            <img
                                src="/logo_1.png"
                                alt="Lucid Mascot"
                                className="w-full h-auto object-contain"
                                style={{
                                    filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))'
                                }}
                            />

                            {/* Subtle Glow Background */}
                            <div className="absolute -inset-6 bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-2xl -z-10" />
                        </div>
                    </div>

                    {/* CTA Content - Centered */}
                    <div className="text-center space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif">
                                Ready to Build Your First Agent?
                            </h3>
                            <p className="text-lg text-muted-foreground">
                                Install the CLI and start creating powerful AI agents in minutes.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center pt-4">
                            <Button size="lg" className="group">
                                Get Started
                                <Terminal className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
                            </Button>
                            <Button size="lg" variant="outline">
                                View Documentation
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Mascot - Bottom */}
                    <div className="md:hidden flex justify-center mt-8">
                        <img
                            src="/logo_1.png"
                            alt="Lucid Mascot"
                            className="w-48 h-auto object-contain"
                            style={{
                                filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.1))'
                            }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes peek {
                    0%, 100% {
                        transform: translateX(-20px);
                        opacity: 0.8;
                    }
                    50% {
                        transform: translateX(0px);
                        opacity: 1;
                    }
                }

                .animate-peek {
                    animation: peek 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
