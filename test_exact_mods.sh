#!/bin/bash
curl -s -X POST http://localhost:8080/api/crafting \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "Bows",
    "iterations": 100,
    "modifiers": {
      "prefixes": [
        {"text": "Adds # to # Physical Damage"},
        {"text": "#% increased Physical Damage"},
        {"text": "Gain # % of Damage as Extra Lightning Damage"}
      ],
      "suffixes": [
        {"text": "(20–25)% chance to gain Onslaught for 4 seconds on Killing Hits with this Weapon"},
        {"text": "+# to Level of all Attack Skills"},
        {"text": "#% increased Attack Speed\nCompanions have #% increased Attack Speed"}
      ]
    },
    "global_threshold": 33
  }' | python3 -m json.tool | head -100
