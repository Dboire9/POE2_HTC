import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function Results({ data }: any) {
  const [selectedPath, setSelectedPath] = useState<number>(0)
  
  if (!data) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        <p className="text-lg">No crafting results yet.</p>
        <p className="text-sm mt-2">Run a simulation to see results here.</p>
      </Card>
    )
  }

  // Sort results by average success rate (HIGHEST first = BEST path first)
  // avgSuccessRate represents the average probability across all actions in the path
  const sortedResults = data.results ? [...data.results].sort((a: any, b: any) => {
    // Use avgSuccessRate if available, otherwise fall back to probability
    const aRate = a.avgSuccessRate ?? a.probability
    const bRate = b.avgSuccessRate ?? b.probability
    return bRate - aRate
  }).slice(0, 3) : []  // Display only top 3 best paths
  
  // Reset to best path (index 0) when new results arrive
  if (sortedResults.length > 0 && selectedPath >= sortedResults.length) {
    setSelectedPath(0)
  }

  // Helper to format action name
  const formatAction = (actionName: string) => {
    // Convert "ExaltedOrb" to "Exalted Orb"
    return actionName.replace(/([A-Z])/g, ' $1').trim()
  }

  // Helper to format currency tier
  const formatTier = (tier: string) => {
    const tierMap: Record<string, string> = {
      'BASE': 'Base',
      'GREATER': 'Greater',
      'DES_CURRENCY': 'Desecrated', // Desecrated Currency (via desecration)
      'PERFECT': 'Perfect'
    }
    return tierMap[tier] || tier
  }

  // Helper to format probability percentage
  const formatProbability = (prob: number) => {
    if (prob === 0) return "0%"
    if (prob < 0.0001) {
      // Format scientific notation with rounded exponent
      const exp = Math.floor(Math.log10(prob))
      const mantissa = prob / Math.pow(10, exp)
      return `${mantissa.toFixed(2)}e${exp}%`
    }
    return (prob * 100).toFixed(4) + "%"
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Crafting Results</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded ${data.status === 'ok' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {data.status}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Item:</span>
              <span className="ml-2 font-mono">{data.itemId}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Modifiers:</span>
              <span className="ml-2">{data.modifierCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Attempts:</span>
              <span className="ml-2">{data.attempts || 'N/A'}</span>
            </div>
          </div>
          
          {data.message && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 text-sm text-yellow-400">
              {data.message}
            </div>
          )}
          
          {sortedResults && sortedResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold">
                  Top 3 Crafting Paths {data.results?.length > 3 && `(${data.results.length} total found)`}
                </h3>
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Select Path:</span>
                  <Select value={selectedPath.toString()} onValueChange={(v) => setSelectedPath(parseInt(v))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedResults.map((result: any, idx: number) => (
                        <SelectItem key={idx} value={idx.toString()}>
                          <div className="flex items-center justify-between gap-4 w-full">
                            <div className="flex items-center gap-2">
                              <span>Path #{idx + 1}</span>
                              {idx === 0 && <span className="text-xs">🏆</span>}
                            </div>
                            <span className="text-xs text-muted-foreground font-mono">
                              {result.avgSuccessRate ? `Avg: ${(result.avgSuccessRate * 100).toFixed(2)}%` : formatProbability(result.probability)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {sortedResults[selectedPath] && (
                <Card className="p-4 bg-muted/30 border-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">Path #{selectedPath + 1}</span>
                        {selectedPath === 0 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-semibold">
                            🏆 Best Path
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {sortedResults[selectedPath].avgSuccessRate && (
                          <span className="text-sm">
                            <span className="text-muted-foreground">Avg Step Rate: </span>
                            <span className="font-mono text-blue-400 font-bold">
                              {(sortedResults[selectedPath].avgSuccessRate * 100).toFixed(2)}%
                            </span>
                          </span>
                        )}
                        <span className="text-sm">
                          <span className="text-muted-foreground">Total Success: </span>
                          <span className="font-mono text-green-400 font-bold text-base">
                            {formatProbability(sortedResults[selectedPath].probability)}
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    {sortedResults[selectedPath].bestPath?.actions && (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground mb-2">Crafting Steps:</div>
                        {sortedResults[selectedPath].bestPath.actions.map((actionObj: any, stepIdx: number) => (
                          <div key={stepIdx} className="flex items-center gap-3 text-sm bg-background/80 p-3 rounded">
                            <span className="text-muted-foreground font-mono w-8">{stepIdx + 1}.</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatAction(actionObj.action)}</span>
                                {actionObj.tier && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                                    {formatTier(actionObj.tier)}
                                  </span>
                                )}
                              </div>
                              {actionObj.modifier && (
                                <div className="text-xs text-green-400 mt-1">→ {actionObj.modifier}</div>
                              )}
                              {actionObj.omens && actionObj.omens.length > 0 && (
                                <div className="text-xs text-purple-400 mt-1">
                                  🔮 {actionObj.omens.map((o: string) => o.replace(/^Omenof/, '').replace(/([A-Z])/g, ' $1').trim()).join(', ')}
                                </div>
                              )}
                              {actionObj.omen && actionObj.omen !== 'None' && (
                                <div className="text-xs text-purple-400 mt-1">
                                  🔮 {actionObj.omen.replace(/^Omenof/, '').replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                              )}
                            </div>
                            <span className="font-mono text-xs text-blue-400 font-semibold">
                              {formatProbability(actionObj.probability)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-4">
              <p className="text-yellow-400">⚠️ No crafting paths found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                The algorithm couldn't find a valid path. Try selecting different modifiers or fewer modifiers.
              </p>
            </div>
          )}
          
          <details className="mt-4">
            <summary className="cursor-pointer font-semibold text-sm text-muted-foreground hover:text-foreground">
              Show raw data
            </summary>
            <pre className="bg-background p-4 rounded overflow-auto max-h-96 text-xs mt-2 border">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      </Card>
    </div>
  )
}
