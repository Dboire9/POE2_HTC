# Slow Request Monitoring

This system monitors and logs HTTP requests that take longer than 2 seconds to complete, helping identify performance bottlenecks in the crafting algorithm.

## Backend Monitoring

The backend automatically logs slow requests using `SlowRequestMonitor.java`.

### How It Works

1. `SlowRequestMonitor` is a utility class that checks request duration
2. When `/api/crafting` completes, the duration is checked against the 2-second threshold
3. If exceeded, the request JSON and metadata are saved to `slow-requests-logs/`
4. Files are named: `slow_request_YYYYMMDD_HHmmss_SSS_DURATIONms.json`

### Configuration

To change the threshold, edit `SlowRequestMonitor.java`:

```java
private static final long SLOW_THRESHOLD_MS = 2000; // milliseconds
```

### Log Files

Each slow request generates two files:

- `.json` - The complete request body (can be replayed for testing)
- `.meta` - Metadata (timestamp, duration, endpoint, threshold)

Example:
```
slow-requests-logs/
  slow_request_20231204_143052_123_3456ms.json
  slow_request_20231204_143052_123_3456ms.meta
```

### Console Output

When a slow request is logged, you'll see:

```
⚠️  SLOW REQUEST LOGGED: /api/crafting took 3456ms (threshold: 2000ms)
   Saved to: /path/to/slow-requests-logs/slow_request_20231204_143052_123_3456ms.json
```

## Manual Testing Script

Use `scripts/monitor-slow-requests.sh` to manually test and monitor requests:

```bash
./scripts/monitor-slow-requests.sh [threshold_ms] [request.json]
```

### Examples

```bash
# Monitor with 2-second threshold (default)
./scripts/monitor-slow-requests.sh 2000 test-request.json

# Use a stricter 1-second threshold
./scripts/monitor-slow-requests.sh 1000 complex-crafting.json

# Monitor all requests (0ms threshold)
./scripts/monitor-slow-requests.sh 0 request.json
```

### How It Works

1. Reads request JSON from file
2. Sends POST to `http://localhost:8080/api/crafting`
3. Measures total response time with `curl`
4. If time exceeds threshold, saves request + creates metadata file
5. Logs results to console

## Usage in Production

After deploying to the server, slow requests are automatically logged to:
```
/home/admin/POE2_HTC/slow-requests-logs/
```

### Check Logs on Server

```bash
ssh -i ../LightsailDefaultKey-eu-west-3.pem admin@51.45.30.7
cd /home/admin/POE2_HTC
ls -lh slow-requests-logs/
```

### View a Slow Request

```bash
# View the request JSON
cat slow-requests-logs/slow_request_TIMESTAMP_DURATIONms.json | jq .

# View metadata
cat slow-requests-logs/slow_request_TIMESTAMP_DURATIONms.meta
```

### Replay a Slow Request

```bash
# Copy to local machine
scp -i ../LightsailDefaultKey-eu-west-3.pem \
    admin@51.45.30.7:/home/admin/POE2_HTC/slow-requests-logs/slow_request_*.json \
    ./

# Test locally
curl -X POST http://localhost:8080/api/crafting \
     -H "Content-Type: application/json" \
     -d @slow_request_*.json
```

## Troubleshooting

### No logs appearing

1. Check threshold is set appropriately (default: 2000ms)
2. Verify requests are actually taking longer than threshold
3. Check directory permissions: `ls -ld slow-requests-logs/`
4. Check backend logs: `sudo tail -f /var/log/poe2-backend.log`

### Testing slow requests

Create a complex crafting scenario with:
- 6+ desired modifiers
- High tier requirements (T1-T2)
- Multiple essence/desecrated modifiers
- 1000+ iterations

### Directory not created

The `slow-requests-logs/` directory is created automatically on server startup. If missing:

```bash
mkdir -p slow-requests-logs
chmod 755 slow-requests-logs
```

## Deployment

To deploy monitoring updates to the server:

```bash
./scripts/deploy-monitoring-to-server.sh
```

This will:
1. Copy `SlowRequestMonitor.java` and `ServerMain.java` to server
2. Rebuild the backend with Maven
3. Create `slow-requests-logs/` directory
4. Restart the backend service

After deployment, monitor the backend logs:
```bash
ssh -i ../LightsailDefaultKey-eu-west-3.pem admin@51.45.30.7
sudo journalctl -u poe2-backend -f
```
