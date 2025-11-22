#!/bin/bash
pkill -9 -f core.ServerMain
sleep 2
cd /home/dorian/POE2_HTC
mvn clean compile -q
echo "✓ Compiled"
DEBUG_LEVEL=INFO mvn exec:java -Dexec.mainClass=core.ServerMain -q > /tmp/server-cors-fix.log 2>&1 &
sleep 5
curl -s http://localhost:8080/health
echo " ✓ Server ready"
