Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const category = url.searchParams.get('category');
        const agent_type = url.searchParams.get('agent_type');
        const min_reputation = url.searchParams.get('min_reputation');
        const sort_by = url.searchParams.get('sort_by') || 'created_at';
        const order = url.searchParams.get('order') || 'desc';
        const limit = url.searchParams.get('limit') || '50';

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // Build query
        let query = `${supabaseUrl}/rest/v1/agent_marketplace?is_active=eq.true&select=*`;
        
        if (category) {
            query += `&category=eq.${category}`;
        }
        
        if (agent_type) {
            query += `&agent_type=eq.${agent_type}`;
        }
        
        if (min_reputation) {
            query += `&avg_reputation=gte.${min_reputation}`;
        }

        query += `&order=${sort_by}.${order}&limit=${limit}`;

        const marketplaceResponse = await fetch(query, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        if (!marketplaceResponse.ok) {
            const error = await marketplaceResponse.text();
            throw new Error(`Failed to fetch marketplace: ${error}`);
        }

        const marketplaceData = await marketplaceResponse.json();

        // Enrich with identity data
        const enrichedData = await Promise.all(
            marketplaceData.map(async (agent) => {
                const identityResponse = await fetch(
                    `${supabaseUrl}/rest/v1/agent_identities?agent_id=eq.${agent.agent_id}`,
                    {
                        headers: {
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`
                        }
                    }
                );

                if (identityResponse.ok) {
                    const identityData = await identityResponse.json();
                    if (identityData.length > 0) {
                        return {
                            ...agent,
                            identity: identityData[0]
                        };
                    }
                }

                return agent;
            })
        );

        return new Response(
            JSON.stringify({ 
                success: true, 
                agents: enrichedData,
                count: enrichedData.length
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ 
                error: {
                    code: 'MARKETPLACE_ERROR',
                    message: error.message
                }
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
