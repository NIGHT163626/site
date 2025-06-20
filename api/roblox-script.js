// Versão simplificada que funciona + segurança básica
const rateLimitMap = new Map()
const suspiciousIPs = new Set()

// Validação básica mas efetiva
function isValidRobloxUserAgent(userAgent) {
  if (!userAgent) return false

  // Padrões válidos do Roblox
  const validPatterns = [/^Roblox\/WinInet$/, /^Roblox\/WinHttp$/, /^RobloxStudio\/WinInet$/]

  // Se não corresponde aos padrões válidos, verificar se pelo menos contém "Roblox"
  const hasRoblox = userAgent.includes("Roblox")
  const isExactMatch = validPatterns.some((pattern) => pattern.test(userAgent))

  return hasRoblox && (isExactMatch || userAgent.length < 50) // Evitar user-agents muito longos
}

// Rate limiting simples
function checkRateLimit(ip) {
  const now = Date.now()
  const windowMs = 60000 // 1 minuto
  const maxRequests = 10 // 10 requests por minuto

  const current = rateLimitMap.get(ip)

  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    suspiciousIPs.add(ip)
    return false
  }

  current.count++
  return true
}

// Log de segurança
function logAccess(type, ip, userAgent, details = {}) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      type,
      ip,
      userAgent,
      details,
    }),
  )
}

export default function handler(req, res) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    "unknown"
  const userAgent = req.headers["user-agent"] || ""

  // 1. Rate limiting
  if (!checkRateLimit(ip)) {
    logAccess("RATE_LIMITED", ip, userAgent)
    return res.status(429).send("Too Many Requests")
  }

  // 2. Validação do User-Agent
  if (!isValidRobloxUserAgent(userAgent)) {
    logAccess("INVALID_USER_AGENT", ip, userAgent)
    return res.status(403).send("Forbidden")
  }

  // 3. Verificar método
  if (req.method !== "GET") {
    logAccess("INVALID_METHOD", ip, userAgent, { method: req.method })
    return res.status(405).send("Method Not Allowed")
  }

  // 4. Log de acesso válido
  logAccess("VALID_ACCESS", ip, userAgent)

  // 5. Script Lua (seu código aqui)
  const luaScript = `-- Script Lua Seguro
-- Validação de ambiente
local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local function validateEnvironment()
    if not game or not game.PlaceId then
        error("Deve ser executado no Roblox")
    end
    
    local player = Players.LocalPlayer
    if not player or not player.UserId then
        error("Jogador não encontrado")
    end
    
    return true
end

local function main()
    if not validateEnvironment() then
        return false
    end
    
    print("✅ Script autorizado para:", Players.LocalPlayer.Name)
    
    -- SEU CÓDIGO PRINCIPAL AQUI
    -- Exemplo:
    print("🎮 Poison Hub carregado com sucesso!")
    
    return true
end

-- Executar com proteção
local success, result = pcall(main)
if not success then
    warn("❌ Erro:", result)
end

return success`

  // 6. Headers de segurança
  res.setHeader("Content-Type", "text/plain; charset=utf-8")
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
  res.setHeader("Pragma", "no-cache")
  res.setHeader("Expires", "0")

  return res.status(200).send(luaScript)
}
