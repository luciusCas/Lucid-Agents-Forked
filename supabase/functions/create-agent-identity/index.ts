Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { 
            name, 
            description, 
            image_url, 
            endpoints = [], 
            supported_trust = [],
            agent_wallet,
            owner_address,
            agent_type,
            category,
            price_per_request,
            capabilities = [],
            frameworks_supported = [],
            autoRegister = true
        } = await req.json();

        // Validate required fields
        if (!name || !description || !owner_address || !agent_type || !category || !price_per_request) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Generate unique agent_id (simplified version, in production use proper unique ID)
        const agent_id = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // Create agent identity
        const identityResponse = await fetch(`${supabaseUrl}/rest/v1/agent_identities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                agent_id,
                name,
                description,
                image_url,
                endpoints,
                supported_trust,
                agent_wallet,
                owner_address
            })
        });

        if (!identityResponse.ok) {
            const error = await identityResponse.text();
            throw new Error(`Failed to create identity: ${error}`);
        }

        const identityData = await identityResponse.json();

        // If autoRegister is true, also register in marketplace
        if (autoRegister) {
            const marketplaceResponse = await fetch(`${supabaseUrl}/rest/v1/agent_marketplace`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    agent_id,
                    agent_type,
                    category,
                    price_per_request,
                    capabilities,
                    frameworks_supported,
                    is_active: true
                })
            });

            if (!marketplaceResponse.ok) {
                const error = await marketplaceResponse.text();
                throw new Error(`Failed to register in marketplace: ${error}`);
            }

            const marketplaceData = await marketplaceResponse.json();

            return new Response(
                JSON.stringify({ 
                    success: true, 
                    identity: identityData[0],
                    marketplace: marketplaceData[0],
                    message: 'Agent identity created and registered in marketplace'
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                identity: identityData[0],
                message: 'Agent identity created successfully'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ 
                error: {
                    code: 'CREATE_AGENT_ERROR',
                    message: error.message
                }
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
