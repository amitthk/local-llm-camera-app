const fs = require('fs');
const path = require('path');

// Cache the HTML content
let htmlContent = null;

const loadHtmlContent = () => {
  if (!htmlContent) {
    const htmlPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(htmlPath)) {
      htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    } else {
      // Fallback HTML if dist doesn't exist
      htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stridecal Investment Analysis - Learn Market Trends</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 3rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; margin-bottom: 30px; }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }
        .feature {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
        }
        .loading {
            font-size: 1.1rem;
            color: #ffc107;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Stridecal Investment Analysis</h1>
        <p>Your comprehensive platform for technical and fundamental analysis</p>
        
        <div class="features">
            <div class="feature">
                <h3>📈 Technical Analysis</h3>
                <p>Advanced charting with indicators like MACD, RSI, Bollinger Bands</p>
            </div>
            <div class="feature">
                <h3>💰 Fundamental Analysis</h3>
                <p>Financial ratios, DCF analysis, and valuation methods</p>
            </div>
            <div class="feature">
                <h3>📚 Educational Content</h3>
                <p>Learn investment strategies with interactive tutorials</p>
            </div>
            <div class="feature">
                <h3>⚡ Real-time Data</h3>
                <p>Live market data and analytics for better decisions</p>
            </div>
        </div>
        
        <div class="loading">
            ⚙️ Lambda function is warming up... The full React app will load shortly!
        </div>
    </div>
    
    <script>
        // Auto-refresh after 3 seconds to load the full app
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    </script>
</body>
</html>`;
    }
  }
  return htmlContent;
};

// MIME type mapping for static assets
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

// Serve static files from dist directory
const serveStaticFile = (filePath) => {
  const fullPath = path.join(__dirname, '../dist', filePath);
  
  try {
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const content = fs.readFileSync(fullPath);
      const mimeType = getMimeType(filePath);
      const isText = mimeType.startsWith('text/') || 
                     mimeType.startsWith('application/json') || 
                     mimeType.startsWith('application/javascript');
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000', // 1 year cache for assets
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: isText ? content.toString() : content.toString('base64'),
        isBase64Encoded: !isText
      };
    }
  } catch (error) {
    console.error('Error serving static file:', error);
  }
  
  return null;
};

// Main Lambda handler
exports.handler = async (event, context) => {
  // Handle warmup events
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUp - Lambda is warm!');
    return { statusCode: 200, body: 'Lambda is warm!' };
  }

  console.log('Event:', JSON.stringify(event, null, 2));
  
  const { path: requestPath, httpMethod, headers, queryStringParameters, body } = event;
  
  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: ''
    };
  }

  // Remove leading slash and decode path
  const cleanPath = decodeURIComponent(requestPath.replace(/^\/+/, ''));
  
  // Try to serve static file first
  if (httpMethod === 'GET') {
    // Check for static assets
    if (cleanPath.includes('.') && !cleanPath.endsWith('/')) {
      const staticResponse = serveStaticFile(cleanPath);
      if (staticResponse) {
        return staticResponse;
      }
    }
    
    // Check for assets in assets folder
    if (cleanPath.startsWith('assets/')) {
      const staticResponse = serveStaticFile(cleanPath);
      if (staticResponse) {
        return staticResponse;
      }
    }
  }

  // API routes handling
  if (requestPath.startsWith('/api/')) {
    const apiPath = requestPath.replace('/api', '');
    
    // Health check endpoint
    if (apiPath === '/health') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        })
      };
    }
    
    // Analytics endpoint (mock for now)
    if (apiPath === '/analytics' && httpMethod === 'POST') {
      try {
        const analyticsData = JSON.parse(body || '{}');
        console.log('Analytics event:', analyticsData);
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ success: true, received: analyticsData })
        };
      } catch (error) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Invalid JSON' })
        };
      }
    }
    
    // Stock data endpoint (mock data)
    if (apiPath === '/stock-data') {
      const symbol = queryStringParameters?.symbol || 'DEMO';
      const mockData = generateMockStockData(symbol);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(mockData)
      };
    }
    
    // Default API response
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'API endpoint not found' })
    };
  }

  // For all other routes, serve the React app
  const html = loadHtmlContent();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: html
  };
};

// Generate mock stock data for demo purposes
function generateMockStockData(symbol) {
  const periods = 100;
  const data = [];
  let price = 150 + Math.random() * 100;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periods);
  
  for (let i = 0; i < periods; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const volatility = 0.02;
    const trend = 0.001;
    const randomChange = (Math.random() - 0.5) * volatility;
    
    price = price * (1 + trend + randomChange);
    
    const open = price * (1 + (Math.random() - 0.5) * 0.01);
    const high = Math.max(open, price) * (1 + Math.random() * 0.02);
    const low = Math.min(open, price) * (1 - Math.random() * 0.02);
    const close = price;
    const volume = Math.floor(Math.random() * 10000000 + 1000000);
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume
    });
  }
  
  return {
    symbol,
    data,
    lastUpdated: new Date().toISOString(),
    source: 'mock-data'
  };
}
