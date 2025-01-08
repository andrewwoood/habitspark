'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Target, Trophy, Flame } from 'lucide-react'
import { cn } from "@/lib/utils"
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// Helper functions
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
}

const generateHeatmapData = (timeframe: string) => {
  const now = new Date();
  const data: { [key: string]: number } = {};
  
  // Calculate start date based on timeframe
  const startDate = new Date();
  switch (timeframe) {
    case "1m":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "3m":
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "6m":
      startDate.setMonth(now.getMonth() - 6);
      break;
  }
  
  // Ensure we start from the first day of the start month
  startDate.setDate(1);
  
  // Generate data for each day from start date to now
  const currentDate = new Date(startDate);
  while (currentDate <= now) {
    const monthKey = currentDate.toLocaleString('default', { month: 'short' });
    const dayKey = currentDate.toLocaleString('default', { weekday: 'short' });
    const key = `${monthKey}-${dayKey}`;
    
    // Generate random intensity for demo purposes
    data[key] = Math.floor(Math.random() * 4);
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
}

// Add styles to handle the drag animation
const getStyle = (style: any, snapshot: any) => {
  if (!snapshot.isDropAnimating) {
    return style;
  }
  return {
    ...style,
    transitionDuration: `0.2s`,
  }
}

export default function HabitTracker() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [showPercentage, setShowPercentage] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState("6m")
  const [habits, setHabits] = useState([
    { id: "1", name: "Morning Meditation", completed: false },
    { id: "2", name: "Daily Exercise", completed: true },
    { id: "3", name: "Read 30 minutes", completed: false }
  ])
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false)
  const [newHabitName, setNewHabitName] = useState("")
  const [heatmapData, setHeatmapData] = useState(() => generateHeatmapData("6m"))

  // Stats data
  const stats = {
    weekCompletion: 19,
    weeklyTotal: 14,
    totalCompletions: 73,
    longestStreak: 3
  }

  // Update heatmap data when timeframe changes
  useEffect(() => {
    setHeatmapData(generateHeatmapData(selectedTimeframe));
  }, [selectedTimeframe]);

  // Get all months in the selected timeframe
  const getMonthsInTimeframe = () => {
    const months: string[] = [];
    const now = new Date();
    const startDate = new Date();
    
    switch (selectedTimeframe) {
      case "1m":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(now.getMonth() - 6);
        break;
    }
    
    startDate.setDate(1);
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const monthKey = currentDate.toLocaleString('default', { month: 'short' });
      if (!months.includes(monthKey)) {
        months.push(monthKey);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return months;
  }

  const getTimeframeLabel = () => {
    const now = new Date()
    let startDate = new Date()
    
    switch (selectedTimeframe) {
      case "1m":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(now.getMonth() - 6);
        break;
    }

    return `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()} - Present`
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const newHabits = Array.from(habits)
    const [reorderedItem] = newHabits.splice(result.source.index, 1)
    newHabits.splice(result.destination.index, 0, reorderedItem)

    setHabits(newHabits)

    // Reset any remaining transition styles
    document.querySelectorAll('.habit-card').forEach((el: Element) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.transform = ''
      htmlEl.style.transition = ''
    })
  }

  const onDragUpdate = (update: any) => {
    if (!update.destination) return

    const draggingIndex = update.source.index
    const hoverIndex = update.destination.index

    document.querySelectorAll('.habit-card').forEach((el: Element, index: number) => {
      if (index === draggingIndex) return

      const htmlEl = el as HTMLElement
      
      // Only apply vertical transforms
      if (draggingIndex < hoverIndex && index > draggingIndex && index <= hoverIndex) {
        htmlEl.style.transform = 'translateY(-100%)'
        htmlEl.style.transition = 'transform 0.2s ease'
      } else if (draggingIndex > hoverIndex && index < draggingIndex && index >= hoverIndex) {
        htmlEl.style.transform = 'translateY(100%)'
        htmlEl.style.transition = 'transform 0.2s ease'
      } else {
        htmlEl.style.transform = ''
        htmlEl.style.transition = 'transform 0.2s ease'
      }
    })
  }

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      setHabits([
        ...habits,
        {
          id: String(Date.now()),
          name: newHabitName.trim(),
          completed: false
        }
      ])
      setNewHabitName("")
      setIsAddHabitOpen(false)
    }
  }

  return (
    <div className={cn(
      "min-h-screen p-4 bg-gradient-to-br from-amber-50 to-orange-100",
      theme === "dark" && "dark from-slate-900 to-slate-800"
    )}>
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-300">Habits</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div 
                className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-1 cursor-pointer"
                onClick={() => setShowPercentage(!showPercentage)}
              >
                {showPercentage 
                  ? `${stats.weekCompletion}%`
                  : `${stats.weeklyTotal}/73`
                }
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Last 7 Days
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center justify-center">
                {stats.longestStreak}
                <Flame className="w-6 h-6 ml-2 text-amber-500 dark:text-amber-400" />
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Longest Streak
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-amber-800 dark:text-amber-300">Your Progress</h2>
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
                    {getMonthsInTimeframe().map((month) => (
                      <div
                        key={`${month}-${day}`}
                        className={cn(
                          "w-3 h-3 rounded-sm",
                          heatmapData[`${month}-${day}`] === undefined && "bg-amber-100 dark:bg-slate-700",
                          heatmapData[`${month}-${day}`] === 0 && "bg-amber-100 dark:bg-slate-700",
                          heatmapData[`${month}-${day}`] === 1 && "bg-amber-300 dark:bg-amber-900",
                          heatmapData[`${month}-${day}`] === 2 && "bg-amber-500 dark:bg-amber-700",
                          heatmapData[`${month}-${day}`] === 3 && "bg-amber-700 dark:bg-amber-500"
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

        {/* Habits List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between sticky top-0 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 py-2 z-10">
            <h2 className="font-semibold text-amber-800 dark:text-amber-300">Today's Habits</h2>
            <Button variant="outline" size="sm" className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-amber-300 dark:border-slate-600" onClick={() => setIsAddHabitOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </div>
          <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
            <Droppable droppableId="habits">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {habits.map((habit, index) => (
                    <Draggable key={habit.id} draggableId={habit.id} index={index}>
                      {(provided, snapshot) => (
                        <Card 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm habit-card transform-gpu",
                            snapshot.isDragging ? "z-50 shadow-lg" : "z-0"
                          )}
                          style={getStyle({
                            ...provided.draggableProps.style,
                            transform: snapshot.isDragging
                              ? `${provided.draggableProps.style?.transform}`
                              : provided.draggableProps.style?.transform,
                          }, snapshot)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  "w-4 h-4 rounded-full border-2",
                                  habit.completed ? "bg-amber-500 border-amber-500 dark:bg-amber-400 dark:border-amber-400" : "border-amber-300 dark:border-amber-700"
                                )}
                              />
                              <span className="flex-1 text-amber-800 dark:text-amber-300">{habit.name}</span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Add Habit Modal */}
        <Dialog open={isAddHabitOpen} onOpenChange={setIsAddHabitOpen}>
          <DialogContent className={cn(
            "sm:max-w-[425px] bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800",
            "border border-amber-200 dark:border-slate-700"
          )}>
            <DialogHeader>
              <DialogTitle className="text-amber-800 dark:text-amber-300">Add New Habit</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Enter habit name..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddHabit()
                  }
                }}
                className="bg-white/80 dark:bg-slate-800/80 border-amber-300 dark:border-slate-600 text-amber-800 dark:text-amber-300 placeholder-amber-400 dark:placeholder-slate-500"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setNewHabitName("")
                  setIsAddHabitOpen(false)
                }}
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-amber-300 dark:border-slate-600"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddHabit}
                className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
              >
                Add Habit
              </Button>
            </DialogFooter>
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
            <Button variant="ghost" className="flex-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-slate-700">
              <Trophy className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

