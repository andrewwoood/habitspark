'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Target, Trophy, Users, Plus, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function Groups() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")

  // Sample groups data
  const groups = [
    {
      id: 1,
      name: "Morning Routine Masters",
      code: "VHLKLX",
      memberCount: 4,
      completionRate: 85
    },
    {
      id: 2,
      name: "Fitness Friends",
      code: "GYM123",
      memberCount: 6,
      completionRate: 92
    },
    {
      id: 3,
      name: "Study Group",
      code: "STUDY7",
      memberCount: 3,
      completionRate: 78
    }
  ]

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      // Handle group creation
      setNewGroupName("")
      setIsCreateGroupOpen(false)
    }
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-amber-50 to-orange-100",
      theme === "dark" && "dark from-slate-900 to-slate-800"
    )}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-amber-200 dark:border-slate-700">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-300">Groups</h1>
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

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Create Group Button */}
        <Button
          className="w-full bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
          onClick={() => setIsCreateGroupOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Group
        </Button>

        {/* Groups List */}
        <div className="space-y-4">
          <h2 className="font-semibold text-amber-800 dark:text-amber-300">Your Groups</h2>
          <div className="space-y-3">
            {groups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-800/90 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium text-amber-800 dark:text-amber-300">
                          {group.name}
                        </h3>
                        <div className="flex items-center gap-4">
                          <code className="text-xs bg-amber-100 dark:bg-slate-700 px-2 py-1 rounded text-amber-600 dark:text-amber-400 font-mono">
                            {group.code}
                          </code>
                          <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                            <Users className="w-4 h-4 mr-1" />
                            {group.memberCount}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            {group.completionRate}%
                          </div>
                          <div className="text-xs text-amber-500 dark:text-amber-500">
                            Completion
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-amber-400 dark:text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Create Group Modal */}
        <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
          <DialogContent className={cn(
            "sm:max-w-[425px] bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800",
            "border border-amber-200 dark:border-slate-700"
          )}>
            <DialogHeader>
              <DialogTitle className="text-amber-800 dark:text-amber-300">Create New Group</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Enter group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateGroup()
                  }
                }}
                className="bg-white/80 dark:bg-slate-800/80 border-amber-300 dark:border-slate-600 text-amber-800 dark:text-amber-300 placeholder-amber-400 dark:placeholder-slate-500"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setNewGroupName("")
                  setIsCreateGroupOpen(false)
                }}
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-amber-300 dark:border-slate-600"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGroup}
                className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
              >
                Create Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-amber-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div className="max-w-md mx-auto flex justify-around p-2">
            <Link href="/">
              <Button variant="ghost" className="flex-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-slate-700">
                <Calendar className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/groups">
              <Button variant="ghost" className="flex-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-slate-700">
                <Target className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="flex-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-slate-700">
                <Trophy className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

