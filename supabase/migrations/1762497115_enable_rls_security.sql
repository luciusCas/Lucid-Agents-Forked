-- Migration: enable_rls_security
-- Created at: 1762497115

-- Enable Row Level Security on all tables
ALTER TABLE agent_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reputations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_marketplace ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can read marketplace (for discovery)
CREATE POLICY "Public read access to marketplace"
ON agent_marketplace FOR SELECT
USING (is_active = true);

-- Policy 2: Public can read agent identities (for discovery)
CREATE POLICY "Public read access to identities"
ON agent_identities FOR SELECT
USING (true);

-- Policy 3: Only owners can create/update their agent identity
CREATE POLICY "Owners can manage their agent identity"
ON agent_identities FOR ALL
USING (auth.jwt() ->> 'sub' = owner_address OR auth.role() = 'service_role');

-- Policy 4: Public can read reputations
CREATE POLICY "Public read access to reputations"
ON agent_reputations FOR SELECT
USING (true);

-- Policy 5: Authenticated users can give feedback
CREATE POLICY "Authenticated users can give feedback"
ON agent_reputations FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Policy 6: Public can read validations
CREATE POLICY "Public read access to validations"
ON agent_validations FOR SELECT
USING (true);

-- Policy 7: Validators can respond to validation requests
CREATE POLICY "Validators can manage validations"
ON agent_validations FOR ALL
USING (auth.role() = 'service_role');

-- Policy 8: Public can read completed transactions (for transparency)
CREATE POLICY "Public read access to completed transactions"
ON agent_transactions FOR SELECT
USING (status = 'completed');

-- Policy 9: Service role can create transactions (payment processing)
CREATE POLICY "Service role can create transactions"
ON agent_transactions FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Policy 10: Owners can update their marketplace listing
CREATE POLICY "Owners can update their marketplace listing"
ON agent_marketplace FOR UPDATE
USING (
    agent_id IN (
        SELECT agent_id FROM agent_identities 
        WHERE owner_address = auth.jwt() ->> 'sub'
    )
    OR auth.role() = 'service_role'
);

-- Policy 11: Service role can insert marketplace listings
CREATE POLICY "Service role can create marketplace listings"
ON agent_marketplace FOR INSERT
WITH CHECK (auth.role() = 'service_role');;