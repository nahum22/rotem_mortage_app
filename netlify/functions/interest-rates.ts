import type { Handler } from '@netlify/functions';

export const handler: Handler = async () => {
  // מאפשר CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // טיפול ב-preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const response = await fetch('https://www.boi.org.il/PublicApi/GetInterest', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`BOI API returned ${response.status}`);
    }
    
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error fetching from BOI:', error);
    
    // החזר ריביות ברירת מחדל במקרה של שגיאה
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        currentInterest: 4.5,
        fallback: true
      })
    };
  }
};
