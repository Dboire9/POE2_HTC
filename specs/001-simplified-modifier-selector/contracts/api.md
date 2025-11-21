# API Contracts: Simplified Modifier Selector

**Feature**: 001-simplified-modifier-selector  
**Date**: 2025-11-21  
**Protocol**: Electron IPC  
**Format**: JSON

## Overview

All communication occurs via `window.electronAPI.invoke(channel, data)` following constitution Principle V.
Backend runs on localhost:8080, Electron main process bridges IPC to HTTP.

---

## Endpoint: Fetch Items

**Channel**: `api:items`

**Request**:
```json
{} 
// No parameters - fetches all available items
```

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "bow_crude",
      "name": "Crude Bow",
      "type": "bow",
      "iconPath": "/assets/items/bow_crude.png",
      "baseStats": {
        "physicalDamage": 5,
        "attackSpeed": 1.2
      }
    }
  ]
}
```

**Errors**:
- `BACKEND_UNAVAILABLE`: Backend not responding
- `UNKNOWN`: Unexpected error

---

## Endpoint: Fetch Modifiers

**Channel**: `api:modifiers`

**Request**:
```json
{
  "itemId": "bow_crude"
}
```

**Response** (200 OK):
```json
{
  "prefixes": [
    {
      "id": "mod_phys_flat_t3",
      "text": "Adds # to # Physical Damage",
      "type": "prefix",
      "tier": 3,
      "statRanges": [
        {
          "stat": "Physical Damage",
          "min": 10,
          "max": 20
        }
      ],
      "tags": ["physical", "damage"],
      "source": "normal"
    }
  ],
  "suffixes": [
    {
      "id": "mod_attack_speed_t2",
      "text": "#% increased Attack Speed",
      "type": "suffix",
      "tier": 2,
      "statRanges": [
        {
          "stat": "Attack Speed",
          "min": 10,
          "max": 15
        }
      ],
      "tags": ["attack", "speed"],
      "source": "normal"
    }
  ],
  "exclusions": [
    {
      "modifierId": "mod_phys_flat_t3",
      "excludes": ["mod_phys_flat_essence"]
    }
  ]
}
```

**Errors**:
- `INVALID_ITEM_ID`: Item ID not found
- `BACKEND_UNAVAILABLE`: Backend not responding

---

## Endpoint: Start Crafting Simulation

**Channel**: `api:crafting`

**Request**:
```json
{
  "itemId": "bow_crude",
  "desiredModifiers": [
    "mod_phys_flat_t3",
    "mod_phys_percent_t3",
    "mod_attack_speed_t2"
  ]
}
```

**Response** (200 OK):
```json
{
  "itemId": "bow_crude",
  "requestedModifiers": [
    "mod_phys_flat_t3",
    "mod_phys_percent_t3",
    "mod_attack_speed_t2"
  ],
  "paths": [
    {
      "id": "path_001",
      "steps": [
        {
          "order": 1,
          "action": "Use Transmutation Orb",
          "currencyUsed": "Transmutation Orb",
          "targetModifier": "mod_phys_percent_t3",
          "probability": 0.15
        },
        {
          "order": 2,
          "action": "Use Augmentation Orb",
          "currencyUsed": "Augmentation Orb",
          "targetModifier": "mod_attack_speed_t2",
          "probability": 0.20
        }
      ],
      "probability": 0.45,
      "totalCost": {
        "Transmutation Orb": 15,
        "Augmentation Orb": 8,
        "Exalted Orb": 2
      }
    }
  ],
  "computationTime": 2500,
  "warnings": [
    "Combination has low probability (< 1%)"
  ]
}
```

**Response** (200 OK - No Path Found):
```json
{
  "itemId": "bow_crude",
  "requestedModifiers": ["mod_1", "mod_2"],
  "paths": [],
  "computationTime": 1200,
  "warnings": [
    "No valid crafting path exists for these modifiers"
  ]
}
```

**Errors**:
- `INVALID_MODIFIERS`: One or more modifier IDs invalid
- `INCOMPATIBLE_MODIFIERS`: Modifiers cannot coexist
- `TIMEOUT`: Simulation exceeded 30 seconds
- `BACKEND_UNAVAILABLE`: Backend not responding

---

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "code": "BACKEND_UNAVAILABLE",
    "message": "Could not connect to crafting engine",
    "recoverable": true,
    "details": {}
  }
}
```

**Error Codes**:
- `BACKEND_UNAVAILABLE`: Backend server not reachable
- `INVALID_ITEM_ID`: Item ID doesn't exist
- `INVALID_MODIFIERS`: Modifier IDs invalid
- `INCOMPATIBLE_MODIFIERS`: Selected modifiers mutually exclusive
- `NO_VALID_PATH`: No crafting path exists
- `TIMEOUT`: Operation exceeded time limit
- `UNKNOWN`: Unexpected error

---

## Notes

- All requests/responses are JSON
- Timeout: 30 seconds for crafting endpoint
- IPC channels prefixed with `api:`
- Backend provides exclusion rules with modifiers (single fetch)
- Paths pre-sorted by backend, frontend re-sorts for UI consistency
