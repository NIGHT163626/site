"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface SecurityLog {
  timestamp: string
  type: string
  ip: string
  userAgent: string
  details?: any
}

export default function AdminDashboard() {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/security-log", {
        headers: {
          Authorization: "Bearer your-admin-token-here",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
      }
    } catch (error) {
      console.error("Erro ao buscar logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const getLogIcon = (type: string) => {
    switch (type) {
      case "VALID_ACCESS":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "BLOCKED_IP":
      case "INVALID_USER_AGENT":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "RATE_LIMIT_EXCEEDED":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Shield className="h-4 w-4 text-blue-500" />
    }
  }

  const getLogBadgeColor = (type: string) => {
    switch (type) {
      case "VALID_ACCESS":
        return "bg-green-100 text-green-800"
      case "BLOCKED_IP":
      case "INVALID_USER_AGENT":
        return "bg-red-100 text-red-800"
      case "RATE_LIMIT_EXCEEDED":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Segurança</h1>
          <p className="text-gray-600">Monitore acessos e eventos de segurança do seu site</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acessos Válidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {logs.filter((log) => log.type === "VALID_ACCESS").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tentativas Bloqueadas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {logs.filter((log) => log.type !== "VALID_ACCESS").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Logs de Segurança</CardTitle>
            <Button onClick={fetchLogs} disabled={loading}>
              {loading ? "Carregando..." : "Atualizar"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getLogIcon(log.type)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getLogBadgeColor(log.type)}>{log.type}</Badge>
                        <span className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        IP: {log.ip} | User-Agent: {log.userAgent.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {logs.length === 0 && <div className="text-center py-8 text-gray-500">Nenhum log encontrado</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
