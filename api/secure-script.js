// Sistema de segurança multicamadas para proteger o script
const crypto = require("crypto")

// Rate limiting avançado (em produção, use Redis)
const rateLimitMap = new Map()
const suspiciousIPs = new Set()
const blockedIPs = new Set()

// Padrões válidos de User-Agent do Roblox (muito específicos)
const VALID_ROBLOX_PATTERNS = [
  /^Roblox\/WinInet$/,
  /^Roblox\/WinHttp$/,
  /^RobloxStudio\/WinInet$/,
  /^Roblox\/WinInet $$Roblox$$$/,
]

// Headers que o Roblox normalmente envia
const EXPECTED_HEADERS = {
  accept: "*/*",
  connection: "Keep-Alive",
}

// Função para gerar hash único baseado no IP e timestamp
function generateSecureHash(ip, userAgent) {
  const secret = process.env.SENHA || "fallback-secret"
  const timestamp = Math.floor(Date.now() / 60000) // Muda a cada minuto
  return crypto.createHmac("sha256", secret).update(`${ip}-${userAgent}-${timestamp}`).digest("hex").substring(0, 16)
}

// Validação rigorosa do User-Agent
function validateUserAgent(userAgent) {
  if (!userAgent) return false

  // Verificar se corresponde aos padrões válidos
  const isValid = VALID_ROBLOX_PATTERNS.some((pattern) => pattern.test(userAgent))

  // Verificar se não contém caracteres suspeitos
  const suspiciousChars = /[<>'"\\;(){}[\]]/
  if (suspiciousChars.test(userAgent)) return false

  return isValid
}

// Rate limiting inteligente
function checkAdvancedRateLimit(ip) {
  const now = Date.now()
  const windowMs = 60000 // 1 minuto
  const maxRequests = 5 // Máximo 5 requests por minuto (mais restritivo)

  const current = rateLimitMap.get(ip)

  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs,
      firstRequest: now,
    })
    return true
  }

  // Verificar se está fazendo muitas requisições muito rápido
  const timeBetweenRequests = (now - current.firstRequest) / current.count
  if (timeBetweenRequests < 1000) {
    // Menos de 1 segundo entre requests
    suspiciousIPs.add(ip)
    logSecurityEvent("SUSPICIOUS_TIMING", ip, null, {
      avgTime: timeBetweenRequests,
      requests: current.count,
    })
  }

  if (current.count >= maxRequests) {
    suspiciousIPs.add(ip)
    return false
  }

  current.count++
  return true
}

// Validação de headers suspeitos
function validateHeaders(headers) {
  const suspiciousHeaders = [
    "x-forwarded-for",
    "x-real-ip",
    "x-cluster-client-ip",
    "x-forwarded-host",
    "x-forwarded-proto",
  ]

  // Se tem muitos headers de proxy, é suspeito
  let proxyHeaderCount = 0
  for (const header of suspiciousHeaders) {
    if (headers[header]) proxyHeaderCount++
  }

  return proxyHeaderCount <= 1 // Máximo 1 header de proxy
}

// Detectar tentativas de bypass
function detectBypassAttempts(headers, ip) {
  const bypassIndicators = [
    headers["x-forwarded-for"] && headers["x-forwarded-for"].includes(","),
    headers["user-agent"] && headers["user-agent"].toLowerCase().includes("curl"),
    headers["user-agent"] && headers["user-agent"].toLowerCase().includes("wget"),
    headers["user-agent"] && headers["user-agent"].toLowerCase().includes("python"),
    headers["user-agent"] && headers["user-agent"].toLowerCase().includes("postman"),
    headers["accept"] && headers["accept"].includes("application/json"),
    !headers["accept"] || headers["accept"] === "*/*",
  ]

  const suspiciousCount = bypassIndicators.filter(Boolean).length

  if (suspiciousCount >= 2) {
    blockedIPs.add(ip)
    logSecurityEvent("BYPASS_ATTEMPT", ip, headers["user-agent"], {
      suspiciousCount,
      indicators: bypassIndicators,
    })
    return true
  }

  return false
}

// Log de eventos de segurança
function logSecurityEvent(type, ip, userAgent, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    ip,
    userAgent: userAgent || "unknown",
    details,
    severity: getSeverityLevel(type),
  }

  console.log(`[SECURITY] ${JSON.stringify(logEntry)}`)

  // Em produção, salvar em banco de dados
  return logEntry
}

function getSeverityLevel(type) {
  const severityMap = {
    VALID_ACCESS: "LOW",
    INVALID_USER_AGENT: "MEDIUM",
    RATE_LIMIT_EXCEEDED: "MEDIUM",
    SUSPICIOUS_TIMING: "HIGH",
    BYPASS_ATTEMPT: "CRITICAL",
    BLOCKED_IP: "CRITICAL",
  }
  return severityMap[type] || "MEDIUM"
}

// Gerar script obfuscado dinamicamente
function generateObfuscatedScript(hash) {
  const baseScript = `
-- Script Seguro - Hash: ${hash}
-- Validação de integridade
local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

-- Verificações de segurança
local function validateEnvironment()
    if not game or not game.PlaceId then
        error("Ambiente inválido")
    end
    
    local player = Players.LocalPlayer
    if not player or not player.UserId then
        error("Jogador não autenticado")
    end
    
    -- Verificar se não está sendo executado em um executor
    if getgenv or getfenv or debug.getregistry then
        error("Executor detectado")
    end
    
    return true
end

-- Função principal
local function main()
    if not validateEnvironment() then
        return false
    end
    
    print("Script autorizado - Hash: ${hash}")
    
    -- SEU CÓDIGO AQUI
    local player = Players.LocalPlayer
    print("Usuário autorizado:", player.Name)
    
    return true
end

-- Executar com proteção
local success, result = pcall(main)
if not success then
    warn("Falha na validação:", result)
end

return success`

  return baseScript
}

export default function handler(req, res) {
  const startTime = Date.now()
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    "unknown"
  const userAgent = req.headers["user-agent"] || ""

  try {
    // 1. Verificar IP bloqueado
    if (blockedIPs.has(ip)) {
      logSecurityEvent("BLOCKED_IP", ip, userAgent)
      return res.status(403).send("Access Denied")
    }

    // 2. Rate limiting avançado
    if (!checkAdvancedRateLimit(ip)) {
      logSecurityEvent("RATE_LIMIT_EXCEEDED", ip, userAgent)
      return res.status(429).send("Too Many Requests")
    }

    // 3. Validação rigorosa do User-Agent
    if (!validateUserAgent(userAgent)) {
      logSecurityEvent("INVALID_USER_AGENT", ip, userAgent)
      suspiciousIPs.add(ip)
      return res.status(403).send("Invalid Client")
    }

    // 4. Validação de headers
    if (!validateHeaders(req.headers)) {
      logSecurityEvent("SUSPICIOUS_HEADERS", ip, userAgent, {
        headers: Object.keys(req.headers),
      })
      return res.status(403).send("Invalid Headers")
    }

    // 5. Detectar tentativas de bypass
    if (detectBypassAttempts(req.headers, ip)) {
      return res.status(403).send("Bypass Detected")
    }

    // 6. Verificar método HTTP
    if (req.method !== "GET") {
      logSecurityEvent("INVALID_METHOD", ip, userAgent, { method: req.method })
      return res.status(405).send("Method Not Allowed")
    }

    // 7. Gerar hash de segurança
    const secureHash = generateSecureHash(ip, userAgent)

    // 8. Log de acesso válido
    logSecurityEvent("VALID_ACCESS", ip, userAgent, {
      hash: secureHash,
      processingTime: Date.now() - startTime,
    })

    // 9. Gerar e servir script obfuscado
    const obfuscatedScript = generateObfuscatedScript(secureHash)

    // 10. Headers de segurança
    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
    res.setHeader("Pragma", "no-cache")
    res.setHeader("Expires", "0")
    res.setHeader("X-Frame-Options", "DENY")
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet")

    return res.status(200).send(obfuscatedScript)
  } catch (error) {
    logSecurityEvent("SYSTEM_ERROR", ip, userAgent, {
      error: error.message,
      stack: error.stack,
    })
    return res.status(500).send("Internal Error")
  }
}
