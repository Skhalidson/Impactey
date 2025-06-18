// Test script for FinancialModelingPrep API
import axios from 'axios';

const API_KEY = 'GLrZCQn3n4erOKonZ0mRSYLbHyh9nCgU';

async function testESGAPI() {
  try {
    console.log('Testing FinancialModelingPrep ESG API...');
    
    // Test with different companies
    const companies = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN'];
    
    for (const ticker of companies) {
      console.log(`\n🔍 Testing ${ticker}...`);
      
      const url = `https://financialmodelingprep.com/api/v3/esg-environmental-social-governance/${ticker}?apikey=${API_KEY}`;
      
      const response = await axios.get(url, {
        timeout: 10000,
      });

      if (response.data && response.data.length > 0) {
        console.log(`✅ Found ESG data for ${ticker}!`);
        const scores = response.data[0];
        console.log(`Symbol: ${scores.symbol}`);
        console.log(`ESG Score: ${scores.esgScore}`);
        console.log(`Environmental Score: ${scores.environmentScore}`);
        console.log(`Social Score: ${scores.socialScore}`);
        console.log(`Governance Score: ${scores.governanceScore}`);
      } else {
        console.log(`❌ No ESG data found for ${ticker}`);
      }
    }

    // Test company profile to see what data is available
    console.log('\n🔍 Testing company profile endpoint...');
    const profileUrl = `https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=${API_KEY}`;
    const profileResponse = await axios.get(profileUrl, { timeout: 10000 });
    
    if (profileResponse.data && profileResponse.data.length > 0) {
      console.log('✅ Company profile data available');
      console.log('Available fields:', Object.keys(profileResponse.data[0]));
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testESGAPI(); 