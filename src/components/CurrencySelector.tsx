"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const CURRENCIES = [
  { id: "exalted", name: "Exalted Orb", image: "/screenshots/exalted_orb.png" },
  { id: "regal", name: "Regal Orb", image: "/screenshots/regal_orb.png" },
  { id: "chaos", name: "Chaos Orb", image: "/screenshots/chaos_orb.png" },
  { id: "annul", name: "Annulment Orb", image: "/screenshots/annulment_orb.webp" },
  { id: "essence", name: "Essence", image: "/screenshots/essence_infinite.png" },
]

export function CurrencySelector({ selectedItem, onCraft }: any) {
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)
  const [isCrafting, setIsCrafting] = useState(false)

  const selectCurrency = (id: string) => {
    // Si on clique sur la même currency, on la désélectionne
    setSelectedCurrency(prev => prev === id ? null : id)
  }

  const handleStartCrafting = async () => {
    if (!selectedItem || !onCraft) return
    
    console.log("💰 Currency Selector - Starting crafting...")
    console.log("   Selected Item:", selectedItem)
    console.log("   Selected Currency:", selectedCurrency)
    
    setIsCrafting(true)
    try {
      await onCraft({
        itemId: selectedItem,
        currencies: selectedCurrency ? [selectedCurrency] : [],
        iterations: 100,
      })
      console.log("✅ Currency Selector - Crafting completed!")
    } catch (error) {
      console.error("❌ Currency Selector - Crafting failed:", error)
    } finally {
      setIsCrafting(false)
    }
  }

  return (
    <div className="space-y-4 border border-border rounded-lg p-4">
      <Label className="text-lg font-semibold">Select Currency (1 or none)</Label>
      <div className="space-y-2">
        {CURRENCIES.map((currency) => (
          <button
            key={currency.id}
            onClick={() => selectCurrency(currency.id)}
            disabled={!selectedItem || isCrafting}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
              selectedCurrency === currency.id
                ? 'border-primary bg-primary/10 text-primary-foreground'
                : 'border-border bg-background hover:border-primary/50 hover:bg-muted'
            } ${(!selectedItem || isCrafting) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <img 
              src={currency.image} 
              alt={currency.name}
              className="w-10 h-10 object-contain"
            />
            <span className="font-medium">{currency.name}</span>
            {selectedCurrency === currency.id && (
              <span className="ml-auto text-xs px-2 py-1 rounded bg-primary text-primary-foreground">
                ✓ Selected
              </span>
            )}
          </button>
        ))}
      </div>
      {selectedCurrency && (
        <button
          onClick={() => setSelectedCurrency(null)}
          className="w-full text-sm text-muted-foreground hover:text-foreground py-2"
        >
          Clear selection
        </button>
      )}
      <Button 
        className="w-full mt-4" 
        disabled={!selectedItem || isCrafting}
        onClick={handleStartCrafting}
      >
        {isCrafting ? "Crafting..." : "Start Crafting"}
      </Button>
    </div>
  )
}
