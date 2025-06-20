import { type NextRequest, NextResponse } from "next/server"

// Endpoint para visualizar logs de segurança (apenas para administradores)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  // Verificação simples de autenticação (em produção, use JWT ou similar)
  if (authHeader !== "Bearer your-admin-token-here") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

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
  ]

  return NextResponse.json({
    logs: mockLogs,
    total: mockLogs.length,
  })
}
