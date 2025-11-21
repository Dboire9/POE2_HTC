"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Modifier {
  id: string
  name: string
  tiers: number
  uniqueId?: string
}

interface ModifierSelectorProps {
  selectedItem: string | null
  onModifiersChange: (modifiers: any) => void
}

export function ModifierSelector({ selectedItem, onModifiersChange }: ModifierSelectorProps) {
  const [prefixes, setPrefixes] = useState<Modifier[]>([])
  const [suffixes, setSuffixes] = useState<Modifier[]>([])
  const [loading, setLoading] = useState(false)
  
  // Selected modifiers
  const [prefix1, setPrefix1] = useState<string>("")
  const [prefix2, setPrefix2] = useState<string>("")
  const [prefix3, setPrefix3] = useState<string>("")
  const [suffix1, setSuffix1] = useState<string>("")
  const [suffix2, setSuffix2] = useState<string>("")
  const [suffix3, setSuffix3] = useState<string>("")
  
  // Selected tiers
  const [prefix1Tier, setPrefix1Tier] = useState<number>(1)
  const [prefix2Tier, setPrefix2Tier] = useState<number>(1)
  const [prefix3Tier, setPrefix3Tier] = useState<number>(1)
  const [suffix1Tier, setSuffix1Tier] = useState<number>(1)
  const [suffix2Tier, setSuffix2Tier] = useState<number>(1)
  const [suffix3Tier, setSuffix3Tier] = useState<number>(1)

  useEffect(() => {
    if (selectedItem) {
      loadModifiers()
    }
  }, [selectedItem])

  useEffect(() => {
    // Helper to get modifier by uniqueId and extract details
    const getModDetails = (uniqueId: string, type: 'prefix' | 'suffix') => {
      const list = type === 'prefix' ? prefixes : suffixes
      const mod = list.find(m => m.uniqueId === uniqueId)
      return mod ? { id: mod.id, name: mod.name } : null
    }
    
    // Notify parent component of changes
    onModifiersChange({
      prefixes: [
        prefix1 ? { ...getModDetails(prefix1, 'prefix'), tier: prefix1Tier } : null,
        prefix2 ? { ...getModDetails(prefix2, 'prefix'), tier: prefix2Tier } : null,
        prefix3 ? { ...getModDetails(prefix3, 'prefix'), tier: prefix3Tier } : null,
      ].filter(p => p !== null),
      suffixes: [
        suffix1 ? { ...getModDetails(suffix1, 'suffix'), tier: suffix1Tier } : null,
        suffix2 ? { ...getModDetails(suffix2, 'suffix'), tier: suffix2Tier } : null,
        suffix3 ? { ...getModDetails(suffix3, 'suffix'), tier: suffix3Tier } : null,
      ].filter(s => s !== null),
    })
  }, [prefix1, prefix2, prefix3, suffix1, suffix2, suffix3, prefix1Tier, prefix2Tier, prefix3Tier, suffix1Tier, suffix2Tier, suffix3Tier, prefixes, suffixes])

  const loadModifiers = async () => {
    if (!selectedItem) return
    
    setLoading(true)
    try {
      const data = await window.electronAPI.invoke("api:modifiers", { itemId: selectedItem })
      console.log("Modifiers loaded:", data)
      
      // Add unique IDs based on name (text) which is always unique
      const prefixesWithIndex = (data.prefixes || []).map((mod: Modifier, idx: number) => ({
        ...mod,
        uniqueId: `${mod.name}_${idx}`
      }))
      const suffixesWithIndex = (data.suffixes || []).map((mod: Modifier, idx: number) => ({
        ...mod,
        uniqueId: `${mod.name}_${idx}`
      }))
      
      setPrefixes(prefixesWithIndex)
      setSuffixes(suffixesWithIndex)
    } catch (error) {
      console.error("Failed to load modifiers:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTierOptions = (maxTiers: number) => {
    return Array.from({ length: maxTiers }, (_, i) => i + 1)
  }

  const getModifierById = (uniqueId: string, type: 'prefix' | 'suffix'): Modifier | undefined => {
    return type === 'prefix' 
      ? prefixes.find(m => m.uniqueId === uniqueId)
      : suffixes.find(m => m.uniqueId === uniqueId)
  }

  const handleQuickTest = () => {
    // Select first 3 prefixes with highest tiers
    const selectedPrefixes = prefixes.slice(0, 3)
    const selectedSuffixes = suffixes.slice(0, 3)
    
    // Helper to get best tier (9, 8, 5, or max available)
    const getBestTier = (modifier: Modifier) => {
      const tiers = [9, 8, 5]
      for (const tier of tiers) {
        if (tier <= modifier.tiers) return tier
      }
      return modifier.tiers // Return max available
    }
    
    if (selectedPrefixes[0]) {
      setPrefix1(selectedPrefixes[0].uniqueId!)
      setPrefix1Tier(getBestTier(selectedPrefixes[0]))
    }
    if (selectedPrefixes[1]) {
      setPrefix2(selectedPrefixes[1].uniqueId!)
      setPrefix2Tier(getBestTier(selectedPrefixes[1]))
    }
    if (selectedPrefixes[2]) {
      setPrefix3(selectedPrefixes[2].uniqueId!)
      setPrefix3Tier(getBestTier(selectedPrefixes[2]))
    }
    
    if (selectedSuffixes[0]) {
      setSuffix1(selectedSuffixes[0].uniqueId!)
      setSuffix1Tier(getBestTier(selectedSuffixes[0]))
    }
    if (selectedSuffixes[1]) {
      setSuffix2(selectedSuffixes[1].uniqueId!)
      setSuffix2Tier(getBestTier(selectedSuffixes[1]))
    }
    if (selectedSuffixes[2]) {
      setSuffix3(selectedSuffixes[2].uniqueId!)
      setSuffix3Tier(getBestTier(selectedSuffixes[2]))
    }
  }

  if (!selectedItem) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p>Select an item first to choose modifiers</p>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <p>Loading modifiers...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quick Test Button */}
      <Button 
        onClick={handleQuickTest}
        disabled={loading || prefixes.length === 0}
        variant="outline"
        className="w-full"
      >
        ⚡ Quick Test (Auto-select 6 modifiers with max tiers)
      </Button>
      
      {/* Prefixes */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Prefixes</h3>
        <div className="space-y-4">
          {/* Prefix 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prefix 1</Label>
              <Select value={prefix1} onValueChange={setPrefix1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select prefix 1" />
                </SelectTrigger>
                <SelectContent>
                  {prefixes.map((mod, idx) => (
                    <SelectItem key={`prefix1-${idx}`} value={mod.uniqueId!}>
                      {mod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tier</Label>
              <Select 
                value={prefix1Tier.toString()} 
                onValueChange={(v) => setPrefix1Tier(parseInt(v))}
                disabled={!prefix1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  {prefix1 && getModifierById(prefix1, 'prefix') && getTierOptions(getModifierById(prefix1, 'prefix')!.tiers).map((tier) => (
                    <SelectItem key={tier} value={tier.toString()}>
                      Tier {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prefix 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prefix 2</Label>
              <Select value={prefix2} onValueChange={setPrefix2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select prefix 2" />
                </SelectTrigger>
                <SelectContent>
                  {prefixes.map((mod, idx) => (
                    <SelectItem key={`prefix2-${idx}`} value={mod.uniqueId!}>
                      {mod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tier</Label>
              <Select 
                value={prefix2Tier.toString()} 
                onValueChange={(v) => setPrefix2Tier(parseInt(v))}
                disabled={!prefix2}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  {prefix2 && getModifierById(prefix2, 'prefix') && getTierOptions(getModifierById(prefix2, 'prefix')!.tiers).map((tier) => (
                    <SelectItem key={tier} value={tier.toString()}>
                      Tier {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prefix 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prefix 3</Label>
              <Select value={prefix3} onValueChange={setPrefix3}>
                <SelectTrigger>
                  <SelectValue placeholder="Select prefix 3" />
                </SelectTrigger>
                <SelectContent>
                  {prefixes.map((mod, idx) => (
                    <SelectItem key={`prefix3-${idx}`} value={mod.uniqueId!}>
                      {mod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tier</Label>
              <Select 
                value={prefix3Tier.toString()} 
                onValueChange={(v) => setPrefix3Tier(parseInt(v))}
                disabled={!prefix3}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  {prefix3 && getModifierById(prefix3, 'prefix') && getTierOptions(getModifierById(prefix3, 'prefix')!.tiers).map((tier) => (
                    <SelectItem key={tier} value={tier.toString()}>
                      Tier {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Suffixes */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Suffixes</h3>
        <div className="space-y-4">
          {/* Suffix 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Suffix 1</Label>
              <Select value={suffix1} onValueChange={setSuffix1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select suffix 1" />
                </SelectTrigger>
                <SelectContent>
                  {suffixes.map((mod, idx) => (
                    <SelectItem key={`suffix1-${idx}`} value={mod.uniqueId!}>
                      {mod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tier</Label>
              <Select 
                value={suffix1Tier.toString()} 
                onValueChange={(v) => setSuffix1Tier(parseInt(v))}
                disabled={!suffix1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  {suffix1 && getModifierById(suffix1, 'suffix') && getTierOptions(getModifierById(suffix1, 'suffix')!.tiers).map((tier) => (
                    <SelectItem key={tier} value={tier.toString()}>
                      Tier {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Suffix 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Suffix 2</Label>
              <Select value={suffix2} onValueChange={setSuffix2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select suffix 2" />
                </SelectTrigger>
                <SelectContent>
                  {suffixes.map((mod, idx) => (
                    <SelectItem key={`suffix2-${idx}`} value={mod.uniqueId!}>
                      {mod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tier</Label>
              <Select 
                value={suffix2Tier.toString()} 
                onValueChange={(v) => setSuffix2Tier(parseInt(v))}
                disabled={!suffix2}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  {suffix2 && getModifierById(suffix2, 'suffix') && getTierOptions(getModifierById(suffix2, 'suffix')!.tiers).map((tier) => (
                    <SelectItem key={tier} value={tier.toString()}>
                      Tier {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Suffix 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Suffix 3</Label>
              <Select value={suffix3} onValueChange={setSuffix3}>
                <SelectTrigger>
                  <SelectValue placeholder="Select suffix 3" />
                </SelectTrigger>
                <SelectContent>
                  {suffixes.map((mod, idx) => (
                    <SelectItem key={`suffix3-${idx}`} value={mod.uniqueId!}>
                      {mod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tier</Label>
              <Select 
                value={suffix3Tier.toString()} 
                onValueChange={(v) => setSuffix3Tier(parseInt(v))}
                disabled={!suffix3}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  {suffix3 && getModifierById(suffix3, 'suffix') && getTierOptions(getModifierById(suffix3, 'suffix')!.tiers).map((tier) => (
                    <SelectItem key={tier} value={tier.toString()}>
                      Tier {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
