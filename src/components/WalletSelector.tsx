import { useState, useEffect } from 'react'
import { Wallet, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface WalletSelectorProps {
    onWalletSelect: (address: string, provider: string) => void
    isLoading?: boolean
}

interface WalletProvider {
    name: string
    icon: string
    id: string
    installed: boolean
}

export default function WalletSelector({ onWalletSelect, isLoading = false }: WalletSelectorProps) {
    const [providers, setProviders] = useState<WalletProvider[]>([])
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
    const [connecting, setConnecting] = useState(false)
    const [error, setError] = useState('')
    const [connected, setConnected] = useState(false)
    const [userAddress, setUserAddress] = useState('')

    useEffect(() => {
        checkWalletProviders()
    }, [])

    const checkWalletProviders = () => {
        const wallets: WalletProvider[] = [
            {
                name: 'MetaMask',
                icon: '🦊',
                id: 'metamask',
                installed: typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask
            },
            {
                name: 'Coinbase Wallet',
                icon: '💙',
                id: 'coinbase',
                installed: typeof window !== 'undefined' && (window as any).ethereum?.isCoinbaseWallet
            },
            {
                name: 'WalletConnect',
                icon: '🔵',
                id: 'walletconnect',
                installed: true // WalletConnect works via QR code
            },
            {
                name: 'Phantom',
                icon: '👻',
                id: 'phantom',
                installed: typeof window !== 'undefined' && (window as any).phantom?.ethereum?.isPhantom
            },
            {
                name: 'Brave Wallet',
                icon: '🦁',
                id: 'brave',
                installed: typeof window !== 'undefined' && (window as any).ethereum?.isBraveWallet
            }
        ]

        setProviders(wallets.filter(w => w.installed || w.id === 'walletconnect'))
    }

    const connectMetaMask = async () => {
        try {
            setConnecting(true)
            setError('')

            const ethereum = (window as any).ethereum
            if (!ethereum) {
                throw new Error('MetaMask is not installed')
            }

            // Request account access
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            })

            if (accounts.length > 0) {
                const address = accounts[0]
                setUserAddress(address)
                setConnected(true)
                setSelectedProvider('metamask')

                // Call parent callback after a brief delay to show success state
                setTimeout(() => {
                    onWalletSelect(address, 'MetaMask')
                }, 1000)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to connect to MetaMask')
        } finally {
            setConnecting(false)
        }
    }

    const connectCoinbaseWallet = async () => {
        try {
            setConnecting(true)
            setError('')

            const ethereum = (window as any).ethereum
            if (!ethereum?.isCoinbaseWallet) {
                throw new Error('Coinbase Wallet is not installed')
            }

            const accounts = await ethereum.request({
                method: 'eth_requestAccounts'
            })

            if (accounts.length > 0) {
                const address = accounts[0]
                setUserAddress(address)
                setConnected(true)
                setSelectedProvider('coinbase')

                setTimeout(() => {
                    onWalletSelect(address, 'Coinbase Wallet')
                }, 1000)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to connect to Coinbase Wallet')
        } finally {
            setConnecting(false)
        }
    }

    const connectPhantom = async () => {
        try {
            setConnecting(true)
            setError('')

            const phantom = (window as any).phantom?.ethereum
            if (!phantom) {
                throw new Error('Phantom Wallet is not installed')
            }

            const resp = await phantom.connect()
            if (resp.publicKey) {
                const address = resp.publicKey.toString()
                setUserAddress(address)
                setConnected(true)
                setSelectedProvider('phantom')

                setTimeout(() => {
                    onWalletSelect(address, 'Phantom')
                }, 1000)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to connect to Phantom')
        } finally {
            setConnecting(false)
        }
    }

    const handleConnect = async (providerId: string) => {
        switch (providerId) {
            case 'metamask':
                await connectMetaMask()
                break
            case 'coinbase':
                await connectCoinbaseWallet()
                break
            case 'phantom':
                await connectPhantom()
                break
            case 'walletconnect':
                setError('WalletConnect coming soon...')
                break
            case 'brave':
                await connectMetaMask() // Brave uses Ethereum provider
                break
            default:
                setError('Unknown wallet provider')
        }
    }

    if (connected && userAddress) {
        return (
            <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <div className="flex-1">
                            <p className="text-green-400 font-semibold text-sm">Wallet Connected</p>
                            <p className="text-green-300/70 text-xs font-mono mt-1">
                                {userAddress.substring(0, 6)}...{userAddress.substring(userAddress.length - 4)}
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setConnected(false)
                        setUserAddress('')
                        setSelectedProvider(null)
                        setError('')
                    }}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors border border-gray-600 rounded-lg hover:bg-gray-700/30"
                >
                    Change Wallet
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-blue-400" />
                <label className="block text-gray-300 text-sm font-medium">
                    Select Wallet
                </label>
            </div>

            {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-red-400 text-sm">{error}</div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                {providers.map((provider) => (
                    <button
                        key={provider.id}
                        onClick={() => handleConnect(provider.id)}
                        disabled={connecting || isLoading}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${selectedProvider === provider.id
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <div className="text-3xl">{provider.icon}</div>
                        <span className="text-xs font-medium text-white text-center">
                            {provider.name}
                        </span>
                        {connecting && selectedProvider === provider.id && (
                            <Loader2 className="w-3 h-3 text-blue-400 animate-spin absolute top-2 right-2" />
                        )}
                    </button>
                ))}
            </div>

            {providers.length === 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                        ⚠️ No wallet providers detected. Please install MetaMask or another wallet.
                    </p>
                </div>
            )}

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-gray-300">
                <p className="font-semibold text-blue-400 mb-1">💡 Tips:</p>
                <p className="text-gray-400">
                    Make sure your wallet is connected to <strong>Base Network</strong> for smooth transactions
                </p>
            </div>
        </div>
    )
}
