# LawAdvisor - AI Legal Assistant with Letta Integration

A comprehensive AI-powered legal advisor application built with Next.js 15, Supabase, and **Letta AI agents**. Designed specifically for small businesses to get intelligent legal guidance with persistent memory and context awareness.

## 🧠 Letta Integration Features

- **Persistent Memory**: Your Letta agent remembers all conversations and builds context over time
- **Stateful Conversations**: Unlike traditional chatbots, Letta maintains state across sessions
- **Tool Access**: Built-in web search and code execution capabilities
- **Memory Management**: Agent can update its understanding of your business needs
- **Multi-Modal Support**: Text, voice, and document interactions

## 🚀 Features

- **Letta-Powered AI Chat**: Stateful legal advisor with persistent memory
- **User Authentication**: Secure sign up/sign in with Supabase
- **Document Upload**: Drag & drop support for legal documents
- **Voice Conversations**: VAPI integration for voice interactions
- **Chat History**: Searchable conversation history (backed up in Supabase)
- **Real-time Persistence**: Conversations saved both in Letta and Supabase
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **AI Agent**: Letta Cloud (stateful AI agents)
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI Integration**: Letta Vercel AI SDK Provider
- **Icons**: Lucide React

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- A Supabase account and project
- Git installed

## 🚀 Getting Started

### 1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd law-advisor-app
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables
Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uayysszbsksgktxzcqrc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheXlzc3pic2tzZ2t0eHpjcXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NjA5MzIsImV4cCI6MjA2NjEzNjkzMn0._zMdwpsfIlhcKQ2py4FJbO6nKPEFBvDz3zdBuWp3bOc

# Letta Configuration (No API key needed)
LETTA_AGENT_ID=agent-f79336f7-be3f-48eb-8d91-646515218af1
\`\`\`

### 4. Set up the database
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `scripts/create-tables.sql`

### 5. Run the development server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧠 Letta Agent Benefits

### Traditional Chatbots vs Letta Agents

| Feature | Traditional Chatbots | Letta Agents |
|---------|---------------------|지컬--------------|
| Memory | Session-based only | Persistent across all interactions |
| Context | Limited to conversation | Builds comprehensive client profile |
| Tools | Limited or none | Web search, code execution, custom tools |
| Learning | Static responses | Self-improving through memory updates |
| State | Stateless | Stateful with persistent memory blocks |

### Legal Use Cases

- **Client Profiling**: Remembers business type, industry, previous legal issues
- **Case Continuity**: Maintains context across multiple consultations
- **Document Analysis**: Can reference previously uploaded documents
- **Regulatory Tracking**: Keeps track of compliance requirements for your business
- **Legal Research**: Uses web search to find current legal information

## 🔧 Configuration

### Letta Setup
No account required! The application uses a public Letta agent that's accessible without authentication. Simply ensure you have the agent ID in your environment variables.

### Supabase Setup
1. Create a new Supabase project
2. Run the SQL script to create tables
3. Enable Row Level Security (RLS)
4. Copy your project URL and anon key

## 🚀 Deployment

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
LETTA_API_KEY=your_letta_api_key
LETTA_AGENT_ID=your_agent_id
\`\`\`

## 📝 Usage

1. **Sign Up**: Create a new account
2. **Chat**: Ask legal questions to your persistent Letta agent
3. **Upload**: Attach documents for analysis
4. **Voice**: Use voice conversations (VAPI integration)
5. **History**: Search and filter past conversations
6. **Memory**: Agent builds understanding of your business over time

## 🔒 Security

- Row Level Security (RLS) enabled
- User data isolation
- Secure authentication with Supabase
- Protected API routes
- Letta Cloud security compliance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**Disclaimer**: This application provides general legal information and should not be considered as formal legal advice. For complex legal matters, consult with a qualified attorney.

**Powered by Letta AI** - Advanced stateful agents with persistent memory and tool access.
