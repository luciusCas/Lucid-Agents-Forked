export interface AgentIdentity {
  id: string
  agent_id: string
  name: string
  description: string
  image_url?: string
  endpoints: any[]
  supported_trust: string[]
  agent_wallet?: string
  owner_address: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface AgentMarketplace {
  id: string
  agent_id: string
  agent_type: string
  category: string
  price_per_request: number
  capabilities: string[]
  frameworks_supported: string[]
  is_active: boolean
  total_requests: number
  total_earnings: number
  avg_reputation: number
  created_at: string
  updated_at: string
  identity?: AgentIdentity
}

export interface AgentReputation {
  id: string
  agent_id: string
  client_address: string
  score: number
  tags: string[]
  feedback_details?: any
  proof_of_payment?: any
  created_at: string
}

export interface AgentTransaction {
  id: string
  agent_id: string
  from_address: string
  to_address: string
  amount: number
  asset: string
  network: string
  transaction_hash?: string
  payment_proof?: any
  resource?: string
  description?: string
  status: string
  created_at: string
}
