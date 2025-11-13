"use client"

import { Button } from "@/components/ui/button"

interface QuickTestButtonProps {
  onQuickTest: () => void
  disabled?: boolean
}

export function QuickTestButton({ onQuickTest, disabled }: QuickTestButtonProps) {
  return (
    <Button 
      onClick={onQuickTest}
      disabled={disabled}
      variant="outline"
      className="w-full"
    >
      ⚡ Quick Test (Auto-select 6 max tier modifiers)
    </Button>
  )
}
