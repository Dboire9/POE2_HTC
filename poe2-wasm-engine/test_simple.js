const http = require('http');

console.log('Testing http://localhost:5173/simple.html...\n');

http.get('http://localhost:5173/simple.html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (data.includes('<h1>🔥 POE2 WASM Tester</h1>')) {
      console.log('✅ Page loads correctly');
      console.log('✅ Title found');
      
      if (data.includes('poe2.js')) {
        console.log('✅ WASM script included');
      }
      
      if (data.includes('showItemDetails')) {
        console.log('✅ Item details function found');
      }
      
      console.log('\n📌 Open browser to: http://localhost:5173/simple.html');
      console.log('   1. Wait for "✅ WASM Loaded!" status');
      console.log('   2. Select an item from dropdown');
      console.log('   3. Click "Show Details"');
      
    } else {
      console.log('❌ Page not loading correctly');
    }
    process.exit(0);
  });
}).on('error', (e) => {
  console.error('❌ Server not responding:', e.message);
  process.exit(1);
});
