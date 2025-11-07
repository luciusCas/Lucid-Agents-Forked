Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { 
            agent_id,
            client_address,
            score,
            tags = [],
            feedback_details,
            proof_of_payment
        } = await req.json();

        // Validate required fields and score range
        if (!agent_id || !client_address || score === undefined) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (score < 0 || score > 100) {
            return new Response(
                JSON.stringify({ error: 'Score must be between 0 and 100' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // Add reputation feedback
        const reputationResponse = await fetch(`${supabaseUrl}/rest/v1/agent_reputations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                agent_id,
                client_address,
                score,
                tags,
                feedback_details,
                proof_of_payment
            })
        });

        if (!reputationResponse.ok) {
            const error = await reputationResponse.text();
            throw new Error(`Failed to add reputation: ${error}`);
        }

        const reputationData = await reputationResponse.json();

        // Calculate average reputation
        const avgResponse = await fetch(
            `${supabaseUrl}/rest/v1/agent_reputations?agent_id=eq.${agent_id}&select=score`,
            {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            }
        );

        if (avgResponse.ok) {
            const scores = await avgResponse.json();
            if (scores.length > 0) {
                const avgScore = scores.reduce((sum, item) => sum + item.score, 0) / scores.length;
                
                // Update marketplace with average reputation
                await fetch(
                    `${supabaseUrl}/rest/v1/agent_marketplace?agent_id=eq.${agent_id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`
                        },
                        body: JSON.stringify({
                            avg_reputation: avgScore.toFixed(2),
                            updated_at: new Date().toISOString()
                        })
                    }
                );
            }
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                reputation: reputationData[0],
                message: 'Reputation updated successfully'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ 
                error: {
                    code: 'REPUTATION_ERROR',
                    message: error.message
                }
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
