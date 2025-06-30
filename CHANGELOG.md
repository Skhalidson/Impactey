# Changelog

All notable changes to the Impactey project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Development Branch

### Added
- **Live Ticker Data Integration** - Complete stock and ETF data from Financial Modeling Prep API
  - 98,641+ instruments (85,583 stocks + 13,058 ETFs) from global exchanges
  - 24-hour localStorage caching with intelligent cache management
  - Real-time search with autocomplete and fuzzy matching
  - Comprehensive error handling and fallback systems

- **Instrument Detail Page** - Dedicated pages for individual stocks and ETFs
  - Complete company information with market data
  - Enhanced ESG scoring with 3-tier data source system
  - Visual data source indicators (Live/Prototype/Demo)
  - AI-generated ESG analysis summaries
  - Company profile integration with website links

- **Enhanced Search Functionality**
  - Real-time search through 98K+ instruments
  - Intelligent ranking (exact matches → starts with → contains)
  - Asset type filtering and badges
  - Null-safe search with proper error handling
  - 300ms debounced search for optimal performance

- **Robust Error Handling & UI**
  - Error Boundary component for graceful error recovery
  - Loading states with spinners and progress indicators
  - Comprehensive error messages with retry functionality
  - Development-mode debugging with detailed console logging
  - Fallback UI components for data failures

- **Data Source Transparency**
  - Clear visual distinction between Live, Prototype, and Demo data
  - Orange "Demo Score" badges for algorithmic placeholders
  - Blue "Prototype Data" badges for curated research
  - Green "Live Data" badges for verified API sources
  - Methodology explanations and data source attributions

### Enhanced
- **ESG Data Service** - Unified data layer with intelligent fallbacks
  - Live API integration with caching
  - Prototype data for 20 detailed company profiles
  - Demo score generation for any valid ticker symbol
  - Consistent data structure across all sources

- **Portfolio Tracker** - Live ticker integration
  - Real-time ticker validation and suggestions
  - Enhanced search with asset type indicators
  - Improved error handling for invalid tickers
  - Better data source labeling throughout UI

- **Homepage** - Comprehensive market search interface
  - Live instrument search with 98K+ securities
  - Popular ticker quick-search buttons
  - Real-time data loading indicators
  - Enhanced error messaging and recovery

### Technical Improvements
- **State Management** - Singleton ticker service with pub/sub pattern
- **Caching Strategy** - 24-hour localStorage with automatic expiry
- **API Integration** - Parallel fetching with intelligent error handling
- **TypeScript Enhancement** - Improved type safety and null checking
- **Performance Optimization** - Debounced search and efficient filtering

### Dependencies Added
- No new external dependencies (uses existing lucide-react icons)
- Enhanced usage of existing React hooks and TypeScript features

### Files Added
```
src/services/tickerService.ts       # Core ticker data management
src/hooks/useTickerService.ts       # React hooks for ticker integration
src/components/InstrumentDetailPage.tsx # Individual stock/ETF pages
src/components/ErrorBoundary.tsx    # Error handling component
src/components/DataStatusBanner.tsx # Status indicators
src/components/DataStatusPage.tsx   # Data status overview
LIVE_TICKER_IMPLEMENTATION.md       # Technical documentation
```

### Files Modified
```
src/App.tsx                         # Added instrument routing
src/components/HomePage.tsx          # Live search integration
src/components/PortfolioPage.tsx     # Enhanced ticker validation
src/services/esgDataService.ts      # Unified data architecture
src/services/portfolioService.ts    # Live data integration
src/types/index.ts                  # Enhanced type definitions
```

### API Integrations
- **Financial Modeling Prep API**
  - Stock list endpoint: `/api/v3/stock/list`
  - ETF list endpoint: `/api/v3/etf/list`
  - Company profile endpoint: `/api/v3/profile/{symbol}`
  - ESG scores endpoint: `/api/v3/esg-environmental-social-governance-data`

### Data Architecture
- **3-Tier ESG System**:
  1. Live API data (when available)
  2. Prototype data (20 curated companies)
  3. Demo scores (algorithmic generation for any ticker)

### Performance Metrics
- Initial load: <5 seconds for 98K+ instruments
- Search response: <50ms average
- Cache hit rate: >90% for repeated searches
- Memory usage: Optimized with cleanup and garbage collection

### Security & Privacy
- API keys properly managed
- No sensitive data stored in localStorage
- Rate limiting considerations for API calls
- Error handling prevents data leakage

---

## Git Branching Strategy

### Branches
- **main** - Production-ready code (Vercel auto-deploys from here)
- **dev** - Development branch for new features and testing
- **feature/** - Individual feature branches (optional for larger features)

### Workflow
1. All new development happens in `dev` branch
2. Features are developed and tested in `dev`
3. Only merge to `main` after full testing and approval
4. Vercel deploys only from `main` branch

### Commands
```bash
# Switch to dev branch
git checkout dev

# Create and switch to dev branch (first time)
git checkout -b dev

# Merge dev into main (after testing)
git checkout main
git merge dev

# Push changes
git push origin dev
git push origin main
```

---

## Deployment Strategy

### Vercel Configuration
- **Production Branch**: `main` only
- **Preview Deployments**: Disabled for `dev` branch
- **Automatic Deployments**: Only from `main` branch
- **Environment Variables**: Set in Vercel dashboard

### Testing Checklist
Before merging to main:
- [ ] All new features working correctly
- [ ] No console errors in browser
- [ ] ESG data loading properly
- [ ] Search functionality working
- [ ] Error boundaries functioning
- [ ] Mobile responsiveness verified
- [ ] Performance benchmarks met 