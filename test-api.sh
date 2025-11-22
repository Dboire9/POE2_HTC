#!/bin/bash

# Test the API with the same modifiers as TestAlgo
curl -X POST http://localhost:8080/api/crafting \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "Bows",
    "iterations": 100,
    "global_threshold": 0.33,
    "modifiers": {
      "prefixes": [
        {"text": "Adds # to # Physical Damage", "tier": 2},
        {"text": "#% increased Physical Damage", "tier": 2},
        {"text": "Gain # % of Damage as Extra Lightning Damage", "tier": 0}
      ],
      "suffixes": [
        {"text": "#% chance to gain Onslaught on Killing Hits with this Weapon", "tier": 0},
        {"text": "+# to Level of all Attack Skills", "tier": 0},
        {"text": "#% increased Attack Speed\nCompanions have #% increased Attack Speed", "tier": 0}
      ]
    }
  }' | python3 -m json.tool | head -100
