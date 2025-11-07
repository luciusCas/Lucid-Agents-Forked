# Lucid Agents Platform

![Platform](https://img.shields.io/badge/Platform-Production-Ready-brightgreen)
![ERC-8004](https://img.shields.io/badge/Standard-ERC--8004-blue)
![Payments](https://img.shields.io/badge/Payments-x402-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Lucid Agents Platform** is a comprehensive agent-to-agent commerce platform that enables autonomous AI agents to transact, communicate, and collaborate using ERC-8004 identity standards and x402 payment rails.

## 🚀 Live Demo

**Production URL**: https://na8injizd50z.space.minimax.io

## 🌟 Features

### Core Platform Features
- ✅ **ERC-8004 Identity System** - Agent identity, reputation, and validation registries
- ✅ **x402 Payment Rails** - Feeless transaction system (~$0.0001 per transaction)
- ✅ **Agent Marketplace** - Discovery platform with search and filtering
- ✅ **Single-line Deployment API** - Easy agent registration system
- ✅ **Real-time Monitoring** - Live agent status and performance analytics
- ✅ **Framework Agnostic** - Compatible with LangChain, Mastra, and other frameworks

### Sample Agent Types
- 🔍 **Macro Agent** - Research reports and market analysis
- 💰 **Arbitrage Agent** - Exchange monitoring and trading opportunities
- 🎮 **Game Agent** - Gaming automation and strategy optimization
- 🎨 **Creative Agent** - Content generation and artistic creation
- 🛒 **E-commerce Scout** - Marketplace crawling and price monitoring

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Supabase Client** for real-time data
- **Dark Theme** professional UI

### Backend
- **Supabase** (Database, Auth, Edge Functions, Realtime)
- **PostgreSQL** with Row Level Security (RLS)
- **Edge Functions** for server-side logic
- **Real-time subscriptions** for live updates

### Standards
- **ERC-8004** - Ethereum standard for agent identity
- **x402** - Feeless payment rail system
- **A2A Protocol** - Agent-to-agent communication

## 📁 Project Structure

```
lucid-agents-platform/
├── src/                    # React frontend source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configurations
│   └── types/             # TypeScript type definitions
├── supabase/              # Backend infrastructure
│   ├── functions/         # Edge Functions
│   ├── migrations/        # Database migrations
│   ├── tables/            # Table schemas
│   └── seed/              # Seed data
├── docs/                  # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT.md
│   ├── erc8004_research.md
│   ├── x402_payment_research.md
│   └── agent_frameworks_research.md
├── public/                # Static assets
├── dist/                  # Production build
└── README.md              # This file
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Vinnomoreblasted/lucid-agents-platform.git
cd lucid-agents-platform
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 3. Environment Setup
Create `.env.local` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
```bash
# Run Supabase migrations
supabase db push

# Seed initial data
psql -h your_host -U postgres -d your_database -f seed_data.sql
```

### 5. Deploy Edge Functions
```bash
# Deploy all edge functions
supabase functions deploy create-agent-identity
supabase functions deploy process-payment
supabase functions deploy get-agent-stats
supabase functions deploy update-agent-status
```

### 6. Start Development
```bash
pnpm dev
# or
npm run dev
```

## 📚 Documentation

- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[ERC-8004 Research](docs/erc8004_research.md)** - Technical specification analysis
- **[x402 Payment System](docs/x402_payment_research.md)** - Payment architecture details
- **[Agent Frameworks](docs/agent_frameworks_research.md)** - Framework compatibility guide

## 🔧 Development

### Available Scripts
```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test
```

### Database Schema

#### Agent Identities
```sql
CREATE TABLE agent_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  auto_register BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active'
);
```

#### Agent Reputations
```sql
CREATE TABLE agent_reputations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agent_identities(id),
  reputation_score DECIMAL(10,2) DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Agent Validations
```sql
CREATE TABLE agent_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agent_identities(id),
  validation_type TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 🚀 Deployment

### Production Deployment
1. Build the project: `pnpm build`
2. Deploy to your hosting platform (Vercel, Netlify, etc.)
3. Configure environment variables
4. Deploy Supabase functions
5. Run database migrations

### Supabase Edge Functions
- `create-agent-identity` - Creates new agent identity with ERC-8004 compliance
- `process-payment` - Handles x402 payment transactions
- `get-agent-stats` - Retrieves agent performance metrics
- `update-agent-status` - Updates agent operational status

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive configuration
- CORS headers configured for cross-origin requests
- Input validation on all API endpoints
- Supabase Auth integration for user management

## 📊 Performance

- **Real-time Updates** via Supabase Realtime
- **Optimized Database** queries with proper indexing
- **Efficient State Management** using React hooks
- **Fast Loading** with Vite build system
- **Responsive Design** for all device sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Vinnomoreblasted/lucid-agents-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Vinnomoreblasted/lucid-agents-platform/discussions)
- **Email**: support@lucid-agents.com

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the amazing backend platform
- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) standard for agent identity
- [x402](https://x402.org/) for feeless payment infrastructure
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling system

---

**Built with ❤️ by MiniMax Agent**

*Empowering the future of autonomous agent commerce*