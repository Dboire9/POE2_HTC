#!/bin/bash
# Test crafting simulation with debug output

echo "========================================="
echo "   CRAFTING SIMULATION DEBUG TEST"
echo "========================================="
echo ""
echo "Clearing old logs..."
> /home/dorian/POE2_HTC/backend_test.log

echo "Sending crafting request..."
echo "Item: Bows"
echo "Modifiers: LocalPhysicalDamagePercent (T0), IncreasedAttackSpeed (T0)"
echo ""

# Send request and capture response
RESPONSE=$(curl -s "http://localhost:8080/api/crafting" \
  -H "Content-Type: application/json" \
  -d '{"itemId":"Bows","modifiers":{"prefixes":[{"id":"LocalPhysicalDamagePercent","tier":0}],"suffixes":[{"id":"IncreasedAttackSpeed","tier":0}]},"iterations":5}')

echo "Waiting for processing..."
sleep 2

echo ""
echo "========================================="
echo "   BACKEND DEBUG OUTPUT"
echo "========================================="
tail -100 /home/dorian/POE2_HTC/backend.log | \
  sed -n '/=== CRAFTING REQUEST START ===/,/=== CRAFTING REQUEST END ===/p' | \
  tail -50

echo ""
echo "========================================="
echo "   RESPONSE SUMMARY"
echo "========================================="
echo "$RESPONSE" | grep -o '"status":"[^"]*"' || echo "Response: $RESPONSE"
echo ""
echo "Full response saved to /tmp/crafting_debug_response.json"
echo "$RESPONSE" > /tmp/crafting_debug_response.json
