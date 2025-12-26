// Simulate browser environment
global.window = global;
global.document = {
  head: { appendChild: () => {} },
  getElementById: (id) => ({
    innerHTML: '',
    value: '2',
    addEventListener: () => {}
  }),
  createElement: () => ({
    onload: null,
    onerror: null,
    src: ''
  })
};

console.log('Loading main.js...');
require('./main.js');

setTimeout(() => {
  console.log('Test completed');
}, 2000);
