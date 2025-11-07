INSERT INTO agent_marketplace (agent_id, agent_type, category, price_per_request, capabilities, frameworks_supported, is_active, total_requests, total_earnings, avg_reputation)
VALUES 
  ('agent_macro_research_001', 'research', 'Macro Research', 0.50, '["economic_analysis", "market_trends", "policy_analysis", "daily_reports"]'::jsonb, '["LangChain", "Mastra"]'::jsonb, true, 25, 12.50, 0.94);

INSERT INTO agent_identities (agent_id, name, description, image_url, endpoints, supported_trust, agent_wallet, owner_address, metadata)
VALUES 
  ('agent_arbitrage_scanner_002', 'ArbitrageBot Pro', 'High-frequency arbitrage detection agent that scans multiple cryptocurrency exchanges for price discrepancies and profitable trading opportunities.', 'https://api.dicebear.com/7.x/bottts/svg?seed=arbitrage', '[{"name": "MCP", "endpoint": "https://mcp.agent.eth/", "version": "2025-06-18"}]'::jsonb, '["reputation", "tee-attestation", "crypto-economic"]'::jsonb, '0x842d35Cc6634C0532925a3b844Bc9e7595f1bEc', '0x2234567890123456789012345678901234567891', '{"scan_frequency": "real-time", "exchanges": ["binance", "coinbase", "kraken"]}'::jsonb),
  ('agent_gaming_assistant_003', 'GameMaster AI', 'Intelligent gaming assistant for strategy optimization, in-game decision making, and automated gameplay for supported titles.', 'https://api.dicebear.com/7.x/bottts/svg?seed=gaming', '[{"name": "A2A", "endpoint": "https://gaming.agent.io/.well-known/agent-card.json", "version": "0.3.0"}]'::jsonb, '["reputation"]'::jsonb, '0x942d35Cc6634C0532925a3b844Bc9e7595f2bEd', '0x3234567890123456789012345678901234567892', '{"supported_games": ["league_of_legends", "valorant", "chess"], "skill_level": "expert"}'::jsonb),
  ('agent_creative_writer_004', 'ContentCraft AI', 'Professional content generation agent specializing in marketing copy, blog articles, social media posts, and creative writing.', 'https://api.dicebear.com/7.x/bottts/svg?seed=creative', '[{"name": "MCP", "endpoint": "https://creative.agent.com/mcp", "version": "2025-06-18"}]'::jsonb, '["reputation", "zkml"]'::jsonb, '0xa42d35Cc6634C0532925a3b844Bc9e7595f3bEe', '0x4234567890123456789012345678901234567893', '{"content_types": ["blog", "marketing", "social_media"], "languages": ["en", "id"]}'::jsonb),
  ('agent_ecommerce_scout_005', 'MarketScout Pro', 'Advanced e-commerce monitoring agent that tracks product prices, availability, reviews, and market trends across major online marketplaces.', 'https://api.dicebear.com/7.x/bottts/svg?seed=ecommerce', '[{"name": "A2A", "endpoint": "https://scout.agent.shop/.well-known/agent-card.json", "version": "0.3.0"}]'::jsonb, '["reputation", "crypto-economic"]'::jsonb, '0xb42d35Cc6634C0532925a3b844Bc9e7595f4bEf', '0x5234567890123456789012345678901234567894', '{"marketplaces": ["amazon", "tokopedia", "shopee"], "update_frequency": "hourly"}'::jsonb);

INSERT INTO agent_marketplace (agent_id, agent_type, category, price_per_request, capabilities, frameworks_supported, is_active, total_requests, total_earnings, avg_reputation)
VALUES 
  ('agent_arbitrage_scanner_002', 'trading', 'Arbitrage Detection', 0.25, '["price_scanning", "arbitrage_detection", "real_time_alerts", "exchange_integration"]'::jsonb, '["AutoGen", "CrewAI"]'::jsonb, true, 45, 11.25, 0.98),
  ('agent_gaming_assistant_003', 'gaming', 'Game Automation', 0.15, '["strategy_optimization", "automated_gameplay", "performance_analysis", "decision_support"]'::jsonb, '["LangGraph", "Swarm"]'::jsonb, true, 60, 9.00, 0.88),
  ('agent_creative_writer_004', 'creative', 'Content Generation', 0.35, '["blog_writing", "marketing_copy", "social_media", "creative_writing", "seo_optimization"]'::jsonb, '["LangChain", "Mastra", "CrewAI"]'::jsonb, true, 30, 10.50, 0.94),
  ('agent_ecommerce_scout_005', 'data_collection', 'E-commerce Intelligence', 0.20, '["price_tracking", "product_monitoring", "review_analysis", "market_trends", "competitor_analysis"]'::jsonb, '["AutoGen", "Semantic Kernel"]'::jsonb, true, 50, 10.00, 0.90);

INSERT INTO agent_reputations (agent_id, client_address, score, tags, feedback_details)
VALUES 
  ('agent_macro_research_001', '0xabcd1234', 95, '["accurate", "timely"]'::jsonb, '{"comment": "Excellent research quality", "report_id": "report_001"}'::jsonb),
  ('agent_macro_research_001', '0xefgh5678', 92, '["detailed", "insightful"]'::jsonb, '{"comment": "Very comprehensive analysis", "report_id": "report_002"}'::jsonb),
  ('agent_arbitrage_scanner_002', '0xijkl9012', 98, '["fast", "accurate"]'::jsonb, '{"comment": "Found profitable opportunities quickly", "trades": 15}'::jsonb),
  ('agent_gaming_assistant_003', '0xmnop3456', 88, '["helpful", "strategic"]'::jsonb, '{"comment": "Good gaming strategies", "games_played": 50}'::jsonb),
  ('agent_creative_writer_004', '0xqrst7890', 94, '["creative", "engaging"]'::jsonb, '{"comment": "High quality content", "articles": 10}'::jsonb),
  ('agent_ecommerce_scout_005', '0xuvwx1234', 90, '["reliable", "comprehensive"]'::jsonb, '{"comment": "Great price tracking", "products_tracked": 100}'::jsonb);

INSERT INTO agent_transactions (agent_id, from_address, to_address, amount, asset, network, transaction_hash, resource, description, status)
VALUES 
  ('agent_macro_research_001', '0xabcd1234', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 0.50, 'USDC', 'Base', '0xabc123', 'daily_report_2025_01_15', 'Daily macro research report', 'completed'),
  ('agent_arbitrage_scanner_002', '0xijkl9012', '0x842d35Cc6634C0532925a3b844Bc9e7595f1bEc', 0.25, 'USDC', 'Base', '0xdef456', 'arbitrage_scan_20250115_1430', 'Real-time arbitrage scan', 'completed'),
  ('agent_gaming_assistant_003', '0xmnop3456', '0x942d35Cc6634C0532925a3b844Bc9e7595f2bEd', 0.15, 'USDC', 'Base', '0xghi789', 'game_session_valorant_001', 'Valorant strategy session', 'completed'),
  ('agent_creative_writer_004', '0xqrst7890', '0xa42d35Cc6634C0532925a3b844Bc9e7595f3bEe', 0.35, 'USDC', 'Base', '0xjkl012', 'blog_post_ai_trends', 'AI trends blog article', 'completed'),
  ('agent_ecommerce_scout_005', '0xuvwx1234', '0xb42d35Cc6634C0532925a3b844Bc9e7595f4bEf', 0.20, 'USDC', 'Base', '0xmno345', 'price_monitor_electronics', 'Electronics price monitoring', 'completed');
