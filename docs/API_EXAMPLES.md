# POE2 Crafting API Examples

## Endpoint
`POST http://localhost:8080/api/crafting`

## Request Format

### Using Text-Based Matching (Recommended)
Text-based matching allows you to specify the exact modifier you want. This is more precise since some modifiers share the same family ID.

```json
{
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
}
```

### Using ID-Based Matching (Legacy)
ID-based matching uses the modifier family. This may match multiple modifiers with the same family.

```json
{
  "itemId": "Bows",
  "iterations": 1000,
  "modifiers": {
    "prefixes": [
      {
        "id": "MartialWeaponGainedDamage",
        "tier": 0
      },
      {
        "id": "PhysicalDamage",
        "tier": 0
      }
    ],
    "suffixes": [
      {
        "id": "IncreasedAttackSpeed",
        "tier": 0
      }
    ]
  }
}
```

## Parameters

- **itemId**: The item type (e.g., "Bows", "Body_Armours", "Helmets")
- **iterations**: Number of iterations to run (default: 100, recommended: 1000 for better results)
- **modifiers.prefixes**: Array of prefix modifiers to target
- **modifiers.suffixes**: Array of suffix modifiers to target
- **text**: Exact modifier text (recommended for precision)
- **id**: Modifier family ID (legacy, less precise)
- **tier**: Modifier tier (0 = T1/highest tier)

## Response Format

```json
{
  "itemId": "Bows",
  "iterations": 1000,
  "modifierCount": 6,
  "attempts": 25,
  "status": "ok",
  "results": [
    {
      "probability": 0.017595799352027708,
      "avgSuccessRate": 0.639157104021365,
      "bestPath": {
        "actions": [
          {
            "action": "TransmutationOrb",
            "actionFull": "core.Currency.TransmutationOrb",
            "probability": 0.0,
            "modifier": "#% increased Physical Damage",
            "modifierFamily": "LocalPhysicalDamagePercent"
          },
          ...
        ]
      }
    }
  ]
}
```

## Finding Modifier Text

Modifier texts can be found in the Java source files under:
- `src/main/java/core/Item_modifiers/[ItemCategory]/[ItemType]_Item_modifiers/`
  - `Modifiers_normal.java` - Normal modifiers
  - `Modifiers_essences.java` - Essence modifiers
  - `Modifiers_desecrated.java` - Desecrated modifiers

Look for the `text` field in modifier definitions. Note that:
- Multi-line modifiers use `\n` as line separator (e.g., compound attack speed modifier)
- The `#` symbol is a placeholder for numeric values
- Text must match exactly (case-sensitive)

## Tips

1. **Use text-based matching** to avoid ambiguity when multiple modifiers share the same family
2. **Start with tier 0** for the highest tier (T1) modifiers
3. **Higher iterations** (1000+) give better probability estimates
4. **Check the response** to see the crafting steps and required omens
5. **The algorithm** automatically finds the optimal path including transmutation, augmentation, regal, essence, desecrated currency, exalted orbs, and annulment
