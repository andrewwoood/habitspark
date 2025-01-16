'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Flame } from 'lucide-react'
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function Login() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4",
      theme === "dark" && "dark from-slate-900 to-slate-800"
    )}>
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Flame className="w-16 h-16 text-amber-500 dark:text-amber-400 animate-pulse" />
            <Sparkles className="w-6 h-6 text-amber-400 dark:text-amber-300 absolute -right-2 -top-1" />
          </div>
          <h1 className="text-3xl font-bold text-amber-800 dark:text-amber-300">
            Welcome to HabitSpark
          </h1>
          <p className="text-amber-600 dark:text-amber-400 text-center max-w-sm">
            Track your habits, achieve your goals, and spark positive change
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/80 dark:bg-slate-800/80 border-amber-300 dark:border-slate-600 text-amber-800 dark:text-amber-300 placeholder-amber-400 dark:placeholder-slate-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/80 dark:bg-slate-800/80 border-amber-300 dark:border-slate-600 text-amber-800 dark:text-amber-300 placeholder-amber-400 dark:placeholder-slate-500"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
              >
                Login
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 dark:bg-slate-800/80 text-amber-600 dark:text-amber-400">
                  or
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-white hover:bg-gray-50 text-gray-600 border-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-300 dark:border-slate-600"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                asChild
              >
                <Link href="/signup">
                  Don't have an account? Sign Up
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </Button>
        </div>
      </div>
    </div>
  )
}

