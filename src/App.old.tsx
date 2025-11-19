"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ItemSelector } from "@/components/ItemSelector"
import { CurrencySelector } from "@/components/CurrencySelector"
import { ModifierSelector } from "@/components/ModifierSelector"
import { Results } from "@/components/Results"

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [craftingHistory, setCraftingHistory] = useState<any[]>([])
  const [selectedModifiers, setSelectedModifiers] = useState(null)
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set([0]))
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    // Initialize app
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const items = await window.electronAPI.invoke("api:items")
      console.log("Items loaded:", items)
    } catch (error) {
      console.error("Failed to load items:", error)
    }
  }

  const handleStartCrafting = async (craftingData: any) => {
    console.log("🚀 Starting crafting with data:", craftingData)
    setIsLoading(true)
    try {
      const results = await window.electronAPI.invoke("api:crafting", craftingData)
      console.log("✅ Crafting results received:", results)
      
      // Add new result to history at the beginning
      const newResult = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        data: results
      }
      setCraftingHistory(prev => [newResult, ...prev])
      
      // Expand the new result and collapse others
      setExpandedResults(new Set([0]))
    } catch (error) {
      console.error("❌ Crafting failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpanded = (index: number) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen text-foreground">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            <img 
              src="/screenshots/path-of-exile-poe.gif" 
              alt="Loading..." 
              className="w-32 h-32 object-contain"
            />
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Crafting in Progress...</h2>
              <p className="text-muted-foreground">Calculating optimal crafting paths</p>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-border bg-gradient-to-r from-[oklch(0.20_0_0)] to-[oklch(0.24_0_0)]">
        <div className="container flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <img src="/screenshots/logo.jpg" alt="POE2" className="h-8 w-8 opacity-90" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">POE2 Crafting Tool</h1>
              <p className="text-sm text-muted-foreground">Path of Exile 2 Item Crafting Simulator</p>
            </div>
          </div>
          
          <div className="hidden md:flex flex-col items-end gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/Dboire9" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <span className="text-[10px] uppercase tracking-wider opacity-70">Backend & Algorithm</span>
                <span className="font-medium">Dboire</span>
              </a>
              <span className="opacity-30">•</span>
              <a 
                href="https://github.com/fZpHr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <span className="text-[10px] uppercase tracking-wider opacity-70">Frontend & Integration</span>
                <span className="font-medium">fZpHr</span>
              </a>
            </div>
            <a 
              href="https://github.com/Dboire9/POE2_HTC" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all"
            >
              <span className="text-[10px] font-mono font-semibold leading-none">v0.1</span>
              <span className="opacity-30 leading-none">|</span>
              <span className="text-[10px] leading-none">⭐ Star & Contribute</span>
            </a>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Crafting interface */}
          <div className="space-y-6">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-3">Select Item</h2>
              <ItemSelector onItemSelect={setSelectedItem} />
            </Card>
            
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-3">Select Modifiers</h2>
              <ModifierSelector 
                selectedItem={selectedItem} 
                onModifiersChange={setSelectedModifiers}
              />
            </Card>
            
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-3">Currency & Start</h2>
              <CurrencySelector 
                selectedItem={selectedItem} 
                onCraft={(data: any) => handleStartCrafting({...data, modifiers: selectedModifiers})} 
              />
            </Card>
          </div>

          {/* Right side - Results history with scrollbar */}
          <div className="space-y-4">
            <div className="sticky top-4">
              <h2 className="text-lg font-semibold mb-3">Results History ({craftingHistory.length})</h2>
              <div className="max-h-[calc(100vh-150px)] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {craftingHistory.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    <p className="text-lg">No crafting results yet.</p>
                    <p className="text-sm mt-2">Run a simulation to see results here.</p>
                  </Card>
                ) : (
                  craftingHistory.map((result, index) => (
                    <Card 
                      key={result.id}
                      className={`transition-all duration-300 ${
                        expandedResults.has(index) 
                          ? 'p-4 border-2 border-primary/50' 
                          : 'p-3 border border-border hover:border-primary/30 cursor-pointer'
                      }`}
                      onClick={() => !expandedResults.has(index) && toggleExpanded(index)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-semibold">
                              Latest
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {result.timestamp}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpanded(index)
                          }}
                          className="text-xs px-2 py-1 rounded hover:bg-muted"
                        >
                          {expandedResults.has(index) ? '▼ Collapse' : '▶ Expand'}
                        </button>
                      </div>
                      
                      {expandedResults.has(index) ? (
                        <Results data={result.data} />
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {result.data?.itemId && (
                            <span>Item: {result.data.itemId} • </span>
                          )}
                          {result.data?.modifierCount && (
                            <span>{result.data.modifierCount} modifiers • </span>
                          )}
                          {result.data?.results && (
                            <span>{result.data.results.length} paths found</span>
                          )}
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
