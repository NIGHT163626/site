// API de logs melhorada
export default function handler(req, res) {
  const SENHA = process.env.SENHA

  if (!SENHA) {
    console.error("❌ SENHA não configurada no Vercel!")
    return res.status(500).json({ error: "Configuração inválida" })
  }

  const authHeader = req.headers.authorization

  if (authHeader !== `Bearer ${SENHA}`) {
    console.log("🚫 Tentativa de acesso negada ao dashboard:", authHeader)
    return res.status(401).json({ error: "Acesso negado" })
  }

  console.log("✅ Acesso autorizado ao dashboard")

  // Logs mais detalhados (em produção, buscar do banco)
  const mockLogs = [
    {
      timestamp: new Date(Date.now() - 300000).toISOString(),
      type: "INVALID_USER_AGENT",
      ip: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    {
      timestamp: new Date(Date.now() - 240000).toISOString(),
      type: "RATE_LIMITED",
      ip: "203.45.67.89",
      userAgent: "curl/7.68.0",
    },
    {
      timestamp: new Date(Date.now() - 180000).toISOString(),
      type: "VALID_ACCESS",
      ip: "10.0.0.1",
      userAgent: "Roblox/WinInet",
    },
    {
      timestamp: new Date(Date.now() - 120000).toISOString(),
      type: "INVALID_METHOD",
      ip: "172.16.0.50",
      userAgent: "Roblox/WinInet",
      details: { method: "POST" },
    },
    {
      timestamp: new Date(Date.now() - 60000).toISOString(),
      type: "VALID_ACCESS",
      ip: "10.0.0.2",
      userAgent: "RobloxStudio/WinInet",
    },
  ]

  // Estatísticas avançadas
  const stats = {
    total: mockLogs.length,
    valid: mockLogs.filter((log) => log.type === "VALID_ACCESS").length,
    blocked: mockLogs.filter((log) => log.severity === "CRITICAL").length,
    suspicious: mockLogs.filter((log) => log.severity === "HIGH").length,
    lastHour: mockLogs.filter((log) => new Date(log.timestamp) > new Date(Date.now() - 3600000)).length,
  }

  res.status(200).json({
    logs: mockLogs,
    stats,
    timestamp: new Date().toISOString(),
  })
}
