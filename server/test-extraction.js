// Test script for metadata extraction endpoint
const axios = require('axios');

const testExtraction = async () => {
  const testUrl = 'https://www.example.com/article';
  const apiUrl = 'http://localhost:3001/api/library/extract-metadata';

  console.log('Testing metadata extraction endpoint...');
  console.log(`URL to extract: ${testUrl}`);
  console.log(`API endpoint: ${apiUrl}`);

  try {
    const response = await axios.post(apiUrl, {
      url: testUrl,
      forceRefresh: false
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\nSuccess! Extracted metadata:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\nError:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(error.message);
    }
  }
};

// Run the test
testExtraction();