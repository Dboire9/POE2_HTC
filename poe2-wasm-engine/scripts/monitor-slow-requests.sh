#!/bin/bash

# Monitor slow requests to POE2 backend
# Usage: ./monitor-slow-requests.sh [threshold_in_seconds]

THRESHOLD=${1:-2}  # Default 2 seconds
LOG_DIR="./slow-requests-logs"
BACKEND_URL="http://localhost:8080"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create log directory
mkdir -p "$LOG_DIR"

echo "Monitoring POE2 backend for requests taking longer than ${THRESHOLD}s..."
echo "Logs will be saved to: $LOG_DIR"
echo "Press Ctrl+C to stop monitoring"
echo ""

# Counter for slow requests
SLOW_COUNT=0

# Monitor function
monitor_request() {
    local request_file=$1
    local request_timestamp=$(date +%Y%m%d_%H%M%S_%N)
    
    # Time the request
    local start_time=$(date +%s.%N)
    
    # Send the request and capture response
    local response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
        -X POST "$BACKEND_URL/api/craft" \
        -H "Content-Type: application/json" \
        -d @"$request_file")
    
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)
    
    # Check if duration exceeds threshold
    if (( $(echo "$duration > $THRESHOLD" | bc -l) )); then
        SLOW_COUNT=$((SLOW_COUNT + 1))
        
        echo "⚠️  SLOW REQUEST DETECTED (#$SLOW_COUNT)"
        echo "   Duration: ${duration}s"
        echo "   Timestamp: $request_timestamp"
        
        # Save the request JSON
        local log_file="$LOG_DIR/slow_request_${request_timestamp}_${duration}s.json"
        cp "$request_file" "$log_file"
        
        # Save metadata
        cat > "$LOG_DIR/slow_request_${request_timestamp}_${duration}s.meta" <<EOF
Timestamp: $(date)
Duration: ${duration}s
Threshold: ${THRESHOLD}s
Backend URL: $BACKEND_URL
Request File: $request_file
EOF
        
        echo "   Saved to: $log_file"
        echo ""
    else
        echo "✓ Request completed in ${duration}s"
    fi
}

# If a test request file is provided, monitor it
if [ -n "$2" ]; then
    monitor_request "$2"
    exit 0
fi

# Otherwise, create a sample monitoring setup
cat > /tmp/sample_craft_request.json <<'EOF'
{
  "itemType": "Bow",
  "desiredModifiers": [
    {
      "text": "Adds # to # Physical Damage",
      "tier": 1,
      "type": "prefix"
    },
    {
      "text": "#% increased Physical Damage",
      "tier": 1,
      "type": "prefix"
    },
    {
      "text": "Bow Attacks fire 2 additional Arrows",
      "tier": 1,
      "type": "prefix"
    }
  ],
  "excludedCurrencies": [],
  "minTier": 0
}
EOF

echo "No request file provided. Use: ./monitor-slow-requests.sh [threshold] [request.json]"
echo "Example request created at: /tmp/sample_craft_request.json"
