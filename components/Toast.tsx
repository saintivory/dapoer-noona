"use client"

import { useEffect, useState } from "react"

type ToastProps = {
  message: string
  duration?: number
}

export default function Toast({ message, duration = 2000 }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(timer)
  }, [duration])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-up">
      {message}
    </div>
  )
}