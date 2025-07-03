# 🌱 Impactey
### *See How Sustainable Your Portfolio Really Is*

Impactey is a modern ESG (Environmental, Social, Governance) investing dashboard that empowers investors to make informed sustainable investment decisions. Track your portfolio's ESG performance, compare companies by sustainability metrics, and get AI-powered insights—all without the greenwashing. Your personal ESG clarity engine for sustainable investing.

🔗 **[Live Demo: impactey.net](https://impactey.net)**

---

## ✨ Key Features

🔍 **Smart Company Search & Analysis**
- Real-time search across 20+ major companies and ETFs
- Comprehensive ESG scoring and performance metrics
- Company controversy tracking and impact analysis

📊 **Portfolio ESG Tracking**
- Track your portfolio's overall ESG performance
- Benchmark against industry standards
- Visualize sustainability impact over time

🤖 **AI-Powered Insights**
- Impactey AI for personalized ESG investment advice
- Natural language queries about sustainability metrics
- Smart recommendations based on your values

🔬 **Explore & Compare**
- Side-by-side company ESG comparisons
- Sector-specific sustainability insights
- Discover ESG leaders across industries

📚 **Educational Hub**
- Learn about ESG principles and best practices
- Stay updated with sustainability trends
- Understand the impact of your investments

⭐ **Watchlist Management**
- Save and track your favorite sustainable companies
- Get notified about ESG performance changes
- Build your personalized sustainable investment pipeline

---

## 🚀 Live Demo

**Production Site**: [https://impactey.net](https://impactey.net)

*Experience the full power of ESG investing with real-time data and AI insights.*

---

## 🛠️ Tech Stack

**Frontend Framework**
- ⚛️ React 18 with TypeScript
- 🎨 TailwindCSS for styling
- ✨ Framer Motion for animations
- 🔧 Vite for build tooling

**APIs & Data**
- 🤖 OpenAI API for AI-powered insights
- 📰 GNews API for real-time news and controversies
- 📊 ESG data integration
- 🔄 Real-time ticker data

**Deployment & Infrastructure**
- ☁️ Vercel for hosting and deployment
- 📱 Responsive design for all devices
- ⚡ Optimized performance with code splitting

---

## 📸 Screenshots

*Screenshots will be added here showcasing:*
- 🏠 Homepage with company search
- 📊 Portfolio tracking dashboard
- 🤖 AI chat interface
- 🔍 Company comparison view
- 📱 Mobile responsive design

---

## 🏗️ Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Skhalidson/Impactey.git
   cd Impactey
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

The project is optimized for deployment on Vercel:

1. **Connect GitHub Repository**
   - Link your GitHub repo to Vercel
   - Enable automatic deployments from `main` branch

2. **Build Configuration**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

3. **Environment Variables**
   - Set up any required API keys in Vercel dashboard
   - Configure production environment settings

4. **Custom Domain**
   - Add your custom domain (e.g., impactey.net)
   - Configure SSL certificates automatically

### Manual Deployment
```bash
npm run build
npx vercel --prod --yes
```

---

## 📁 Project Structure

```
Impactey/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── common/        # Shared components
│   │   ├── AIPage.tsx     # AI chat interface
│   │   ├── HomePage.tsx   # Main dashboard
│   │   └── ...
│   ├── data/              # Static data and fallbacks
│   ├── services/          # API services and utilities
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
├── dist/                  # Production build output
├── vercel.json           # Vercel deployment config
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies and scripts
```

---

## 🤝 Contributing

We welcome contributions to make ESG investing more accessible! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with descriptive messages**
   ```bash
   git commit -m "✨ Add amazing ESG feature"
   ```
5. **Push to your branch**
6. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style and TypeScript patterns
- Add comments for complex ESG calculations
- Test your changes across different devices
- Update documentation as needed

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

**Built with ❤️ for sustainable investing**

- ESG data providers and sustainability metrics
- OpenAI for AI-powered insights
- GNews for real-time company news
- The open-source community for amazing tools

---

## 📧 Contact

For questions, suggestions, or collaboration opportunities:

- **Website**: [impactey.net](https://impactey.net)
- **GitHub**: [Skhalidson/Impactey](https://github.com/Skhalidson/Impactey)

---

*Empowering investors to make sustainable choices, one portfolio at a time.* 🌍✨ 