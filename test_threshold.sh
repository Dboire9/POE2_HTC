#!/bin/bash
# Test to verify threshold system works correctly

echo "Testing crafting with simple modifiers (should complete quickly)..."

# Test with just 2 easy modifiers
curl -s "http://localhost:8080/api/crafting" \
  -H "Content-Type: application/json" \
  -d '{"itemId":"Bows","modifiers":{"prefixes":[{"id":"PhysicalDamage","tier":0}],"suffixes":[{"id":"IncreasedAttackSpeed","tier":0}]},"iterations":10}' \
  | grep -q '"results"' && echo "✓ Simple test passed" || echo "✗ Simple test failed"

echo ""
echo "Testing that threshold decrements correctly..."
echo "Check backend.log for threshold countdown (should see: 50%, 49%, 48%...)"
tail -20 /home/dorian/POE2_HTC/backend.log | grep "threshold:" | head -5
