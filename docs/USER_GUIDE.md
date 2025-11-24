# User Guide - POE2 How To Craft

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding the Interface](#understanding-the-interface)
3. [Step-by-Step Crafting Guide](#step-by-step-crafting-guide)
4. [Understanding Results](#understanding-results)
5. [Advanced Tips](#advanced-tips)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

**Windows:**
1. Download the installer from [Releases](https://github.com/Dboire9/POE2_HTC/releases/latest)
2. Run `POE2HTC-Setup-X.X.X.exe`
3. Launch from Start Menu or Desktop shortcut

**Linux/macOS:**
```bash
git clone https://github.com/Dboire9/POE2_HTC.git
cd POE2_HTC
npm install --legacy-peer-deps
npm run electron:dev
```

### First Launch

When you first open the application:
1. The backend server starts automatically on port 8080
2. The frontend interface loads at `http://localhost:5173`
3. An Electron window opens with the application

---

## Understanding the Interface

### Main Sections

The application interface is divided into three main areas:

#### 1. Item Selection (Top)
- **Item Category Dropdown**: Choose the base item type (Wands, Helmets, Body Armours, etc.)
- **Subcategory Dropdown**: For hybrid items, select the specific variant (e.g., ES/Armor Hybrid)
- **Item Preview**: Shows the selected base item with its properties

#### 2. Modifier Selection (Middle)
The modifier selection area has two tabs:

**Prefixes Tab:**
- Shows all available prefix modifiers for your item
- Maximum 3 prefixes per item
- Each modifier displays:
  - Modifier text (e.g., "+# to maximum Life")
  - Available tiers (T1 = best, T10 = worst)
  - Modifier family (important for conflict detection)
  - Source type (Normal, Perfect Essence, Desecrated)

**Suffixes Tab:**
- Shows all available suffix modifiers
- Maximum 3 suffixes per item
- Same information as prefixes

#### 3. Results Display (Bottom)
- Shows crafting paths after simulation
- Multiple paths ranked by success probability
- Each path shows step-by-step currency usage

---

## Step-by-Step Crafting Guide

### Step 1: Select Your Item Type

**Purpose:** Define what item you want to craft.

**How to:**
1. Click the first dropdown menu labeled "Select Item Category"
2. Browse through categories:
   - **Weapons**: Wands, Staves, Bows, Crossbows, Spears, Maces, etc.
   - **Armor**: Helmets, Body Armours, Gloves, Boots, Shields
   - **Jewelry**: Rings, Amulets, Quivers

3. If applicable, select a subcategory:
   - Body Armours: Pure AR, Pure EV, Pure ES, AR/EV Hybrid, AR/ES Hybrid, EV/ES Hybrid
   - Boots: Pure AR, Pure EV, Pure ES, Hybrid variants
   - Helmets: Same as above
   - Gloves: Same as above

**Example:**
```
Category: Body Armours
Subcategory: Energy Shield/Armour (Hybrid)
```

**Why it matters:** Different item types have different modifier pools. A bow can have "+# to Bow Attack Range" but a wand cannot.

---

### Step 2: Choose Your Desired Modifiers

**Purpose:** Define the exact modifiers you want on your final item.

#### Understanding Modifiers

**Modifier Components:**

1. **Modifier Text**: The actual effect (e.g., "+# to maximum Life")
2. **Tier**: Quality level (T1 = highest values, T5 = lowest values)
   - Example for Life:
     - T1: +80 to 100 Life
     - T2: +70 to 79 Life
     - T3: +60 to 69 Life
     - T4: +50 to 59 Life
     - T5: +40 to 49 Life

3. **Modifier Family**: Grouping that prevents conflicts
   - Example: "LifePrefix" family
   - You cannot have two modifiers from the same family
   - The app prevents you from selecting conflicting modifiers

4. **Source Type**: How the modifier can be obtained
   - **Normal**: Available through standard crafting currencies
   - **Perfect Essence**: Only from perfect essences (guarantees this specific modifier)
   - **Desecrated**: Only from desecrated currency

#### How to Select Modifiers

**For Prefixes:**
1. Click the "Prefixes" tab
2. Scroll through the list of available modifiers
3. For each modifier you want:
   - Click on the modifier name to select it
   - Use the dropdown to choose the tier (default is T1)
4. Selected modifiers appear highlighted
5. You can select up to 3 prefixes

**For Suffixes:**
1. Click the "Suffixes" tab
2. Follow the same process as prefixes
3. You can select up to 3 suffixes

#### Filtering by Source

Use the filter buttons at the top of each tab:
- **All**: Shows all modifiers
- **Normal**: Shows only standard craftable modifiers
- **Perfect Essences**: Shows only perfect essence modifiers
- **Desecrated**: Shows only desecrated currency modifiers

**Why filter?**
- If you don't have perfect essences, filter them out
- If you want the most common craft, stick to "Normal"

#### Common Mistakes to Avoid

❌ **Selecting conflicting modifiers:**
```
Bad: Selecting both "+# to maximum Life" (T1) and "#% increased maximum Life" (T1)
Why: Both are in the "LifePrefix" family
```

✅ **Correct approach:**
```
Good: Select "+# to maximum Life" (T1) from prefixes
     Select "+#% to Fire Resistance" (T1) from suffixes
Why: Different families, no conflict
```

❌ **Mixing impossible combinations:**
```
Bad: Selecting 3 normal prefixes + 1 perfect essence prefix = 4 prefixes
Why: Only 3 prefix slots available
```

---

### Step 3: Understanding Modifier Families

**What are modifier families?**

Modifier families are groups of related modifiers that cannot coexist on the same item. This is a Path of Exile 2 game mechanic.

**Example Families:**

**LifePrefix Family:**
- "+# to maximum Life"
- "#% increased maximum Life"
- "Regenerate # Life per second"

**WeaponDamagePrefix Family:**
- "Adds # to # Physical Damage"
- "#% increased Physical Damage"
- "+# to Accuracy Rating"

**Why this matters:**

If you select:
1. "+# to maximum Life" (from LifePrefix family)

You **CANNOT** also select:
2. "#% increased maximum Life" (also from LifePrefix family)

The application will:
- Gray out conflicting modifiers
- Show a warning if you try to select them
- Prevent you from starting a simulation with conflicts

**How to check:**

Hover over any modifier to see:
- Modifier name
- Tier options
- **Family name** (e.g., "Family: LifePrefix")
- Source type

---

### Step 4: Start Crafting Simulation

**Purpose:** Calculate the optimal crafting paths to achieve your desired modifiers.

**How to:**
1. Ensure you've selected:
   - An item type
   - Between 1 and 6 modifiers total (prefixes + suffixes)
   - No conflicting modifier families

2. Click the **"Start Simulation"** button

3. Wait for the calculation:
   - Complex crafts (6 modifiers): ~2-30 seconds

**What happens during simulation:**

The algorithm:
1. Explores millions of possible crafting sequences
2. Applies all available currencies in different orders
3. Calculates probabilities for each path
4. Ranks paths by success rate
5. Returns the top 10-20 most efficient paths

**If simulation fails:**

The simulation might not find any paths if:
- Your desired modifiers are impossible to achieve together (conflicting families)
- The threshold is too high (try lowering it in settings)
- The combination is extremely rare (algorithm couldn't find it in time limit)

---

### Step 5: Review Results

**Purpose:** Choose the best crafting path and understand the success probability.

#### Understanding the Results Display

Each result shows:

**1. Success Probability**
```
Probability: 0.00002359% (1 in 4,239,159)
```
- Shows chance of success for this exact path
- Higher is better
- "1 in X" format shows expected number of attempts

**2. Expected Cost**
```
Expected Transmutes: ~4.2 million
Expected Regals: ~4.2 million
Expected Exalts: ~500,000
```
- Approximate currency needed to succeed
- Multiply probability by currency used per attempt

**3. Step-by-Step Path**
```
Step 1: Transmutation Orb → Adds 50-100 Physical Damage (T1)
Step 2: Augmentation Orb → +30% Attack Speed (T1)
Step 3: Regal Orb → +80 Life (T1)
Step 4: Exalted Orb → +50% Crit Chance (T1)
Step 5: Essence of Contempt (Dextral Omen) → +45% Fire Res (T1)
Step 6: Essence of Hatred (Dextral Omen) → +45% Cold Res (T1)
```

**4. Detailed Probability Breakdown**

Each step shows:
- Currency used
- Modifier obtained
- Probability of success for that specific step
- Cumulative probability up to that point

#### Interpreting Results

**High Probability Paths (>0.1%):**
- Achievable with reasonable effort
- Expected attempts: <1,000
- Recommended for most crafts

**Medium Probability Paths (0.001% - 0.1%):**
- Requires dedication and currency investment
- Expected attempts: 1,000 - 100,000
- Feasible for valuable items

**Low Probability Paths (<0.001%):**
- Extremely rare outcomes
- Expected attempts: >100,000
- Consider alternative modifier combinations

#### Example Result Interpretation

```
Path A: Probability 0.05% (1 in 2,000)
  Step 1: Transmute → +100 Phys Damage (1/80 = 1.25%)
  Step 2: Augment → +30% Attack Speed (1/40 = 2.5%)
  Step 3: Regal → +80 Life (1/38 = 2.63%)
  Step 4: Exalt → +50% Crit (1/35 = 2.86%)
  Total: 0.0125 × 0.025 × 0.0263 × 0.0286 = 0.05%
```

**What this means:**
- You'll need about 2,000 attempts to succeed
- Each attempt costs: 1 Transmute + 1 Augment + 1 Regal + 1 Exalt
- Total cost: 2,000 of each currency

---

## Advanced Tips

### Tip 1: Use Essences Strategically

**Perfect Essences:**
- Guarantee a specific modifier
- Use them for the hardest-to-hit modifiers
- Combine with omens to protect good modifiers

**Example:**
```
Instead of: Hoping to exalt +50% Crit Chance (1/35 chance)
Do: Use Essence of Contempt (100% chance)
```

### Tip 2: Omen Usage

**Omens modify currency behavior:**

**Dextral Omen:**
- Removes 1 suffix when used with essence
- Keeps prefixes intact
- Perfect for protecting good prefix rolls

**Example:**
```
Item: 3 good prefixes, 2 bad suffixes
Use: Essence + Dextral Omen
Result: 3 prefixes kept, 1 suffix removed, 1 new suffix from essence
```

### Tip 3: Start Simple

**For new players:**
1. Start with 2-3 modifier crafts
2. Learn the interface
3. Understand probability calculations
4. Graduate to 4-6 modifier crafts

**Progression:**
```
Beginner: 2 modifiers (0.1% - 1% success rate)
    ↓
Intermediate: 3-4 modifiers (0.01% - 0.1% success rate)
    ↓
Advanced: 5-6 modifiers (0.001% - 0.01% success rate)
    ↓
Expert: Perfect 6-mod T1 items (0.0001% - 0.001% success rate)
```

### Tip 4: Compare Multiple Paths

The app shows multiple paths for a reason:

**Path A:** Higher probability, uses common currencies
**Path B:** Lower probability, but uses essences you already have
**Path C:** Medium probability, but shorter sequence

**Choose based on:**
- Your currency availability
- Time you want to spend
- Value of the final item

### Tip 5: Tier Flexibility

If a T1 craft is too expensive:

**Try lowering tiers:**
```
T1: +80-100 Life (very rare)
   ↓
T2: +70-79 Life (more common)
   ↓
Cost reduction: Often 5-10x more likely
```

**Check results:** Re-run simulation with T2 tiers to see cost difference

---

## Troubleshooting

### "No crafting paths found"

**Causes:**
1. Conflicting modifier families selected
2. Threshold too restrictive
3. Impossible combination

**Solutions:**
1. Check for family conflicts (hover over modifiers)
2. Lower the threshold in settings
3. Try a different modifier combination

### "Simulation taking too long"

**Causes:**
1. Very complex 6-modifier craft
2. System running slow
3. Background processes

**Solutions:**
1. Wait up to 60 seconds for complex crafts
2. Close other applications
3. Reduce number of modifiers temporarily to test

### "Backend connection error"

**Causes:**
1. Backend server didn't start
2. Port 8080 already in use
3. Firewall blocking connection

**Solutions:**
```bash
# Check if backend is running
curl http://localhost:8080/api/health

# If not running, start manually:
mvn exec:java -Dexec.mainClass="core.ServerMain"

# Check for port conflicts:
netstat -ano | findstr :8080  # Windows
lsof -i :8080                # Linux/Mac
```

### "Modifiers not loading"

**Causes:**
1. Selected item type not fully loaded
2. Server error
3. Data file corruption

**Solutions:**
1. Refresh the page (F5)
2. Check browser console for errors (F12)
3. Restart the application
4. Re-clone the repository if data files are corrupted

### "Wrong probabilities shown"

**Causes:**
1. Out-of-date modifier data
2. Game patch changed mechanics
3. Bug in probability calculation

**Solutions:**
1. Check for application updates
2. Report the issue on GitHub with:
   - Item type
   - Modifiers selected
   - Expected vs actual probability
3. Compare with community crafting guides

---

## Understanding PoE2 Crafting Mechanics

### Rarity Tiers

**Normal (White):**
- 0 modifiers
- Use Transmutation Orb to upgrade to Magic

**Magic (Blue):**
- 1-2 modifiers (1 prefix and/or 1 suffix)
- Use Regal Orb to upgrade to Rare

**Rare (Yellow):**
- 3-6 modifiers (up to 3 prefixes + 3 suffixes)
- Cannot be downgraded

### Crafting Currencies

**Basic Currencies:**
- **Transmutation Orb**: Normal → Magic (adds 1 random modifier)
- **Augmentation Orb**: Magic → Magic (adds 1 random modifier)
- **Regal Orb**: Magic → Rare (adds 1 random modifier)
- **Exalted Orb**: Rare → Rare (adds 1 random modifier)
- **Annulment Orb**: Removes 1 random modifier

**Essences:**
- Guarantee a specific modifier
- Reroll all other modifiers
- Perfect Essences: Highest tier guaranteed

**Desecrated Currency:**
- Adds specific low-tier modifiers
- Useful for filling slots strategically

---

## FAQ

**Q: Can I craft items with only perfect essence modifiers?**
A: No, perfect essence modifiers can only be obtained from perfect essences. You must have access to those essences.

**Q: Why does the probability seem so low?**
A: PoE2 crafting is designed to be challenging. Perfect 6-mod items are intentionally very rare. The app shows realistic probabilities.

**Q: Can I save my crafting plans?**
A: Not yet, but this feature is planned for a future update.

**Q: Does this work for Unique items?**
A: No, unique items cannot be crafted. This tool is for rare items only.

**Q: Can I use this for Influenced items?**
A: Currently, influenced items are not supported. This may be added in future updates.

**Q: How accurate are the probabilities?**
A: Very accurate. The calculations are based on the actual game mechanics and modifier weights.

**Q: Can I share crafting paths?**
A: You can screenshot the results or manually copy the steps. Export/share functionality is planned.

---

## Glossary

**Affix**: General term for modifiers (prefixes or suffixes)
**Prefix**: Modifier that occupies a prefix slot (max 3)
**Suffix**: Modifier that occupies a suffix slot (max 3)
**Tier**: Quality level of a modifier (T1 = best, T5 = worst)
**Family**: Group of related modifiers that conflict
**Beam Search**: Algorithm used to find optimal crafting paths
**Heuristic**: Scoring function that estimates path quality
**Omen**: Currency modifier that changes crafting behavior
**Essence**: Currency that guarantees a specific modifier
**Exalt**: Short for Exalted Orb
**Regal**: Short for Regal Orb
**Aug**: Short for Augmentation Orb
**Trans**: Short for Transmutation Orb
**Annul**: Short for Annulment Orb

---

## Getting Help

**Community Resources:**
- [GitHub Issues](https://github.com/Dboire9/POE2_HTC/issues) - Bug reports and feature requests
- [GitHub Discussions](https://github.com/Dboire9/POE2_HTC/discussions) - Questions and community help
- [PoE2 Wiki](https://www.poewiki.net/wiki/Path_of_Exile_2) - Game mechanics reference

**Reporting Bugs:**
1. Check existing issues first
2. Provide detailed steps to reproduce
3. Include screenshots if applicable
4. Mention your OS and application version
