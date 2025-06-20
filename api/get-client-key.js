// API para o frontend pegar a chave (apenas para demonstração)
// ⚠️ NUNCA exponha a chave real assim em produção!
export default function handler(req, res) {
  // Verificar se é uma requisição do próprio site
  const referer = req.headers.referer
  const host = req.headers.host

  if (!referer || !referer.includes(host)) {
    return res.status(403).json({ error: "Acesso negado" })
  }

  // Retornar apenas um hash ou indicador
  // Em vez da chave real, você pode retornar um token temporário
  const CLIENT_KEY = process.env.CLIENT_KEY

  if (!CLIENT_KEY) {
    return res.status(500).json({ error: "Configuração inválida" })
  }

  // Retornar a chave (apenas para este exemplo)
  // Em produção, implemente autenticação adequada
  res.status(200).json({
    key: CLIENT_KEY,
    message: "Chave obtida com sucesso",
  })
}
