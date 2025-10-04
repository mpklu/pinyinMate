import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Only allow specific trusted domains
  const allowedDomains = [
    'raw.githubusercontent.com',
    'api.github.com'
  ];
  
  try {
    const urlObj = new URL(url);
    if (!allowedDomains.includes(urlObj.hostname)) {
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PinyinMate-App',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `External request failed: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}