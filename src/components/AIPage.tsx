import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, Lightbulb, Settings, Copy, RotateCcw, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService, ChatMessage } from '../services/aiService';

interface AIPageProps {
  onNavigate: (page: string) => void;
}

const AIPage: React.FC<AIPageProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQuestions = aiService.getSuggestedQuestions();

  useEffect(() => {
    // Welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm Impactey AI, your ESG investment advisor. I have comprehensive data on 20+ companies across multiple sectors and can help you with:

• ESG performance analysis and comparisons
• Investment recommendations based on sustainability metrics
• Explanations of ESG controversies and their implications
• Sector-specific ESG insights and trends
• Portfolio ESG optimization strategies

${aiService.generateInsightSummary()}

What would you like to know about ESG investing?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Ensure page scrolls to very top when AI page loads
    const scrollTimeout = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);

    return () => clearTimeout(scrollTimeout);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(text, messages);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or check your API key settings.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearConversation = () => {
    setMessages([]);
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm Impactey AI, your ESG investment advisor. ${aiService.generateInsightSummary()}

What would you like to know about ESG investing?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const saveApiKey = () => {
    aiService.setApiKey(apiKey);
    setShowSettings(false);
  };

  const formatMessage = (content: string) => {
    // Simple formatting for markdown-like content
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
              Impactey AI
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your ESG investment advisor powered by AI. Ask questions about ESG performance, company analysis, and sustainable investing strategies.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Suggested Questions Sidebar */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div 
                className="flex items-center space-x-2 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatDelay: 3,
                    ease: "easeInOut" 
                  }}
                >
                  <Lightbulb className="w-5 h-5 text-emerald-600" />
                </motion.div>
                <h3 className="font-semibold text-slate-800">Suggested Questions</h3>
              </motion.div>
              <div className="space-y-2">
                <AnimatePresence>
                  {suggestedQuestions.slice(0, 6).map((question, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSendMessage(question)}
                      disabled={isLoading}
                      className="w-full text-left p-3 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                      whileHover={{ 
                        scale: 1.02, 
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {question}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-3">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">API Settings</span>
                </button>
                <button
                  onClick={clearConversation}
                  className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm">Clear Chat</span>
                </button>
              </div>

              {showSettings && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    OpenAI API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                  />
                  <button
                    onClick={saveApiKey}
                    className="w-full bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-emerald-700"
                  >
                    Save Key
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                    If no API key is provided, mock responses will be used for demonstration.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg flex flex-col h-[600px]">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'assistant' && (
                          <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: formatMessage(message.content)
                            }}
                          />
                          <div className="flex items-center justify-between mt-3">
                            <span className={`text-xs ${
                              message.role === 'user' ? 'text-emerald-100' : 'text-slate-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.role === 'assistant' && (
                              <button
                                onClick={() => copyMessage(message.content)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                                title="Copy message"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Loader className="w-3 h-3 text-white animate-spin" />
                      </div>
                      <span className="text-slate-600">Thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about ESG performance, company analysis, or investment strategies..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>{inputMessage.length}/500</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Suggested Questions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">More Questions to Try</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestedQuestions.slice(6).map((question, index) => (
              <button
                key={index + 6}
                onClick={() => handleSendMessage(question)}
                disabled={isLoading}
                className="text-left p-3 text-sm border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 mb-1" />
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPage; 