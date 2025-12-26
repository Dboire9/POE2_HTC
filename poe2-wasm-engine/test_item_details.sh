#!/bin/bash
# Test script to verify item details functionality

echo "Testing WASM item details..."

# Start in background if not running
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "Server not running, starting..."
    cd /home/dorian/POE2_HTC/poe2-wasm-engine
    npm run dev > /dev/null 2>&1 &
    sleep 3
fi

# Test with headless browser simulation
node << 'EOF'
const Module = require('/home/dorian/POE2_HTC/poe2-wasm-engine/public/poe2.js');

Module.onRuntimeInitialized = () => {
    console.log('✅ WASM initialized');
    
    const getItemsCount = Module.cwrap('get_items_count', 'number', []);
    const getItemName = Module.cwrap('get_item_name', 'string', ['number']);
    const getItemClass = Module.cwrap('get_item_class', 'number', ['number']);
    
    const itemIdx = 30; // Body_Armours_str
    const name = getItemName(itemIdx);
    const itemClass = getItemClass(itemIdx);
    
    console.log(`\n📦 Item[${itemIdx}]:`);
    console.log(`  Name: ${name}`);
    console.log(`  Class: ${itemClass}`);
    
    if (name && itemClass >= 0) {
        console.log('\n✅ Item details API working correctly!');
    } else {
        console.log('\n❌ Item details API failed!');
    }
};
EOF
