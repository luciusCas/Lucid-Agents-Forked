import { AgentMarketplace } from '@/types/agent'
import { DollarSign, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { EDGE_FUNCTIONS, SUPABASE_ANON_KEY } from '@/lib/supabase'
import WalletSelector from './WalletSelector'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'

interface PaymentModalProps {
  agent: AgentMarketplace
  onClose: () => void
}

type DeploymentState = 'idle' | 'pending' | 'initializing' | 'registering_identity' | 'configuring' | 'active' | 'error'

export default function PaymentModal({ agent, onClose }: PaymentModalProps) {
  const [walletAddress, setWalletAddress] = useState('')
  const [walletProvider, setWalletProvider] = useState('')
  const [deploymentState, setDeploymentState] = useState<DeploymentState>('idle')
  const [error, setError] = useState('')
  const [deploymentId, setDeploymentId] = useState('')

  const handleWalletSelect = (address: string, provider: string) => {
    setWalletAddress(address)
    setWalletProvider(provider)
    setError('')
  }

  const stateMessages = {
    idle: 'Ready to deploy',
    pending: 'Starting deployment...',
    initializing: 'Initializing agent...',
    registering_identity: 'Registering agent identity to registry...',
    configuring: 'Configuring agent...',
    active: 'Agent successfully deployed and active!',
    error: 'An error occurred'
  }

  const getProgress = () => {
    switch (deploymentState) {
      case 'pending': return 25
      case 'initializing': return 50
      case 'registering_identity': return 75
      case 'configuring': return 90
      case 'active': return 100
      default: return 0
    }
  }

  const handleDeployment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!walletAddress || walletAddress.length < 10) {
      setError('Please enter a valid wallet address')
      return
    }

    setError('')
    setDeploymentState('pending')

    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setDeploymentState('initializing')

      await new Promise(resolve => setTimeout(resolve, 1000))
      setDeploymentState('registering_identity')

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

      setTimeout(() => {
        onClose()
        if (deploymentId) {
          window.location.href = `/agent/${deploymentId}`
        }
      }, 2500)

    } catch (err: any) {
      console.error('Deployment error:', err)
      setError(err.message || 'An error occurred during deployment')
      setDeploymentState('error')
    }
  }

  const isProcessing = ['pending', 'initializing', 'registering_identity', 'configuring'].includes(deploymentState)
  const isSuccess = deploymentState === 'active'
  const isError = deploymentState === 'error'

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deploy Agent</DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-primary mx-auto animate-pulse" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif">Deployment Successful!</h3>
              <p className="text-sm text-muted-foreground">{stateMessages.active}</p>
              {deploymentId && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {deploymentId.substring(0, 20)}...
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Agent Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={agent.identity?.image_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=default'}
                    alt={agent.identity?.name}
                    className="w-12 h-12 rounded-lg ring-1 ring-border"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{agent.identity?.name}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">{agent.category}</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Deployment Cost:</span>
                  <span className="text-lg font-bold text-primary">
                    ${agent.price_per_request.toFixed(2)} USDC
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Deployment Progress */}
            {isProcessing && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-semibold">{stateMessages[deploymentState]}</p>
                      <Progress value={getProgress()} className="h-1.5" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${deploymentState === 'pending' ? 'bg-primary animate-pulse' : 'bg-primary'}`} />
                      <span>Starting deployment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${deploymentState === 'initializing' ? 'bg-primary animate-pulse' : deploymentState === 'registering_identity' || deploymentState === 'configuring' ? 'bg-primary' : 'bg-muted'}`} />
                      <span>Initializing agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${deploymentState === 'registering_identity' ? 'bg-primary animate-pulse' : deploymentState === 'configuring' ? 'bg-primary' : 'bg-muted'}`} />
                      <span>Registering ERC-8004 identity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${deploymentState === 'configuring' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                      <span>Final configuration</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Form */}
            {!isProcessing && (
              <form onSubmit={handleDeployment} className="space-y-4">
                <WalletSelector
                  onWalletSelect={handleWalletSelect}
                  isLoading={isProcessing}
                />

                {walletAddress && (
                  <Card className="bg-primary/10 border-primary/30">
                    <CardContent className="p-3">
                      <p className="text-xs font-semibold mb-2">📱 Wallet Terkoneksi</p>
                      <div className="flex items-center justify-between text-xs">
                        <code className="text-muted-foreground">
                          {walletAddress.substring(0, 10)}...{walletAddress.substring(walletAddress.length - 8)}
                        </code>
                        <Badge variant="secondary" className="text-xs">{walletProvider}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {isError && error && (
                  <Card className="bg-destructive/10 border-destructive/30">
                    <CardContent className="p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-destructive">{error}</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-accent/10 border-accent/20">
                  <CardContent className="p-3 flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold mb-1">x402 Payment System</p>
                      <p className="text-muted-foreground">
                        Feeless payment (~$0.0001 gas) with ~200ms finality on Base Network
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  disabled={isProcessing || !walletAddress}
                  className="w-full"
                  size="lg"
                >
                  <DollarSign className="w-4 h-4" />
                  Pay ${agent.price_per_request.toFixed(2)} & Deploy
                </Button>
              </form>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Menggunakan protokol ERC-8004 untuk identity & reputation management
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
