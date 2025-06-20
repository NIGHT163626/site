"use client"

import { useState, useEffect } from "react"
import { Shield, Lock, AlertTriangle } from "lucide-react"

export default function AccessDeniedPage() {
  const [glitchText, setGlitchText] = useState("ACESSO NEGADO")

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
      const originalText = "ACESSO NEGADO"
      let glitched = ""

      for (let i = 0; i < originalText.length; i++) {
        if (Math.random() < 0.1) {
          glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)]
        } else {
          glitched += originalText[i]
        }
      }

      setGlitchText(glitched)

      setTimeout(() => setGlitchText("ACESSO NEGADO"), 100)
    }, 3000)

    return () => clearInterval(glitchInterval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-yellow-400 font-mono overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, yellow 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, yellow 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 gap-1 h-full animate-pulse">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="bg-yellow-400 h-1"></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Main Warning Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping">
            <Shield className="w-32 h-32 text-yellow-400 opacity-75" />
          </div>
          <Shield className="w-32 h-32 text-yellow-400 relative z-10" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Lock className="w-16 h-16 text-black" />
          </div>
        </div>

        {/* Glitch Title */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8 text-center tracking-wider">
          <span className="inline-block animate-pulse">{glitchText}</span>
        </h1>

        {/* Warning Badge */}
        <div className="flex items-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-full animate-bounce">
          <AlertTriangle className="w-6 h-6" />
          <span className="font-bold text-xl">ÁREA RESTRITA</span>
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 animate-bounce delay-1000">
        <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-60"></div>
      </div>
      <div className="absolute top-20 right-20 animate-bounce delay-2000">
        <div className="w-3 h-3 bg-yellow-400 rounded-full opacity-40"></div>
      </div>
      <div className="absolute bottom-20 left-20 animate-bounce delay-3000">
        <div className="w-5 h-5 bg-yellow-400 rounded-full opacity-50"></div>
      </div>
      <div className="absolute bottom-10 right-10 animate-bounce delay-4000">
        <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-80"></div>
      </div>
    </div>
  )
}
