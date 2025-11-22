#!/bin/bash
# Test different thresholds to find which works

echo "Testing threshold 0.40 (40%)..."
curl -X POST http://localhost:8080/api/crafting \
  -H "Content-Type: application/json" \
  -d '{
    "itemType": "Bows",
    "desiredModifiers": [
      {"text": "Adds # to # Physical Damage", "tier": 2},
      {"text": "#% increased Physical Damage", "tier": 2},
      {"text": "Gain # % of Damage as Extra Lightning Damage", "tier": 0},
      {"text": "#% chance to gain Onslaught on Killing Hits with this Weapon", "tier": 0},
      {"text": "+# to Level of all Attack Skills", "tier": 0},
      {"text": "#% increased Attack Speed\nCompanions have #% increased Attack Speed", "tier": 0}
    ],
    "iterations": 100
  }' 2>&1 | grep -E "(threshold|paths|retries)" | head -3
