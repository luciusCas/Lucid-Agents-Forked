import { AgentMarketplace } from '@/types/agent'
import { X, DollarSign, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { EDGE_FUNCTIONS, SUPABASE_ANON_KEY } from '@/lib/supabase'

interface PaymentModalProps {
  agent: AgentMarketplace
  onClose: () => void
}

type DeploymentState = 'idle' | 'pending' | 'initializing' | 'registering_identity' | 'configuring' | 'active' | 'error'

export default function PaymentModal({ agent, onClose }: PaymentModalProps) {
  const [walletAddress, setWalletAddress] = useState('')
  const [deploymentState, setDeploymentState] = useState<DeploymentState>('idle')
  const [error, setError] = useState('')
  const [deploymentId, setDeploymentId] = useState('')

  const stateMessages = {
    idle: 'Siap untuk deploy',
    pending: 'Memulai deployment...',
    initializing: 'Menginisialisasi agent...',
    registering_identity: 'Mendaftarkan identitas agent ke registry...',
    configuring: 'Mengonfigurasi agent...',
    active: 'Agent berhasil di-deploy dan aktif!',
    error: 'Terjadi kesalahan'
  }

  const handleDeployment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!walletAddress || walletAddress.length < 10) {
      setError('Masukkan wallet address yang valid')
      return
    }

    setError('')
    setDeploymentState('pending')

    try {
      // Simulate deployment states with realistic timing
      await new Promise(resolve => setTimeout(resolve, 800))
      setDeploymentState('initializing')

      await new Promise(resolve => setTimeout(resolve, 1000))
      setDeploymentState('registering_identity')

      // Call create-agent-identity edge function
      const createIdentityResponse = await fetch(EDGE_FUNCTIONS.CREATE_AGENT_IDENTITY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          name: `${agent.identity?.name} - Deployed by ${walletAddress.substring(0, 10)}`,
          description: agent.identity?.description,
          owner_address: walletAddress,
          agent_type: agent.agent_type,
          category: agent.category,
          price_per_request: agent.price_per_request,
          capabilities: agent.capabilities,
          frameworks_supported: agent.frameworks_supported,
          autoRegister: true
        })
      })

      const identityData = await createIdentityResponse.json()

      if (!createIdentityResponse.ok || identityData.error) {
        throw new Error(identityData.error?.message || 'Failed to create agent identity')
      }

      const newAgentId = identityData.identity?.agent_id
      setDeploymentId(newAgentId)

      await new Promise(resolve => setTimeout(resolve, 1000))
      setDeploymentState('configuring')

      // Process payment transaction
      const paymentResponse = await fetch(EDGE_FUNCTIONS.PROCESS_PAYMENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          agent_id: newAgentId,
          from_address: walletAddress,
          to_address: identityData.identity?.agent_wallet || '0x0',
          amount: agent.price_per_request,
          asset: 'USDC',
          network: 'Base',
          transaction_hash: `0x${Math.random().toString(16).substring(2, 42)}`,
          resource: `deployment_${Date.now()}`,
          description: `Deploy ${agent.identity?.name}`
        })
      })

      const paymentData = await paymentResponse.json()

      if (!paymentResponse.ok || paymentData.error) {
        throw new Error(paymentData.error?.message || 'Payment failed')
      }

      await new Promise(resolve => setTimeout(resolve, 800))
      setDeploymentState('active')

      // Auto-close after success
      setTimeout(() => {
        onClose()
        // Optionally navigate to the new agent's detail page
        if (deploymentId) {
          window.location.href = `/agent/${deploymentId}`
        }
      }, 2500)

    } catch (err: any) {
      console.error('Deployment error:', err)
      setError(err.message || 'Terjadi kesalahan saat deployment')
      setDeploymentState('error')
    }
  }

  const isProcessing = ['pending', 'initializing', 'registering_identity', 'configuring'].includes(deploymentState)
  const isSuccess = deploymentState === 'active'
  const isError = deploymentState === 'error'

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">Deploy Agent</h2>

        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">Deployment Berhasil!</h3>
            <p className="text-gray-400 mb-2">{stateMessages.active}</p>
            {deploymentId && (
              <p className="text-sm text-blue-400 font-mono">
                Agent ID: {deploymentId.substring(0, 20)}...
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Agent Info */}
            <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={agent.identity?.image_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=default'} 
                  alt={agent.identity?.name}
                  className="w-12 h-12 rounded-lg"
                />
                <div>
                  <h3 className="text-white font-semibold">{agent.identity?.name}</h3>
                  <p className="text-gray-400 text-sm">{agent.category}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-600">
                <span className="text-gray-400">Biaya Deployment:</span>
                <span className="text-xl font-bold text-green-400">
                  ${agent.price_per_request.toFixed(2)} USDC
                </span>
              </div>
            </div>

            {/* Deployment Progress */}
            {isProcessing && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm mb-1">
                      {stateMessages[deploymentState]}
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: deploymentState === 'pending' ? '25%' :
                                 deploymentState === 'initializing' ? '50%' :
                                 deploymentState === 'registering_identity' ? '75%' :
                                 deploymentState === 'configuring' ? '90%' : '100%'
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${deploymentState === 'pending' ? 'bg-blue-400 animate-pulse' : 'bg-green-400'}`} />
                    <span>Memulai deployment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${deploymentState === 'initializing' ? 'bg-blue-400 animate-pulse' : deploymentState === 'registering_identity' || deploymentState === 'configuring' ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span>Inisialisasi agent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${deploymentState === 'registering_identity' ? 'bg-blue-400 animate-pulse' : deploymentState === 'configuring' ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span>Registrasi ERC-8004 identity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${deploymentState === 'configuring' ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`} />
                    <span>Konfigurasi final</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Form */}
            {!isProcessing && (
              <form onSubmit={handleDeployment}>
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Wallet Address (Base Network)
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {isError && error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-red-400 text-sm">{error}</div>
                  </div>
                )}

                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold mb-1">x402 Payment System</p>
                      <p className="text-gray-400 text-xs">
                        Pembayaran feeless (~$0.0001 gas) dengan finality ~200ms pada Base Network
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-5 h-5" />
                  Pay ${agent.price_per_request.toFixed(2)} & Deploy
                </button>
              </form>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              Menggunakan protokol ERC-8004 untuk identity & reputation management
            </p>
          </>
        )}
      </div>
    </div>
  )
}
