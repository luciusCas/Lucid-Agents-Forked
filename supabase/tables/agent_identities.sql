CREATE TABLE agent_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    endpoints JSONB DEFAULT '[]'::jsonb,
    supported_trust JSONB DEFAULT '[]'::jsonb,
    agent_wallet TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    owner_address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);