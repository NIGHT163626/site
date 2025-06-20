// Endpoint para visualizar logs de segurança
export default function handler(req, res) {
  // Pegar a senha da variável de ambiente do Vercel
  const SENHA = process.env.SENHA

  // Se não tiver a variável configurada
  if (!SENHA) {
    console.error("❌ SENHA não configurada no Vercel!")
    return res.status(500).json({ error: "Configuração inválida" })
  }

  const authHeader = req.headers.authorization

  // Verificar se a senha está correta
  if (authHeader !== `Bearer ${SENHA}`) {
    console.log("🚫 Tentativa de acesso negada:", authHeader)
    return res.status(401).json({ error: "Acesso negado" })
  }

  console.log("✅ Acesso autorizado ao dashboard")

  // Em produção, você buscaria os logs de um banco de dados
  const mockLogs = [
    {
      timestamp: new Date().toISOString(),
      type: "INVALID_USER_AGENT",
      ip: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    {
      timestamp: new Date().toISOString(),
      type: "VALID_ACCESS",
      ip: "10.0.0.1",
      userAgent: "Roblox/WinInet",
    },
    {
      timestamp: new Date().toISOString(),
      type: "RATE_LIMIT_EXCEEDED",
      ip: "203.45.67.89",
      userAgent: "curl/7.68.0",
    },
  ]

  res.status(200).json({
    logs: mockLogs,
    total: mockLogs.length,
  })
}
