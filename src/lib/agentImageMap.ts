/**
 * Agent Image URL Mapping
 * Maps agent IDs and types to their corresponding DiceBear avatar URLs
 */

export const agentImageMap: Record<string, string> = {
    // Agent IDs mapping
    'agent_macro_research_001': 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Brooklynn',
    'agent_arbitrage_scanner_002': 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Oliver',
    'agent_gaming_assistant_003': 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Sarah',
    'agent_creative_writer_004': 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Sawyer',
    'agent_ecommerce_scout_005': 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Easton',
};

export const agentTypeImageMap: Record<string, string> = {
    // Agent type mapping as fallback
    'research': 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Brooklynn',
    'trading': 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Oliver',
    'gaming': 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Sarah',
    'creative': 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Sawyer',
    'data_collection': 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Easton',
};

/**
 * Get the correct image URL for an agent
 * Priority: agent_id > agent_type > provided image_url > default
 */
export function getAgentImageUrl(
    agentId?: string,
    agentType?: string,
    imageUrl?: string
): string {
    // First priority: mapped agent ID
    if (agentId && agentImageMap[agentId]) {
        return agentImageMap[agentId];
    }

    // Second priority: agent type
    if (agentType && agentTypeImageMap[agentType]) {
        return agentTypeImageMap[agentType];
    }

    // Third priority: provided image URL
    if (imageUrl) {
        return imageUrl;
    }

    // Default fallback
    return 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=default';
}

/**
 * Get agent name by ID (for display purposes)
 */
export const agentNameMap: Record<string, string> = {
    'agent_macro_research_001': 'GlobalEcon Macro Research Agent',
    'agent_arbitrage_scanner_002': 'ArbitrageBot Pro',
    'agent_gaming_assistant_003': 'GameMaster AI',
    'agent_creative_writer_004': 'ContentCraft AI',
    'agent_ecommerce_scout_005': 'MarketScout Pro',
};
