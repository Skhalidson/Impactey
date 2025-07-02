# OCR Portfolio Upload Feature

## Overview

The OCR Portfolio Upload feature allows users to extract portfolio holdings from screenshots using Optical Character Recognition (OCR). This feature uses Tesseract.js to process images and intelligently parse ticker symbols, quantities, values, and weight percentages.

## Features

### Core Functionality
- **Drag & Drop Upload**: Users can drag portfolio screenshots directly into the upload area
- **File Selection**: Click-to-browse file selection with format validation
- **Real-time OCR Processing**: Live progress indicators during text extraction
- **Intelligent Text Parsing**: Advanced regex-based parsing for ticker symbols and financial data
- **Editable Preview**: Users can review and edit detected holdings before adding to portfolio
- **Ticker Validation**: Real-time validation against our database of 98,641+ instruments

### Supported Data Extraction
- **Ticker Symbols**: 1-5 character stock/ETF symbols (e.g., AAPL, GOOGL, SPY)
- **Quantities**: Number of shares held (parsed from numerical values)
- **Market Values**: Dollar amounts associated with holdings
- **Weight Percentages**: Portfolio allocation percentages (e.g., 8.97%)
- **Company Names**: Detected and matched with ticker database

### File Support
- **Formats**: PNG, JPG, JPEG, GIF, BMP, WEBP
- **Size Limit**: 10MB maximum file size
- **Resolution**: Higher resolution images produce better OCR results
- **Layout**: Works best with tabular data from broker apps and portfolio screenshots

## Implementation

### Component Structure

```typescript
interface DetectedHolding {
  ticker: string;
  company?: string;
  quantity?: number;
  value?: number;
  weight?: number;
  confidence: number;
  isValid: boolean;
  suggested?: string;
}

interface PortfolioOCRUploadProps {
  onHoldingsDetected: (holdings: PortfolioHolding[]) => void;
}
```

### Key Functions

#### `processImageWithOCR(imageUrl: string)`
- Initializes Tesseract.js worker with English language model
- Configures character whitelist for financial data
- Provides real-time progress updates during processing
- Handles OCR errors gracefully with user feedback

#### `parsePortfolioText(text: string): DetectedHolding[]`
- Uses regex patterns to identify ticker symbols, values, and percentages
- Filters out common false positives (common English words)
- Validates tickers against our comprehensive database
- Provides fuzzy matching suggestions for invalid tickers
- Extracts associated numerical data (quantities, values, weights)

#### `updateHolding(index: number, updates: Partial<DetectedHolding>)`
- Allows real-time editing of detected holdings
- Re-validates tickers when modified
- Updates confidence scores based on validation

## User Interface

### Upload Area
```tsx
{!uploadedImage ? (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer">
    <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <p className="text-lg font-medium text-gray-700 mb-2">Upload Portfolio Screenshot</p>
    <p className="text-sm text-gray-500 mb-4">Drag and drop an image here, or click to select a file</p>
  </div>
) : (
  // Image preview with processing status
)}
```

### Progress Indicator
```tsx
{isProcessing && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div className="flex items-center mb-3">
      <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
      <span className="font-medium text-blue-800">Processing image with OCR...</span>
    </div>
    <div className="w-full bg-blue-200 rounded-full h-2">
      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${ocrProgress}%` }}></div>
    </div>
  </div>
)}
```

### Editable Holdings Table
```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-gray-200">
      <th className="text-left p-2 font-medium text-slate-700">Ticker</th>
      <th className="text-left p-2 font-medium text-slate-700">Company</th>
      <th className="text-left p-2 font-medium text-slate-700">Quantity</th>
      <th className="text-left p-2 font-medium text-slate-700">Value</th>
      <th className="text-left p-2 font-medium text-slate-700">Weight %</th>
      <th className="text-left p-2 font-medium text-slate-700">Status</th>
      <th className="text-left p-2 font-medium text-slate-700">Actions</th>
    </tr>
  </thead>
  <tbody>
    {detectedHoldings.map((holding, index) => (
      <tr key={index} className="border-b border-gray-100">
        <td className="p-2">
          <input
            type="text"
            value={holding.ticker}
            onChange={(e) => updateHolding(index, { 
              ticker: e.target.value.toUpperCase(),
              isValid: getTickerBySymbol(e.target.value) !== null
            })}
            className={`w-20 px-2 py-1 text-sm border rounded ${
              holding.isValid ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
            }`}
          />
        </td>
        // ... other editable fields
      </tr>
    ))}
  </tbody>
</table>
```

## Text Parsing Logic

### Ticker Symbol Recognition
```typescript
// Common ticker pattern: 1-5 uppercase letters, possibly with numbers
const tickerRegex = /\b[A-Z]{1,5}[0-9]?\b/g;

// Filter out common false positives
const excludeWords = ['THE', 'AND', 'FOR', 'YOU', 'ARE', 'NOT', 'BUT', 'CAN', 'ALL', 'ANY', ...];
```

### Value Extraction
```typescript
// Value patterns: $123.45, 123.45, 1,234.56
const valueRegex = /\$?[\d,]+\.?\d*/g;

// Percentage pattern: 12.5%, 12%
const percentRegex = /\d+\.?\d*%/g;
```

### Smart Value Assignment
```typescript
// Heuristic: larger numbers likely market values, smaller likely quantities
if (!isNaN(numValue)) {
  if (numValue > 1000) {
    holding.value = numValue;
  } else {
    holding.quantity = numValue;
  }
}
```

## Error Handling

### OCR Processing Errors
- Network connectivity issues
- Unsupported image formats
- Corrupted image files
- OCR engine failures

### Parsing Errors
- No ticker symbols detected
- Invalid ticker formats
- Ambiguous numerical values
- Poor image quality results

### User Feedback
```typescript
if (holdings.length === 0) {
  setError('No portfolio holdings detected. Please ensure the image shows ticker symbols clearly.');
}

catch (err) {
  console.error('OCR processing failed:', err);
  setError('Failed to process the image. Please try a clearer screenshot or manual entry.');
}
```

## Integration with Portfolio Tracker

### Data Flow
1. User uploads portfolio screenshot
2. OCR extracts text from image
3. Text is parsed for financial data
4. User reviews and edits detected holdings
5. Holdings are validated against ticker database
6. Confirmed holdings are passed to Portfolio Tracker
7. ESG analysis is performed on new holdings

### Portfolio Service Integration
```typescript
const handleOCRHoldings = async (ocrHoldings: PortfolioHolding[]) => {
  try {
    setLoading(true);
    const holdingsWithData = await portfolioService.fetchPortfolioData(ocrHoldings);
    const updatedHoldings = [...holdings, ...holdingsWithData];
    setHoldings(updatedHoldings);
    
    const portfolioAnalysis = await portfolioService.analyzePortfolio(updatedHoldings);
    setAnalysis(portfolioAnalysis);
  } catch (err) {
    setError('Failed to process OCR detected holdings');
  }
};
```

## Best Practices for Users

### Image Quality Tips
- Use good lighting with minimal shadows or glare
- Ensure ticker symbols are clearly visible and not cropped
- Include column headers if possible (Ticker, Amount, etc.)
- Screenshots from broker apps typically work best
- Avoid blurry or low-resolution images

### Supported Layouts
- **Tabular Data**: Standard portfolio tables with clear columns
- **List Format**: Vertical lists with ticker and value pairs
- **Broker Apps**: Screenshots from popular trading platforms
- **Spreadsheets**: Excel or Google Sheets portfolio tracking

### Common Issues and Solutions
- **Poor OCR Results**: Try a clearer image with better lighting
- **Invalid Tickers**: Use the suggestion system or manual correction
- **Missing Data**: Fill in quantities/values manually in the preview table
- **False Positives**: Remove unwanted entries before adding to portfolio

## Technical Dependencies

### Tesseract.js Configuration
```typescript
const worker = await createWorker('eng');

await worker.setParameters({
  tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,-%$ ()',
});

const { data: { text } } = await worker.recognize(imageUrl, {
  logger: (m: any) => {
    if (m.status === 'recognizing text') {
      setOcrProgress(Math.round(m.progress * 100));
    }
  }
} as any);
```

### Performance Considerations
- OCR processing can take 10-30 seconds for complex images
- Large images (>10MB) are rejected to prevent performance issues
- Progress indicators keep users informed during processing
- Worker is properly terminated after use to free memory

## Future Enhancements

### Potential Improvements
- Support for additional languages beyond English
- Enhanced parsing for international ticker formats
- Machine learning-based confidence scoring
- Batch processing for multiple portfolio screenshots
- Integration with popular broker APIs for direct data import
- Support for PDF portfolio statements

### Advanced Features
- Historical portfolio tracking from multiple screenshots
- Automatic duplicate detection and merging
- Enhanced fuzzy matching with Levenshtein distance
- Custom parsing rules for specific broker formats
- Export functionality for detected holdings data 