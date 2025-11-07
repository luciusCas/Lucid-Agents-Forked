CREATE TABLE agent_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL REFERENCES agent_identities(agent_id) ON DELETE CASCADE,
    validator_address TEXT NOT NULL,
    validation_type TEXT NOT NULL,
    response_score INTEGER CHECK (response_score >= 0 AND response_score <= 100),
    validation_data JSONB,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);