CREATE TABLE agent_reputations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL REFERENCES agent_identities(agent_id) ON DELETE CASCADE,
    client_address TEXT NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    tags JSONB DEFAULT '[]'::jsonb,
    feedback_details JSONB,
    proof_of_payment JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);