import React, { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';

interface DetectedHolding {
  ticker: string;
  companyName: string;
  quantity: number;
  marketValue: number;
  weight: number;
  confidence: number;
  isValid: boolean;
}

interface PortfolioOCRUploadProps {
  onHoldingsDetected: (holdings: DetectedHolding[]) => void;
}

const PortfolioOCRUpload: React.FC<PortfolioOCRUploadProps> = ({ onHoldingsDetected }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [rawOcrText, setRawOcrText] = useState<string>('');
  const [showRawText, setShowRawText] = useState(false);
  const [detectedHoldings, setDetectedHoldings] = useState<DetectedHolding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [processingTimeout, setProcessingTimeout] = useState<number | null>(null);

  const resetState = () => {
    setUploadedImage(null);
    setRawOcrText('');
    setShowRawText(false);
    setDetectedHoldings([]);
    setError(null);
    setShowPreview(false);
    setIsProcessing(false);
    setOcrProgress(0);
    if (processingTimeout) {
      clearTimeout(processingTimeout);
      setProcessingTimeout(null);
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    resetState();
    
    if (!file.type.startsWith('image/')) {
      setError('❌ Please upload an image file (PNG, JPG, JPEG, etc.)');
      return;
    }

    // Check file size (increased limit for better quality)
    if (file.size > 15 * 1024 * 1024) {
      setError('📏 Image file is too large. Please upload an image smaller than 15MB or try cropping/resizing the image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setUploadedImage(imageUrl);
      setError(null);
      processImageWithOCR(imageUrl);
    };
    
    reader.onerror = () => {
      setError('💥 Failed to read the image file. Please try again.');
    };
    
    reader.readAsDataURL(file);
  }, []);

  const processImageWithOCR = async (imageUrl: string) => {
    setIsProcessing(true);
    setOcrProgress(0);
    setDetectedHoldings([]);
    setRawOcrText('');
    setError(null);

    // Set up 30-second timeout
    const timeoutId = setTimeout(() => {
      setError('⏰ OCR processing timed out after 30 seconds. Please try cropping the image to focus on the portfolio table, or resize to a smaller file.');
      setIsProcessing(false);
      setOcrProgress(0);
    }, 30000);
    
    setProcessingTimeout(timeoutId);

    try {
      const worker = await createWorker('eng');
      
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,-%$ ()\t\n',
        tessedit_pageseg_mode: 6 as any, // Uniform block of text
        preserve_interword_spaces: '1'
      });

      const result = await worker.recognize(imageUrl);
      
      // Clear timeout since we completed successfully
      if (processingTimeout) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
      }
      
      const text = result.data.text;
      await worker.terminate();

      setRawOcrText(text);

      const holdings = parsePortfolioText(text);
      
      setDetectedHoldings(holdings);
      setShowPreview(true);
      setShowRawText(true);

      if (holdings.length === 0) {
        setError('🔍 No portfolio holdings detected. Please check the raw text below and ensure the image shows a clear portfolio table with ticker symbols.');
      }

    } catch (err) {
      // Clear timeout on error
      if (processingTimeout) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('OCR processing failed:', err);
      
      if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        setError('🌐 OCR processing failed due to network issues. Please check your internet connection and try again.');
      } else if (errorMessage.includes('memory') || errorMessage.includes('size')) {
        setError('💾 Image is too complex to process. Please try cropping to show only the portfolio table or resize to a smaller file.');
      } else {
        setError(`💥 Failed to process the image: ${errorMessage}. Please try the test button below or manual entry.`);
      }
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const parsePortfolioText = (text: string): DetectedHolding[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const holdings: DetectedHolding[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip header lines and empty lines
      if (trimmedLine.length < 3 || 
          /^(portfolio|holdings?|ticker|symbol|company|name|quantity|amount|value|weight|allocation|%|\$|total)/i.test(trimmedLine)) {
        continue;
      }

      // Enhanced regex patterns for better parsing
      const tickerMatch = trimmedLine.match(/\b[A-Z]{1,5}[0-9]?\b/);
      
      if (!tickerMatch) continue;
      
      const ticker = tickerMatch[0];
      
      // Skip common false positives
      if (['THE', 'AND', 'FOR', 'YOU', 'ARE', 'NOT', 'BUT', 'CAN', 'ALL', 'NEW', 'GET', 'NOW', 'TOP', 'INC', 'LLC', 'ETF', 'USD'].includes(ticker)) {
        continue;
      }

      // Extract company name (text between ticker and first number/dollar sign)
      const tickerIndex = trimmedLine.indexOf(ticker);
      const afterTicker = trimmedLine.substring(tickerIndex + ticker.length).trim();
      
      // Find company name (everything before the first number or dollar sign)
      const companyMatch = afterTicker.match(/^([^$0-9]+?)(?=\s*[\d$])/);
      const companyName = companyMatch ? companyMatch[1].trim() : '';

      // Enhanced value extraction with better patterns
      const dollarAmounts = trimmedLine.match(/\$[\d,]+\.?\d*/g);
      const numbers = trimmedLine.match(/(?<!\$)(?<!\.)(?<![,\d])\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?(?!\d)/g);
      const percentages = trimmedLine.match(/\d+\.?\d*%/g);

      let quantity = 0;
      let marketValue = 0;
      let weight = 0;

      // Parse quantities (usually smaller whole numbers)
      if (numbers) {
        const numValues = numbers.map(n => parseFloat(n.replace(/,/g, '')));
        quantity = numValues.find(n => n > 0 && n < 10000 && n % 1 === 0) || 0;
        
        // If no clear quantity found, use first reasonable number
        if (quantity === 0) {
          quantity = numValues.find(n => n > 0 && n < 100000) || 0;
        }
      }

      // Parse market values (dollar amounts)
      if (dollarAmounts) {
        const values = dollarAmounts.map(amount => 
          parseFloat(amount.replace(/[$,]/g, ''))
        );
        marketValue = Math.max(...values);
      }

      // Parse weights (percentages)
      if (percentages) {
        const weights = percentages.map(p => parseFloat(p.replace('%', '')));
        weight = Math.max(...weights);
      }

      // Confidence scoring based on data completeness
      let confidence = 0.3; // Base confidence for having a ticker
      if (companyName.length > 0) confidence += 0.2;
      if (quantity > 0) confidence += 0.2;
      if (marketValue > 0) confidence += 0.2;
      if (weight > 0) confidence += 0.1;

      // Validate ticker format
      const isValid = /^[A-Z]{1,5}[0-9]?$/.test(ticker) && confidence > 0.4;

      holdings.push({
        ticker,
        companyName: companyName || `${ticker} Holdings`,
        quantity: quantity || 0,
        marketValue: marketValue || 0,
        weight: weight || 0,
        confidence: Math.round(confidence * 100) / 100,
        isValid
      });
    }

    // Sort by confidence and remove duplicates
    const uniqueHoldings = holdings.filter((holding, index, self) => 
      index === self.findIndex(h => h.ticker === holding.ticker)
    ).sort((a, b) => b.confidence - a.confidence);

    return uniqueHoldings;
  };

  const testOCRWithSampleText = () => {
    const sampleText = `Portfolio Holdings Summary
    
AAPL    Apple Inc.                      50      $11,250.00    8.97%
MSFT    Microsoft Corporation           30      $13,475.10    10.74%
GOOGL   Alphabet Inc. Class A           25      $8,925.25     7.11%
AMZN    Amazon.com Inc.                 40      $7,680.00     6.12%
TSLA    Tesla Inc.                      35      $9,450.50     7.53%
SPY     SPDR S&P 500 ETF Trust         100      $48,250.00    38.46%
VTI     Vanguard Total Stock Market     75      $16,425.75    13.07%

Total Portfolio Value: $125,456.60`;

    setRawOcrText(sampleText);
    setShowRawText(true);
    
    const holdings = parsePortfolioText(sampleText);
    setDetectedHoldings(holdings);
    setShowPreview(true);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const updateHolding = (index: number, updates: Partial<DetectedHolding>) => {
    setDetectedHoldings(prev => 
      prev.map((holding, i) => 
        i === index ? { ...holding, ...updates } : holding
      )
    );
  };

  const removeHolding = (index: number) => {
    setDetectedHoldings(prev => prev.filter((_, i) => i !== index));
  };

  const confirmHoldings = () => {
    const validHoldings = detectedHoldings.filter(h => 
      h.ticker.trim() && (h.quantity > 0 || h.marketValue > 0)
    );
    
    if (validHoldings.length === 0) {
      setError('⚠️ Please ensure at least one holding has a valid ticker and either quantity or market value.');
      return;
    }
    
    onHoldingsDetected(validHoldings);
  };

  const retryOCR = () => {
    if (uploadedImage) {
      processImageWithOCR(uploadedImage);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">📸 OCR Portfolio Upload</h3>
      
      {!uploadedImage && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <div className="space-y-3">
            <div className="text-3xl sm:text-4xl">📷</div>
            <div>
              <p className="text-base sm:text-lg font-medium text-gray-700">
                Upload Portfolio Screenshot
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Drag & drop or click to select an image (PNG, JPG)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max size: 15MB • For best results: crop to show only the portfolio table
              </p>
            </div>
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}

      {uploadedImage && (
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
            <h4 className="font-medium text-gray-700">Uploaded Image:</h4>
            <div className="flex gap-2">
              {!isProcessing && (
                <button
                  onClick={retryOCR}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  🔄 Retry OCR
                </button>
              )}
              <button
                onClick={resetState}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
          <img 
            src={uploadedImage} 
            alt="Uploaded portfolio" 
            className="max-w-full h-auto rounded border max-h-64 object-contain mx-auto"
          />
        </div>
      )}

      {isProcessing && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-800 font-medium">Processing image with OCR...</span>
          </div>
          <p className="text-sm text-blue-600">
            This may take up to 30 seconds. Please wait...
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
          {uploadedImage && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                onClick={retryOCR}
                className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
              >
                🔄 Retry
              </button>
              <button
                onClick={resetState}
                className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                📤 Upload Different Image
              </button>
            </div>
          )}
        </div>
      )}

      {rawOcrText && showRawText && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-700">📝 Raw OCR Text:</h4>
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              {showRawText ? '🔽 Hide' : '🔼 Show'}
            </button>
          </div>
          {showRawText && (
            <div className="bg-gray-50 p-3 rounded border text-sm font-mono max-h-40 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-xs sm:text-sm">{rawOcrText}</pre>
            </div>
          )}
        </div>
      )}

      {showPreview && detectedHoldings.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-3">📊 Detected Holdings (Edit as needed):</h4>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {detectedHoldings.map((holding, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-6 gap-2 p-3 border rounded bg-gray-50">
                <div className="sm:col-span-1">
                  <label className="block text-xs text-gray-500 mb-1">Ticker</label>
                  <input
                    type="text"
                    value={holding.ticker}
                    onChange={(e) => updateHolding(index, { ticker: e.target.value.toUpperCase() })}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="AAPL"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={holding.companyName}
                    onChange={(e) => updateHolding(index, { companyName: e.target.value })}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="Apple Inc."
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={holding.quantity || ''}
                    onChange={(e) => updateHolding(index, { quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="100"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs text-gray-500 mb-1">Value ($)</label>
                  <input
                    type="number"
                    value={holding.marketValue || ''}
                    onChange={(e) => updateHolding(index, { marketValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border rounded text-sm"
                    placeholder="10000"
                  />
                </div>
                <div className="sm:col-span-1 flex flex-col justify-end">
                  <button
                    onClick={() => removeHolding(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors h-8"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={confirmHoldings}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              ✅ Add {detectedHoldings.length} Holdings to Portfolio
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={testOCRWithSampleText}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            🧪 Test with Sample Portfolio Data
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          💡 For best results: Use clear screenshots showing ticker symbols, company names, and values in a table format
        </p>
      </div>
    </div>
  );
};

export default PortfolioOCRUpload;
