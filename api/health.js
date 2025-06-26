// api/health.js - Health check
export default function handler(req, res) {
  res.status(200).json({
    status: "online",
    timestamp: new Date().toISOString(),
    service: "poison-hub-secure",
    uptime: process.uptime()
  });
}
