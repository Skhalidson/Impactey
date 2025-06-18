# Impactey

A modern web application for analyzing and tracking company sustainability impact. Impactey helps ESG analysts, sustainable investors, and students evaluate companies based on their environmental, social, and governance (ESG) performance.

## Features

- **Company Sustainability Analysis**: View detailed ESG metrics and sustainability scores for various companies
- **Watchlist Management**: Save and track companies of interest
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS
- **Real-time Data**: Local storage for bookmarking and personalization

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Development**: ESLint, PostCSS, Autoprefixer

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd impactey
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header
│   ├── HomePage.tsx    # Main landing page
│   ├── CompanyPage.tsx # Individual company details
│   └── WatchlistPage.tsx # Saved companies
├── data/               # Static data and utilities
│   └── companies.ts    # Company data and search functions
├── types/              # TypeScript type definitions
│   └── index.ts        # Company and app types
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

## Target Audience

- **ESG Analysts**: Professionals analyzing environmental, social, and governance factors
- **Sustainable Investors**: Investors focused on ESG-compliant companies
- **Students**: Academic users studying sustainability and corporate responsibility
- **Sustainability Consultants**: Professionals advising on ESG practices

## Deployment to Vercel

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set project name (e.g., "impactey")
   - Choose deployment settings

5. **Automatic deployments**: Future pushes to main branch will automatically deploy

## Environment Variables

To use the FinancialModelingPrep ESG API, create a `.env` file in the root directory:

```bash
# FinancialModelingPrep API Key
# Get your free API key from: https://financialmodelingprep.com/developer/docs/
VITE_FMP_API_KEY=your_api_key_here

# ESG API Key (for future use)
VITE_ESG_API_KEY=your_esg_api_key_here
```

### Getting an API Key

1. Visit [FinancialModelingPrep](https://financialmodelingprep.com/developer/docs/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository. 