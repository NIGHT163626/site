// api/validate.js - Middleware de validação
export default function handler(req, res) {
  const startTime = Date.now();
  
  // === CAMADA 1: VERIFICAÇÕES BÁSICAS ===
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';
  const origin = req.headers['origin'] || '';
  
  // Verificar User-Agent
  if (!userAgent.includes('Roblox') && !userAgent.includes('RobloxStudio')) {
    return res.status(403).json({ error: 'Access denied', code: 'UA_INVALID' });
  }
  
  // === CAMADA 2: VERIFICAÇÕES AVANÇADAS ===
  
  // Verificar se não é um navegador comum
  const browserSignatures = ['Mozilla', 'Chrome', 'Safari', 'Firefox', 'Edge'];
  const isBrowser = browserSignatures.some(sig => userAgent.includes(sig));
  
  if (isBrowser && !userAgent.includes('Roblox')) {
    return res.status(403).json({ error: 'Browser access denied', code: 'BROWSER_BLOCKED' });
  }
  
  // Verificar referer suspeito
  if (referer && !referer.includes('roblox.com') && !referer.includes('rbxcdn.com')) {
    // Permitir apenas se for direto (sem referer) ou de domínios Roblox
    if (referer.length > 0) {
      return res.status(403).json({ error: 'Invalid referer', code: 'REF_INVALID' });
    }
  }
  
  // === CAMADA 3: RATE LIMITING ===
  const currentTime = Date.now();
  
  // Rate limiting simples por User-Agent
  if (!global.rateLimiter) {
    global.rateLimiter = new Map();
  }
  
  const clientKey = userAgent;
  const clientData = global.rateLimiter.get(clientKey) || { count: 0, lastReset: currentTime };
  
  // Reset counter a cada minuto
  if (currentTime - clientData.lastReset > 60000) {
    clientData.count = 0;
    clientData.lastReset = currentTime;
  }
  
  clientData.count++;
  global.rateLimiter.set(clientKey, clientData);
  
  // Máximo 30 requests por minuto
  if (clientData.count > 30) {
    return res.status(429).json({ error: 'Rate limit exceeded', code: 'RATE_LIMIT' });
  }
  
  // === CAMADA 4: VERIFICAÇÃO TEMPORAL ===
  const hour = new Date().getHours();
  const suspicious = req.query.suspicious || false;
  
  // Verificação extra durante horários suspeitos (madrugada)
  if ((hour >= 2 && hour <= 6) && suspicious) {
    return res.status(403).json({ error: 'Maintenance window', code: 'MAINTENANCE' });
  }
  
  // === CAMADA 5: TOKEN DINÂMICO ===
  const generateToken = () => {
    const timestamp = Math.floor(Date.now() / 300000); // 5 minutos
    const secret = process.env.SECRET_KEY || 'default-secret-change-me';
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(timestamp + secret + userAgent).digest('hex').substring(0, 16);
  };
  
  const validToken = generateToken();
  
  // === RESPOSTA COM SCRIPT PROTEGIDO ===
  const protectedScript = `
-- POISON HUB - SISTEMA DE SEGURANÇA AVANÇADO
-- Token: ${validToken}
-- Timestamp: ${Date.now()}

-- Verificação de ambiente
if not game or not game:GetService("Players") then
    error("Ambiente inválido detectado!")
end

-- Verificação anti-debugging
local function antiDebug()
    local success, result = pcall(function()
        return debug.getinfo(2)
    end)
    
    if success and result and result.source ~= "=[C]" then
        -- Possível debugging detectado
        game.Players.LocalPlayer:Kick("Debugging não permitido")
        return false
    end
    return true
end

-- Verificação de integridade
local function verifyIntegrity()
    local expectedToken = "${validToken}"
    local currentTime = tick()
    
    -- Verificar se o token não foi alterado
    if not expectedToken or #expectedToken ~= 16 then
        error("Token de segurança inválido!")
    end
    
    return true
end

-- Executar verificações
if not antiDebug() or not verifyIntegrity() then
    error("Verificações de segurança falharam!")
end

-- SEU SCRIPT PRINCIPAL AQUI
print("🔒 Poison Hub carregado com segurança!")
print("🚀 Todas as verificações passaram!")

-- Exemplo de funcionalidade
local Players = game:GetService("Players")
local player = Players.LocalPlayer

-- Sua lógica principal aqui...
warn("Script executado com sucesso para: " .. player.Name)
`;

  // Headers de segurança
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  
  // Log de acesso (opcional)
  console.log(`[${new Date().toISOString()}] Valid access | UA: ${userAgent.substring(0, 50)}...`);
  
  res.status(200).send(protectedScript);
}
