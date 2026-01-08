import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
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
    const response = await fetch('https://www.boi.org.il/PublicApi/GetInterest');
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Bank of Israel');
    }
    
    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('❌ Error fetching interest rates:', error);
    
    // ערכי fallback
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify([
        { InterestRateName: 'ריבית בנק ישראל', currentInterest: 4.5 },
        { InterestRateName: 'קבועה 5 שנים', currentInterest: 5.2 },
        { InterestRateName: 'משתנה', currentInterest: 3.8 }
      ])
    };
  }
};

export { handler };
