import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Leaf, 
  Users, 
  Shield, 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  Target,
  Globe,
  FileText,
  HelpCircle,
  Building
} from 'lucide-react';
import { TickerData } from '../services/tickerService';
import { getUnifiedESGData, UnifiedESGData } from '../services/esgDataService';

interface InsightsPageProps {
  onNavigate: (page: string, companyId?: string, ticker?: TickerData) => void;
}

const InsightsPage: React.FC<InsightsPageProps> = ({ onNavigate }) => {
  const [expandedScoring, setExpandedScoring] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [topCompanies, setTopCompanies] = useState<UnifiedESGData[]>([]);

  // Quiz questions about ESG
  const quizQuestions = [
    {
      question: "What does ESG stand for?",
      options: [
        "Environmental, Social, Governance",
        "Economic, Social, Growth", 
        "Energy, Sustainability, Government",
        "Ethical, Sustainable, Governance"
      ],
      correct: 0,
      explanation: "ESG stands for Environmental, Social, and Governance - the three key factors used to measure sustainability and ethical impact."
    },
    {
      question: "Which ESG factor focuses on board diversity and executive compensation?",
      options: [
        "Environmental",
        "Social", 
        "Governance",
        "All of the above"
      ],
      correct: 2,
      explanation: "Governance covers corporate leadership, board composition, executive compensation, and business ethics."
    }
  ];

  // Load sample companies for sector spotlight
  useEffect(() => {
    const loadTopCompanies = async () => {
      const sampleTickers = ['AAPL', 'MSFT', 'GOOGL'];
      const companyData = await Promise.all(
        sampleTickers.map(async (ticker) => {
          try {
            return await getUnifiedESGData(ticker);
          } catch {
            return null;
          }
        })
      );
      setTopCompanies(companyData.filter(Boolean) as UnifiedESGData[]);
    };
    
    loadTopCompanies();
  }, []);

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setQuizAnswered(true);
  };

  const nextQuestion = () => {
    if (quizQuestion < quizQuestions.length - 1) {
      setQuizQuestion(quizQuestion + 1);
      setQuizAnswered(false);
      setSelectedAnswer(null);
    } else {
      setQuizQuestion(0);
      setQuizAnswered(false);
      setSelectedAnswer(null);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-emerald-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
              ESG Insights
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Learn about Environmental, Social, and Governance factors that drive sustainable investing and corporate responsibility.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* What is ESG? */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <BookOpen className="w-8 h-8 text-emerald-600" />
                <h2 className="text-2xl font-bold text-slate-800">What is ESG?</h2>
              </div>
              
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                ESG investing evaluates companies based on Environmental, Social, and Governance criteria to assess 
                sustainability and ethical impact alongside financial performance.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Environmental */}
                <div className="group relative">
                  <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200 hover:border-green-300 transition-colors cursor-help">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-green-800">Environmental</h3>
                    </div>
                    <p className="text-green-700">
                      Climate change impact, carbon emissions, resource usage, waste management, and environmental stewardship.
                    </p>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap z-10">
                    Measures environmental impact and sustainability practices
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>

                {/* Social */}
                <div className="group relative">
                  <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200 hover:border-blue-300 transition-colors cursor-help">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-blue-800">Social</h3>
                    </div>
                    <p className="text-blue-700">
                      Employee relations, diversity & inclusion, community impact, human rights, and stakeholder engagement.
                    </p>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap z-10">
                    Evaluates relationships with employees, communities, and society
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>

                {/* Governance */}
                <div className="group relative">
                  <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200 hover:border-purple-300 transition-colors cursor-help">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-purple-800">Governance</h3>
                    </div>
                    <p className="text-purple-700">
                      Board composition, executive compensation, transparency, business ethics, and shareholder rights.
                    </p>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap z-10">
                    Assesses corporate leadership and business conduct
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How We Score ESG */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-800">How We Score ESG</h2>
              </div>

              {/* Scoring Tiers */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    <span className="font-semibold text-green-800">Leader (8.0-10.0)</span>
                  </div>
                  <div className="text-green-700 font-medium">Exceptional ESG practices</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
                    <span className="font-semibold text-emerald-800">Average (6.0-7.9)</span>
                  </div>
                  <div className="text-emerald-700 font-medium">Good ESG performance</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
                    <span className="font-semibold text-yellow-800">Below Average (4.0-5.9)</span>
                  </div>
                  <div className="text-yellow-700 font-medium">Needs improvement</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                    <span className="font-semibold text-red-800">Risk (0.0-3.9)</span>
                  </div>
                  <div className="text-red-700 font-medium">Significant ESG concerns</div>
                </div>
              </div>

              {/* Learn More Expander */}
              <button
                onClick={() => setExpandedScoring(!expandedScoring)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <span>Learn more about scoring methodology</span>
                {expandedScoring ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedScoring && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">Scoring Methodology</h4>
                  <ul className="text-blue-700 space-y-2 text-sm">
                    <li>• <strong>Data Sources:</strong> SEC filings, sustainability reports, third-party assessments</li>
                    <li>• <strong>Weighting:</strong> Environmental (40%), Social (35%), Governance (25%)</li>
                    <li>• <strong>Metrics:</strong> 150+ quantitative and qualitative indicators</li>
                    <li>• <strong>Updates:</strong> Quarterly reviews with real-time controversy monitoring</li>
                    <li>• <strong>Peer Comparison:</strong> Scores normalized within industry sectors</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Why ESG Scores Matter */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                <h2 className="text-2xl font-bold text-slate-800">Why ESG Scores Matter</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 border border-emerald-200">
                  <h3 className="font-bold text-slate-800 mb-3">The ESG-Performance Connection</h3>
                  <p className="text-slate-600 mb-4">
                    Companies with strong ESG practices often demonstrate better long-term financial performance and lower risk profiles.
                  </p>
                  
                  {/* Sample KPI Visualization */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">23%</div>
                      <div className="text-sm text-slate-600">Higher ROI</div>
                      <div className="text-xs text-slate-500">ESG leaders vs laggards</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">15%</div>
                      <div className="text-sm text-slate-600">Lower Volatility</div>
                      <div className="text-xs text-slate-500">Over 5-year periods</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800">Key Benefits:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-slate-700">Improved risk management</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-slate-700">Enhanced stakeholder trust</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-slate-700">Access to ESG-focused capital</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-slate-700">Long-term value creation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reporting Frameworks */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold text-slate-800">ESG Reporting Frameworks</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* GRI */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-green-800">GRI Standards</h3>
                  </div>
                  <ul className="text-green-700 space-y-2 text-sm">
                    <li>• Global reporting framework</li>
                    <li>• Focus on material impacts</li>
                    <li>• Stakeholder-centric approach</li>
                    <li>• Universal standards + topic-specific</li>
                  </ul>
                </div>

                {/* SASB/ISSB */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-blue-800">SASB/ISSB</h3>
                  </div>
                  <ul className="text-blue-700 space-y-2 text-sm">
                    <li>• Industry-specific standards</li>
                    <li>• Investor-focused metrics</li>
                    <li>• Financial materiality emphasis</li>
                    <li>• Climate disclosure standards</li>
                  </ul>
                </div>

                {/* Integrated Reporting */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-purple-800">Integrated Reporting</h3>
                  </div>
                  <ul className="text-purple-700 space-y-2 text-sm">
                    <li>• Value creation focus</li>
                    <li>• Six capitals framework</li>
                    <li>• Strategic connectivity</li>
                    <li>• Concise communication</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ESG in Practice - Sector Spotlight */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Building className="w-8 h-8 text-amber-600" />
                <h2 className="text-2xl font-bold text-slate-800">ESG in Practice</h2>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  Technology Sector
                </span>
              </div>

              <div className="space-y-4">
                {topCompanies.slice(0, 3).map((company, index) => (
                  <div key={company.symbol} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">{company.prototypeData?.logo || '🏢'}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{company.companyName}</h4>
                          <span className="text-sm text-slate-600">{company.symbol}</span>
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${getScoreColor(company.esgScore)}`}>
                        {company.esgScore.toFixed(1)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(company.environmentScore)}`}>
                          {company.environmentScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-green-600">E</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(company.socialScore)}`}>
                          {company.socialScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-blue-600">S</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(company.governanceScore)}`}>
                          {company.governanceScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-purple-600">G</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Best Practices */}
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-3">Best Practices Checklist</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 text-sm">Diverse board composition</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 text-sm">Carbon reduction targets</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 text-sm">Employee wellness programs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 text-sm">Transparent reporting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Quiz */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <HelpCircle className="w-8 h-8 text-indigo-600" />
                <h2 className="text-2xl font-bold text-slate-800">Quick Quiz</h2>
              </div>

              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-800 mb-3">
                    Question {quizQuestion + 1} of {quizQuestions.length}
                  </h3>
                  <p className="text-slate-700">{quizQuestions[quizQuestion].question}</p>
                </div>

                <div className="space-y-2">
                  {quizQuestions[quizQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(index)}
                      disabled={quizAnswered}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        quizAnswered
                          ? index === quizQuestions[quizQuestion].correct
                            ? 'bg-green-50 border-green-300 text-green-800'
                            : index === selectedAnswer
                            ? 'bg-red-50 border-red-300 text-red-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                          : 'hover:bg-indigo-50 border-gray-200 text-slate-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {quizAnswered && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800 text-sm">
                      <strong>
                        {selectedAnswer === quizQuestions[quizQuestion].correct ? 'Correct!' : 'Not quite.'}
                      </strong>
                      {' '}{quizQuestions[quizQuestion].explanation}
                    </p>
                    <button
                      onClick={nextQuestion}
                      className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      {quizQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Start Over'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage; 