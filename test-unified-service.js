// Test script for unified ESG data service
import { getUnifiedESGData, searchUnifiedESGCompanies } from './src/services/esgDataService.js';

async function testUnifiedService() {
  try {
    console.log('🧪 Testing Unified ESG Data Service...\n');
    
    // Test with a few companies
    const testTickers = ['AAPL', 'MSFT', 'TSLA', 'GOOGL'];
    
    for (const ticker of testTickers) {
      console.log(`📊 Testing ${ticker}...`);
      
      const data = await getUnifiedESGData(ticker);
      
      if (data) {
        console.log(`✅ Found data for ${ticker}:`);
        console.log(`   Company: ${data.companyName}`);
        console.log(`   Sector: ${data.sector}`);
        console.log(`   ESG Score: ${data.esgScore}`);
        console.log(`   Environmental: ${data.environmentScore}`);
        console.log(`   Social: ${data.socialScore}`);
        console.log(`   Governance: ${data.governanceScore}`);
        console.log(`   Data Source: ${data.dataSource}`);
        console.log(`   Last Updated: ${data.lastUpdated}`);
        console.log('');
      } else {
        console.log(`❌ No data found for ${ticker}\n`);
      }
    }
    
    // Test search functionality
    console.log('🔍 Testing search functionality...');
    const searchResults = await searchUnifiedESGCompanies('tech');
    console.log(`Found ${searchResults.length} tech companies`);
    
    searchResults.forEach(company => {
      console.log(`   ${company.symbol} - ${company.companyName} (${company.dataSource})`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUnifiedService(); 