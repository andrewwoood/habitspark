'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Copy, UserMinus, Trash2, LogOut } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

export default function GroupDetails() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [selectedTimeframe, setSelectedTimeframe] = useState("6m")
  const { toast } = useToast()

  // Sample group data
  const groupData = {
    name: "test group",
    code: "VHLKLX",
    members: [
      { id: 1, name: "awood", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 2, name: "ATW", avatar: "/placeholder.svg?height=40&width=40" }
    ]
  }

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(`Join my habit group with code: ${groupData.code}`)
    toast({
      description: "Invite link copied to clipboard!",
      className: cn(
        "bg-white dark:bg-slate-800 border-amber-200 dark:border-slate-700",
        "text-amber-800 dark:text-amber-300"
      )
    })
  }

  const getTimeframeLabel = () => {
    const now = new Date()
    let startDate = new Date()
    
    switch (selectedTimeframe) {
      case "1m":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "3m":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "6m":
        startDate.setMonth(now.getMonth() - 6)
        break
    }

    return `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()} - Present`
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-amber-50 to-orange-100",
      theme === "dark" && "dark from-slate-900 to-slate-800"
    )}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-amber-200 dark:border-slate-700">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-slate-700"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
            Group Details
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Group Info */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-2">
              {groupData.name}
            </h2>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <span className="text-sm">Group Code:</span>
              <code className="bg-amber-100 dark:bg-slate-700 px-2 py-1 rounded text-sm font-mono">
                {groupData.code}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Group Progress */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-amber-800 dark:text-amber-300">Group Progress</h2>
              <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe} className="h-8">
                <TabsList className="h-8 bg-amber-100 dark:bg-slate-700">
                  <TabsTrigger value="1m" className="h-8 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">1M</TabsTrigger>
                  <TabsTrigger value="3m" className="h-8 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">3M</TabsTrigger>
                  <TabsTrigger value="6m" className="h-8 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">6M</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300 mb-2">
              {getTimeframeLabel()}
            </div>
            <div className="space-y-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="flex items-center text-sm">
                  <span className="w-8 text-amber-700 dark:text-amber-300">{day}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-3 h-3 rounded-sm",
                          i === 0 && "bg-amber-100 dark:bg-slate-700",
                          i === 1 && "bg-amber-300 dark:bg-amber-900",
                          i === 2 && "bg-amber-500 dark:bg-amber-700",
                          i === 3 && "bg-amber-700 dark:bg-amber-500"
                        )}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center text-xs text-amber-700 dark:text-amber-300 mt-2 justify-end gap-2">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-amber-100 dark:bg-slate-700" />
                <div className="w-3 h-3 rounded-sm bg-amber-300 dark:bg-amber-900" />
                <div className="w-3 h-3 rounded-sm bg-amber-500 dark:bg-amber-700" />
                <div className="w-3 h-3 rounded-sm bg-amber-700 dark:bg-amber-500" />
                <span>More</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members */}
        <div className="space-y-4">
          <h2 className="font-semibold text-amber-800 dark:text-amber-300">Members</h2>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-4 space-y-2">
              {groupData.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-amber-200 dark:bg-slate-600 text-amber-800 dark:text-amber-300">
                        {member.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-amber-800 dark:text-amber-300">
                      {member.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-slate-700"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-amber-300 dark:border-slate-600"
            onClick={handleCopyInviteLink}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Invite Link
          </Button>
          <Button
            variant="outline"
            className="w-full border-red-300 bg-red-50 hover:bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Group
          </Button>
          <Button
            variant="outline"
            className="w-full border-red-300 bg-red-50 hover:bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Group
          </Button>
        </div>
      </div>
    </div>
  )
}

