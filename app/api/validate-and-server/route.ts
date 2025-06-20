import { type NextRequest, NextResponse } from "next/server"

// Rate limiting simples (em produção, use Redis ou similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Lista de IPs bloqueados (exemplo)
const blockedIPs = new Set([
  // Adicione IPs suspeitos aqui
])

// Validação mais rigorosa do User-Agent do Roblox
function isValidRobloxUserAgent(userAgent: string): boolean {
  const validPatterns = [/^Roblox\/WinInet$/, /^Roblox\/WinHttp$/, /^RobloxStudio\/WinInet$/]

  return validPatterns.some((pattern) => pattern.test(userAgent))
}

// Rate limiting
function checkRateLimit(ip: string): boolean {
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
function logSecurityEvent(type: string, ip: string, userAgent: string, details?: any) {
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

export async function GET(request: NextRequest) {
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || ""

  // Verificar IP bloqueado
  if (blockedIPs.has(ip)) {
    logSecurityEvent("BLOCKED_IP", ip, userAgent)
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Rate limiting
  if (!checkRateLimit(ip)) {
    logSecurityEvent("RATE_LIMIT_EXCEEDED", ip, userAgent)
    return new NextResponse("Too Many Requests", { status: 429 })
  }

  // Validação rigorosa do User-Agent
  if (!isValidRobloxUserAgent(userAgent)) {
    logSecurityEvent("INVALID_USER_AGENT", ip, userAgent)
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Verificações adicionais de segurança
  const suspiciousHeaders = ["x-forwarded-host", "x-real-ip", "x-cluster-client-ip"]

  for (const header of suspiciousHeaders) {
    if (request.headers.get(header)) {
      logSecurityEvent("SUSPICIOUS_HEADER", ip, userAgent, { header })
    }
  }

  // Log de acesso válido
  logSecurityEvent("VALID_ACCESS", ip, userAgent)

  // Servir o script Lua
  const luaScript = `
-- Script Lua seguro
-- Validação adicional pode ser feita aqui
print("Acesso autorizado para Roblox")

-- Seu código Lua aqui
local function secureFunction()
    -- Implementar lógica do seu script
    return "Script executado com sucesso"
end

return secureFunction()
`

  return new NextResponse(luaScript, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
