// api/block.js - Bloqueio padrão
export default function handler(req, res) {
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  // Log de tentativa de acesso
  console.log(`[BLOCKED] ${new Date().toISOString()} | UA: ${userAgent} | Path: ${req.url}`);
  
  res.status(403).send(`
<!DOCTYPE html>
<html>
<head>
    <title>Access Denied</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #1a1a1a; 
            color: #ff4444; 
            text-align: center; 
            padding: 50px;
            margin: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #2a2a2a;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(255, 68, 68, 0.3);
        }
        h1 { font-size: 3em; margin-bottom: 20px; }
        p { font-size: 1.2em; line-height: 1.6; }
        .code { 
            background: #1a1a1a; 
            padding: 10px; 
            border-radius: 5px; 
            font-family: monospace;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚫 ACCESS DENIED</h1>
        <p>You don't have permission to access this resource.</p>
        <div class="code">Error Code: 403 - FORBIDDEN</div>
        <p>This incident has been logged.</p>
    </div>
</body>
</html>
  `);
}
