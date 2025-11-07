CREATE TABLE agent_marketplace (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT UNIQUE NOT NULL REFERENCES agent_identities(agent_id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    category TEXT NOT NULL,
    price_per_request DECIMAL(10,
    6) NOT NULL,
    capabilities JSONB DEFAULT '[]'::jsonb,
    frameworks_supported JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    total_requests INTEGER DEFAULT 0,
    total_earnings DECIMAL(20,
    6) DEFAULT 0,
    avg_reputation DECIMAL(3,
    2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);