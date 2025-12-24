"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export function CraftingSimulator({ selectedItem, onCraft }: any) {
  const [iterations, setIterations] = useState(100)
  const [isRunning, setIsRunning] = useState(false)

  const handleSimulate = async () => {
    setIsRunning(true)
    try {
      await onCraft({
        itemId: selectedItem,
        iterations: iterations,
      })
    } catch (error) {
      console.error("❌ Simulator - Simulation failed:", error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <Label htmlFor="iterations">Iterations: {iterations}</Label>
        <Slider
          id="iterations"
          min={10}
          max={10000}
          step={10}
          value={[iterations]}
          onValueChange={(value) => setIterations(value[0])}
          className="w-full"
        />
      </div>

      <Button onClick={handleSimulate} disabled={!selectedItem || isRunning} size="lg" className="w-full">
        {isRunning ? "Simulating..." : "Run Simulation"}
      </Button>
    </Card>
  )
}
