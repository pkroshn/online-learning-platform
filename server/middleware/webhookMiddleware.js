// server/middleware/webhookMiddleware.js
const bodyParser = require('body-parser');

// Middleware to handle raw body for Stripe webhooks
const webhookMiddleware = (req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    // For webhook endpoint, skip JSON parsing (raw body will be handled in main app)
    next();
  } else {
    // For all other routes, use JSON parsing with body-parser
    bodyParser.json({ limit: '10mb' })(req, res, next);
  }
};

// Alternative approach: Create specific middleware for different content types
const createBodyParserMiddleware = () => {
  return {
    // Raw body parser for webhooks
    raw: bodyParser.raw({ type: 'application/json' }),
    
    // JSON body parser with size limit
    json: bodyParser.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        // Store raw body for webhook verification if needed
        if (req.originalUrl.includes('/webhook')) {
          req.rawBody = buf;
        }
      }
    }),
    
    // URL encoded parser
    urlencoded: bodyParser.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    })
  };
};

module.exports = {
  webhookMiddleware,
  createBodyParserMiddleware
};