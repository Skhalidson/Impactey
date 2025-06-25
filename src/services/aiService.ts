import { companies } from '../data/companies';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ESGContext {
  companies: any[];
  userQuery: string;
  previousMessages?: ChatMessage[];
}

class AIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    // In a real app, this would be securely stored
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  private getESGSystemPrompt(): string {
    const companyData = companies.map(company => ({
      name: company.name,
      sector: company.sector,
      esgScores: company.esgScores,
      impactScore: company.impactScore,
      controversies: company.controversies,
      summary: company.summary
    }));

    return `You are Impactey AI, an expert ESG (Environmental, Social, Governance) investment advisor. You have access to comprehensive ESG data for ${companies.length} companies across multiple sectors.

COMPANY DATA AVAILABLE:
${JSON.stringify(companyData, null, 2)}

YOUR ROLE:
- Provide expert ESG investment advice and analysis
- Answer questions about specific companies' ESG performance
- Compare ESG metrics across companies and sectors
- Explain ESG controversies and their investment implications
- Offer insights on sustainable investing trends and strategies
- Help users understand ESG scoring methodologies

RESPONSE GUIDELINES:
- Be conversational but professional
- Use specific data from the available companies when relevant
- Provide actionable investment insights
- Explain complex ESG concepts in accessible terms
- Always cite specific ESG scores and metrics when making comparisons
- Highlight both positive achievements and areas for improvement
- Consider sector-specific ESG challenges and opportunities

TONE:
- Expert but approachable
- Data-driven and objective
- Encouraging toward sustainable investing
- Transparent about limitations in the data

Always reference specific companies and their ESG scores when providing examples or recommendations.`;
  }

  async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    if (!this.apiKey) {
      return this.getMockResponse(message);
    }

    try {
      const messages = [
        { role: 'system', content: this.getESGSystemPrompt() },
        ...conversationHistory.slice(-10).map(msg => ({ // Keep last 10 messages for context
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 1000,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getMockResponse(message);
    }
  }

  private getMockResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Tesla-related queries
    if (lowerMessage.includes('tesla')) {
      const tesla = companies.find(c => c.name.toLowerCase().includes('tesla'));
      if (tesla) {
        return `Tesla currently has an ESG score of ${tesla.impactScore}/10. While Tesla leads in environmental innovation with electric vehicles and renewable energy, it faces governance challenges. The company's Environmental score (${tesla.esgScores.environmental}) is strong due to its mission of accelerating sustainable transport, but its Governance score (${tesla.esgScores.governance}) reflects concerns about board independence and executive compensation. Recent controversies include workplace safety issues and regulatory challenges. For ESG-focused investors, Tesla represents a complex trade-off between environmental leadership and governance risks.`;
      }
    }

    // Comparison queries
    if (lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('versus')) {
      return `For ESG comparisons, I recommend looking at companies within the same sector first. For example, in technology, Microsoft (ESG: ${companies.find(c => c.name === 'Microsoft')?.impactScore}) generally outperforms on governance compared to newer tech companies, while Tesla leads in environmental impact but lags in governance. In energy, NextEra Energy (${companies.find(c => c.name === 'NextEra Energy')?.impactScore}) demonstrates how traditional utilities can transition to renewables. Would you like me to compare specific companies or sectors?`;
    }

    // Top performers
    if (lowerMessage.includes('top') || lowerMessage.includes('best')) {
      const topCompanies = companies
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 3);
      
      return `Based on our ESG data, the top performers are: 1) ${topCompanies[0].name} (${topCompanies[0].impactScore}) - excels in ${topCompanies[0].esgScores.environmental >= 8 ? 'environmental' : topCompanies[0].esgScores.social >= 8 ? 'social' : 'governance'} practices, 2) ${topCompanies[1].name} (${topCompanies[1].impactScore}) - strong across all ESG dimensions, and 3) ${topCompanies[2].name} (${topCompanies[2].impactScore}). These companies demonstrate consistent commitment to sustainable business practices and stakeholder value creation.`;
    }

    // Sector analysis
    if (lowerMessage.includes('sector') || lowerMessage.includes('industry')) {
      return `ESG performance varies significantly by sector. Technology companies like Microsoft and Apple generally score well on governance and social metrics. Healthcare companies like Johnson & Johnson and Pfizer excel in social responsibility through healthcare access. Energy companies face environmental challenges - traditional players like Chevron score lower (${companies.find(c => c.name === 'Chevron')?.impactScore}) while renewable leaders like NextEra Energy score higher (${companies.find(c => c.name === 'NextEra Energy')?.impactScore}). Which sector interests you most?`;
    }

    // Controversies
    if (lowerMessage.includes('controversy') || lowerMessage.includes('controversies')) {
      return `ESG controversies can significantly impact investment performance. Common issues include: Environmental violations (oil spills, emissions), Social problems (labor disputes, data privacy), and Governance failures (executive misconduct, accounting irregularities). For example, traditional energy companies often face environmental controversies, while tech companies may have data privacy issues. I can provide specific controversy analysis for any company in our database.`;
    }

    // ESG scoring explanation
    if (lowerMessage.includes('score') || lowerMessage.includes('scoring')) {
      return `ESG scores in Impactey range from 1-10, combining Environmental (carbon footprint, resource usage), Social (employee relations, community impact), and Governance (board independence, transparency) factors. A score of 7+ indicates strong ESG performance, 5-6.9 is moderate, and below 5 suggests significant ESG risks. Scores are sector-adjusted since different industries face unique ESG challenges. Would you like me to explain the scoring for a specific company?`;
    }

    // Investment advice
    if (lowerMessage.includes('invest') || lowerMessage.includes('portfolio')) {
      return `For ESG investing, consider: 1) Diversification across sectors with varying ESG strengths, 2) Balancing pure-play ESG leaders with improving companies, 3) Understanding that ESG leaders often show lower volatility and better long-term performance. Companies like Salesforce (${companies.find(c => c.name === 'Salesforce')?.impactScore}) and Johnson & Johnson represent stable ESG investments, while Tesla offers higher growth potential with more ESG complexity. What's your risk tolerance and investment timeline?`;
    }

    // Default response
    return `I'm here to help with ESG investment questions! I have comprehensive data on ${companies.length} companies across multiple sectors. You can ask me about specific companies' ESG performance, sector comparisons, investment recommendations, or ESG controversies. For example, try asking "How does Apple's ESG performance compare to Microsoft?" or "What are the top ESG risks in the energy sector?" What would you like to know?`;
  }

  getSuggestedQuestions(): string[] {
    return [
      "Why did Tesla's ESG score drop recently?",
      "Compare Apple vs Microsoft ESG performance",
      "What are the top 5 ESG leaders in technology?",
      "Explain Johnson & Johnson's ESG controversies",
      "Which energy companies have the best ESG scores?",
      "How do ESG scores affect investment returns?",
      "What ESG risks should I watch in my portfolio?",
      "Compare ESG performance across sectors",
      "Which companies improved ESG scores this year?",
      "Explain the difference between E, S, and G scores"
    ];
  }

  generateInsightSummary(): string {
    const avgScore = companies.reduce((sum, c) => sum + c.impactScore, 0) / companies.length;
    const topPerformer = companies.reduce((prev, current) => (prev.impactScore > current.impactScore) ? prev : current);
    const sectors = [...new Set(companies.map(c => c.sector))];

    return `**ESG Market Overview:** Average ESG score across ${companies.length} companies is ${avgScore.toFixed(1)}/10. ${topPerformer.name} leads with ${topPerformer.impactScore}/10. Coverage spans ${sectors.length} sectors, with Technology and Healthcare showing strongest ESG performance overall. Energy sector shows highest variability in ESG scores.`;
  }
}

export const aiService = new AIService(); 