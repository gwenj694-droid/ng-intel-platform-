exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
 
  try {
    const { prompt, answer } = JSON.parse(event.body);
 
    if (!prompt || !answer) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing prompt or answer' }) };
    }
 
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 350,
        messages: [{
          role: 'user',
          content: `${prompt}\n\nStudent's answer:\n"${answer}"`
        }]
      })
    });
 
    const data = await response.json();
 
    if (data.error) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: data.error.message }) };
    }
 
    const text = data.content?.[0]?.text || 'Feedback unavailable. Please try again.';
    return { statusCode: 200, headers, body: JSON.stringify({ feedback: text }) };
 
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error: ' + err.message }) };
  }
};
