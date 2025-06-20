// Rate limiting simples (em produção, use Redis ou similar)
const rateLimitMap = new Map()

// Lista de IPs bloqueados (exemplo)
const blockedIPs = new Set([
  // Adicione IPs suspeitos aqui
])

// Validação mais rigorosa do User-Agent do Roblox
function isValidRobloxUserAgent(userAgent) {
  const validPatterns = [/^Roblox\/WinInet$/, /^Roblox\/WinHttp$/, /^RobloxStudio\/WinInet$/]

  return validPatterns.some((pattern) => pattern.test(userAgent))
}

// Rate limiting
function checkRateLimit(ip) {
  const now = Date.now()
  const windowMs = 60000 // 1 minuto
  const maxRequests = 10 // máximo 10 requests por minuto

  const current = rateLimitMap.get(ip)

  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    return false
  }

  current.count++
  return true
}

// Log de segurança
function logSecurityEvent(type, ip, userAgent, details) {
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
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || "unknown"
  const userAgent = req.headers["user-agent"] || ""

  // Verificar IP bloqueado
  if (blockedIPs.has(ip)) {
    logSecurityEvent("BLOCKED_IP", ip, userAgent)
    return res.status(403).send("Forbidden")
  }

  // Rate limiting
  if (!checkRateLimit(ip)) {
    logSecurityEvent("RATE_LIMIT_EXCEEDED", ip, userAgent)
    return res.status(429).send("Too Many Requests")
  }

  // Validação rigorosa do User-Agent
  if (!isValidRobloxUserAgent(userAgent)) {
    logSecurityEvent("INVALID_USER_AGENT", ip, userAgent)
    return res.status(403).send("Forbidden")
  }

  // Verificações adicionais de segurança
  const suspiciousHeaders = ["x-forwarded-host", "x-real-ip", "x-cluster-client-ip"]

  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      logSecurityEvent("SUSPICIOUS_HEADER", ip, userAgent, { header })
    }
  }

  // Log de acesso válido
  logSecurityEvent("VALID_ACCESS", ip, userAgent)

  // Servir o script Lua
  const luaScript = `-- Script Lua seguro
-- Validação adicional pode ser feita aqui
print("Acesso autorizado para Roblox")

-- Seu código Lua aqui
local function secureFunction()
    -- Implementar lógica do seu script
    return "Script executado com sucesso"
end

return secureFunction()`

  // Definir headers de segurança
  res.setHeader("Content-Type", "text/plain; charset=utf-8")
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("X-XSS-Protection", "1; mode=block")
  res.setHeader("Referrer-Policy", "no-referrer")
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
  res.setHeader("Pragma", "no-cache")
  res.setHeader("Expires", "0")

  res.status(200).send(luaScript)
}
