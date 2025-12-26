// WASM Module placeholder (will be loaded once compiled)
let Module = null;
let wasmReady = false;

// WASM API wrappers
let wasmAPI = {
  getModifiersNormalCount: null,
  getModifiersDesecratedCount: null,
  getModifiersEssenceCount: null,
  getModifiersPerfectEssenceCount: null,
  getItemsCount: null,
  getItemName: null,
  getModifierName: null,
  getModifierGroup: null,
  getModifierTierCount: null,
  getModifierTierName: null,
  getModifierTierLevelReq: null,
  getModifierTierWeight: null
};

// Load WASM
async function loadWasm() {
  try {
    const script = document.createElement('script');
    script.src = '/poe2.js';
    script.onload = () => {
      Module = window.Module;
      Module.onRuntimeInitialized = () => {
        // Wrap C functions
        wasmAPI.getModifiersNormalCount = Module.cwrap('get_modifiers_normal_count', 'number', []);
        wasmAPI.getModifiersDesecratedCount = Module.cwrap('get_modifiers_desecrated_count', 'number', []);
        wasmAPI.getModifiersEssenceCount = Module.cwrap('get_modifiers_essence_count', 'number', []);
        wasmAPI.getModifiersPerfectEssenceCount = Module.cwrap('get_modifiers_perfect_essence_count', 'number', []);
        wasmAPI.getItemsCount = Module.cwrap('get_items_count', 'number', []);
        wasmAPI.getItemName = Module.cwrap('get_item_name', 'string', ['number']);
        wasmAPI.getModifierName = Module.cwrap('get_modifier_name', 'string', ['number', 'number']);
        wasmAPI.getModifierGroup = Module.cwrap('get_modifier_group', 'string', ['number', 'number']);
        wasmAPI.getModifierTierCount = Module.cwrap('get_modifier_tier_count', 'number', ['number', 'number']);
        wasmAPI.getModifierTierName = Module.cwrap('get_modifier_tier_name', 'string', ['number', 'number', 'number']);
        wasmAPI.getModifierTierLevelReq = Module.cwrap('get_modifier_tier_level_req', 'number', ['number', 'number', 'number']);
        wasmAPI.getModifierTierWeight = Module.cwrap('get_modifier_tier_weight', 'number', ['number', 'number', 'number']);
        
        wasmReady = true;
        console.log('✅ WASM Module loaded');
        initUI();
      };
    };
    script.onerror = () => {
      console.error('❌ WASM not compiled yet. Run: npm run build:wasm');
      document.getElementById('statsOutput').innerHTML = 
        '<span class="error">⚠️ WASM not compiled. Run: npm run build:wasm</span>';
    };
    document.head.appendChild(script);
  } catch (e) {
    console.error('Failed to load WASM:', e);
  }
}

// Mock data until WASM is ready
const MOCK_ITEMS = [
  'Body Armour', 'Boots', 'Gloves', 'Helmet', 'Belt',
  'Amulet', 'Ring', 'Bow', 'Sword', 'Axe'
];

function initUI() {
  const itemSelect = document.getElementById('itemSelect');
  const craftItem = document.getElementById('craftItem');
  
  // Clear existing options first (except the placeholder)
  itemSelect.innerHTML = '<option value="">Select an item...</option>';
  craftItem.innerHTML = '<option value="">Select item to craft...</option>';
  
  // Load real items from WASM if available
  if (wasmReady && wasmAPI.getItemsCount) {
    try {
      const itemCount = wasmAPI.getItemsCount();
      console.log(`Loading ${itemCount} items from WASM...`);
      
      for (let i = 0; i < itemCount; i++) {
        const name = wasmAPI.getItemName(i);
        if (name) {
          const opt1 = new Option(name, i);
          const opt2 = new Option(name, i);
          itemSelect.appendChild(opt1);
          craftItem.appendChild(opt2);
        }
      }
      console.log('✅ Items loaded successfully');
    } catch (e) {
      console.error('Failed to load items:', e);
      loadMockItems(itemSelect, craftItem);
    }
  } else {
    console.log('WASM not ready, loading mock items');
    loadMockItems(itemSelect, craftItem);
  }
}

function loadMockItems(itemSelect, craftItem) {
  MOCK_ITEMS.forEach((item, idx) => {
    const opt1 = new Option(item, idx);
    const opt2 = new Option(item, idx);
    itemSelect.appendChild(opt1);
    craftItem.appendChild(opt2);
  });
}

// Setup event listeners after DOM is loaded
function setupEventListeners() {
// Database Stats
document.getElementById('loadStats').addEventListener('click', () => {
  const output = document.getElementById('statsOutput');
  if (!wasmReady) {
    output.innerHTML = `<span class="info">📊 WASM Stats (Hardcoded - WASM not loaded)</span>

<span class="success">✓ Modifiers:</span> 1337 total
  - NORMAL: 635
  - DESECRATED: 359
  - ESSENCE: 264
  - PERFECT_ESSENCE: 79

<span class="success">✓ Tiers:</span> 5471 total

<span class="success">✓ Items:</span> 41 total

<span class="success">✓ Memory:</span> ~2.1 MB (modifiers_data.c)

<span class="info">Compile WASM to get live data:</span>
  cd wasm && emcc -O3 -s WASM=1 \\
    -s EXPORTED_FUNCTIONS='["_malloc","_free"]' \\
    -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \\
    -I. core/*.c memory/*.c api/api.c -o ../public/poe2.js`;
  } else {
    // Call WASM API
    const normalCount = wasmAPI.getModifiersNormalCount();
    const desecratedCount = wasmAPI.getModifiersDesecratedCount();
    const essenceCount = wasmAPI.getModifiersEssenceCount();
    const perfectEssenceCount = wasmAPI.getModifiersPerfectEssenceCount();
    const totalMods = normalCount + desecratedCount + essenceCount + perfectEssenceCount;
    const itemsCount = wasmAPI.getItemsCount();
    
    output.innerHTML = `<span class="info">📊 WASM Database Stats (Live from C)</span>

<span class="success">✓ Modifiers:</span> ${totalMods} total
  - NORMAL: ${normalCount}
  - DESECRATED: ${desecratedCount}
  - ESSENCE: ${essenceCount}
  - PERFECT_ESSENCE: ${perfectEssenceCount}

<span class="success">✓ Items:</span> ${itemsCount} total

<span class="success">✓ WASM Size:</span> ${(Module.wasmBinary?.byteLength / 1024).toFixed(1)} KB

<span class="info">✅ Live data loaded from compiled C database!</span>`;
  }
});

// Item Details
document.getElementById('showItem').addEventListener('click', () => {
  const output = document.getElementById('itemOutput');
  const itemIdx = parseInt(document.getElementById('itemSelect').value);
  
  if (isNaN(itemIdx)) {
    output.innerHTML = '<span class="error">⚠️ Select an item first</span>';
    return;
  }
  
  if (!wasmReady) {
    output.innerHTML = `<span class="info">📦 Item: ${MOCK_ITEMS[itemIdx]}</span>

<span class="success">Prefixes:</span>
  - IncreasedLife (NORMAL, idx=317, max_tier=8)
  - IncreasedArmour (NORMAL, idx=105, max_tier=12)
  - IncreasedEvasion (NORMAL, idx=220, max_tier=11)

<span class="success">Suffixes:</span>
  - FireResistance (NORMAL, idx=89, max_tier=7)
  - ColdResistance (NORMAL, idx=52, max_tier=7)
  - MovementSpeed (NORMAL, idx=285, max_tier=4)

<span class="info">Note:</span> This is mock data. Compile WASM for real lookup tables.`;
  } else {
    const itemName = wasmAPI.getItemName(itemIdx);
    const itemClass = wasmAPI.getItemClass(itemIdx);
    
    output.innerHTML = `<span class="info">📦 Item: ${itemName}</span>

<span class="success">Item Class:</span> ${itemClass}
<span class="success">Item Level:</span> 85

<span class="success">Available Modifiers:</span>
This item can have prefixes and suffixes from the NORMAL, DESECRATED, ESSENCE, and PERFECT_ESSENCE pools.

<span class="info">Note:</span> Lookup tables for item→modifier mapping need to be exposed via API.
Full modifier details will be available once item_mod_lookup functions are added.

<span class="info">✅ Live data from C database!</span>`;
  }
});

// Modifier Details
document.getElementById('showMod').addEventListener('click', () => {
  const output = document.getElementById('modOutput');
  const source = parseInt(document.getElementById('modSource').value);
  const index = parseInt(document.getElementById('modIndex').value);
  
  if (isNaN(index)) {
    output.innerHTML = '<span class="error">⚠️ Enter a modifier index</span>';
    return;
  }
  
  const sources = ['NORMAL', 'DESECRATED', 'ESSENCE', 'PERFECT_ESSENCE'];
  
  if (!wasmReady) {
    output.innerHTML = `<span class="info">🔧 Modifier [${sources[source]}][${index}]</span>

<span class="success">Name:</span> IncreasedLife
<span class="success">Group:</span> Life
<span class="success">Tiers:</span> 13

<span class="success">Tier Values:</span>
  T13: Prime (+130-145 life)
  T12: Athlete's (+116-129 life)
  T11: Vigorous (+102-115 life)
  T10: Stout (+88-101 life)
  ...
  T1: Hale (+10-14 life)

<span class="info">Note:</span> This is mock data. Compile WASM for real modifier data.`;
  } else {
    const name = wasmAPI.getModifierName(source, index);
    const group = wasmAPI.getModifierGroup(source, index);
    const tierCount = wasmAPI.getModifierTierCount(source, index);
    
    if (!name) {
      output.innerHTML = `<span class="error">⚠️ Modifier not found at [${sources[source]}][${index}]</span>`;
      return;
    }
    
    let tiers = [];
    for (let i = 0; i < Math.min(tierCount, 5); i++) {
      const tierName = wasmAPI.getModifierTierName(source, index, i);
      const levelReq = wasmAPI.getModifierTierLevelReq(source, index, i);
      const weight = wasmAPI.getModifierTierWeight(source, index, i);
      tiers.push(`  T${i + 1}: ${tierName} (lvl ${levelReq}, weight ${weight})`);
    }
    if (tierCount > 5) tiers.push(`  ... ${tierCount - 5} more tiers`);
    
    output.innerHTML = `<span class="info">🔧 Modifier [${sources[source]}][${index}]</span>

<span class="success">Name:</span> ${name}
<span class="success">Group:</span> ${group}
<span class="success">Tiers:</span> ${tierCount}

<span class="success">First Tiers:</span>
${tiers.join('\n')}

<span class="info">✅ Live data from C database!</span>`;
  }
});

// Crafting
document.getElementById('transmute').addEventListener('click', () => {
  simulateCraft('Transmute');
});

document.getElementById('augment').addEventListener('click', () => {
  simulateCraft('Augment');
});

document.getElementById('regal').addEventListener('click', () => {
  simulateCraft('Regal');
});

function simulateCraft(currency) {
  const output = document.getElementById('craftOutput');
  const itemIdx = document.getElementById('craftItem').value;
  
  if (!itemIdx) {
    output.innerHTML = '<span class="error">⚠️ Select an item first</span>';
    return;
  }
  
  const item = MOCK_ITEMS[itemIdx];
  const results = [];
  
  if (currency === 'Transmute') {
    results.push(`<span class="success">✓ ${item} (Magic)</span>`);
    results.push(`Prefix: Hale (+12 life)`);
    results.push(`Suffix: of Fire (15% fire res)`);
  } else if (currency === 'Augment') {
    results.push(`<span class="success">✓ Added modifier</span>`);
    results.push(`Suffix: of the Cheetah (8% movement speed)`);
  } else if (currency === 'Regal') {
    results.push(`<span class="success">✓ ${item} (Rare)</span>`);
    results.push(`Added Prefix: Vigorous (+108 life)`);
  }
  
  output.innerHTML = `<span class="info">🎲 Applied ${currency} to ${item}</span>\n\n${results.join('\n')}

<span class="info">Note:</span> This is mock simulation. Compile WASM + implement calculator.c for real crafting.`;
}

} // End of setupEventListeners

// Load WASM on startup
loadWasm();

// Setup event listeners when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
  setupEventListeners();
}
