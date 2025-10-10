"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuthPermissions } from "@/lib/auth-permissions-context"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [shake, setShake] = useState(false)
  const { login } = useAuthPermissions()

  const handleLogin = async(e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const res =await login(email, password)
    if (res.ok) {
      router.push("/dashboard")
    } else {
      setError(res.error || "Invalid credentials. Please try again.")
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{
          opacity: 1,
          y: 0,
          x: shake ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={{ duration: shake ? 0.4 : 0.5 }}
      >
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              CFT Service
            </CardTitle>
            <CardDescription className="text-center">Sign in to access the complaint management system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sm text-red-600 bg-red-50 p-3 rounded-md"
                >
                  {error}
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                >
                  Login
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
