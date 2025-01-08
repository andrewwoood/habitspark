'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Target, Trophy, Camera, LogOut } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Profile() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)

  // Sample user data
  const userData = {
    name: "awood",
    email: "awood@ualberta.ca",
    avatar: "/placeholder.svg?height=128&width=128",
    achievements: [
      {
        id: 1,
        title: "Getting Started",
        description: "Keep going! First achievement at 3 days.",
        icon: Trophy,
      }
    ]
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-amber-50 to-orange-100",
      theme === "dark" && "dark from-slate-900 to-slate-800"
    )}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-amber-200 dark:border-slate-700">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
            Profile
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Profile Info */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="pt-6 px-6 pb-8 flex flex-col items-center text-center">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-amber-200 dark:border-amber-500/30">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="text-4xl bg-amber-200 dark:bg-slate-600 text-amber-800 dark:text-amber-300">
                  {userData.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => setIsAvatarDialogOpen(true)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 text-white dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-amber-800 dark:text-amber-300">
              {userData.name}
            </h2>
            <p className="text-amber-600 dark:text-amber-400">
              {userData.email}
            </p>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userData.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-lg bg-amber-100/50 dark:bg-slate-700/50"
              >
                <div className="flex items-start gap-3">
                  <achievement.icon className="w-5 h-5 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h3 className="font-medium text-amber-800 dark:text-amber-300">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          className="w-full mt-6 border-red-300 bg-red-50 hover:bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        {/* Avatar Change Dialog */}
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogContent className={cn(
            "sm:max-w-[425px] bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800",
            "border border-amber-200 dark:border-slate-700"
          )}>
            <DialogHeader>
              <DialogTitle className="text-amber-800 dark:text-amber-300">
                Change Profile Picture
              </DialogTitle>
              <DialogDescription className="text-amber-600 dark:text-amber-400">
                Choose a new profile picture to update your avatar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg border-amber-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-amber-300 dark:border-slate-600"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-amber-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div className="max-w-md mx-auto flex justify-around p-2">
            <Button variant="ghost" className="flex-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-slate-700">
              <Calendar className="w-5 h-5" />
            </Button>
            <Button variant="ghost" className="flex-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-slate-700">
              <Target className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 text-amber-700 bg-amber-100 dark:bg-slate-700 dark:text-amber-300",
                "hover:text-amber-700 hover:bg-amber-200 dark:hover:text-amber-300 dark:hover:bg-slate-600"
              )}
            >
              <Trophy className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

