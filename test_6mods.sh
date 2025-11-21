#!/bin/bash

echo "=== Testing Crafting with 6 Modifiers ==="
echo ""
echo "Prefixes:"
echo "  - Gain % of Damage as Extra Physical Damage (T1)"
echo "  - Adds # to # Physical Damage (T1)"
echo "  - % increased Physical Damage (T1)"
echo "Suffixes:"
echo "  - % chance to gain Onslaught on Killing Hits (T1)"
echo "  - +# to Level of all Attack Skills (T1)"
echo "  - % increased Attack Speed (T1)"
echo ""

# Test payload with 6 modifiers - using text-based matching for exact modifier selection
curl -X POST http://localhost:8080/api/crafting \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "Bows",
    "iterations": 1000,
    "modifiers": {
      "prefixes": [
        {
          "text": "Gain # % of Damage as Extra Physical Damage",
          "tier": 0
        },
        {
          "text": "Adds # to # Physical Damage",
          "tier": 0
        },
        {
          "text": "#% increased Physical Damage",
          "tier": 0
        }
      ],
      "suffixes": [
        {
          "text": "#% chance to gain Onslaught on Killing Hits with this Weapon",
          "tier": 0
        },
        {
          "text": "+# to Level of all Attack Skills",
          "tier": 0
        },
        {
          "text": "#% increased Attack Speed\nCompanions have #% increased Attack Speed",
          "tier": 0
        }
      ]
    }
  }' 2>/dev/null | python3 -m json.tool

echo ""
echo "=== Checking backend logs for timing ==="
tail -50 backend.log | grep -E "(Attempt 1/|runCrafting returned|Total crafting|COMPLETED)" | tail -20
