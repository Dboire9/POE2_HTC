#!/bin/bash

# Deploy slow request monitoring to AWS server
SERVER="admin@51.45.30.7"
KEY="../LightsailDefaultKey-eu-west-3.pem"
REMOTE_DIR="/home/admin/POE2_HTC"

echo "🚀 Deploying slow request monitoring to server..."
echo ""

# Step 0: Create API directory if it doesn't exist
echo "📁 Ensuring directories exist on server..."
ssh -i "$KEY" "$SERVER" "mkdir -p $REMOTE_DIR/src/main/java/core/API"

if [ $? -ne 0 ]; then
    echo "❌ Failed to create directories"
    exit 1
fi

# Step 1: Copy new Java files to server
echo "📦 Copying Java source files..."
echo "   - SlowRequestMonitor.java"
scp -i "$KEY" \
    src/main/java/core/API/SlowRequestMonitor.java \
    "$SERVER:$REMOTE_DIR/src/main/java/core/API/SlowRequestMonitor.java"

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy SlowRequestMonitor.java"
    exit 1
fi

echo "   - ServerMain.java"
scp -i "$KEY" \
    src/main/java/core/ServerMain.java \
    "$SERVER:$REMOTE_DIR/src/main/java/core/ServerMain.java"

if [ $? -ne 0 ]; then
    echo "❌ Failed to copy ServerMain.java"
    exit 1
fi

echo "✅ Files copied successfully"
echo ""

# Step 2: Rebuild on server
echo "🔨 Building project on server..."
ssh -i "$KEY" "$SERVER" << 'ENDSSH'
cd /home/admin/POE2_HTC

# Create slow-requests-logs directory
mkdir -p slow-requests-logs
chmod 755 slow-requests-logs

# Build the project
mvn clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Update the backend.jar symlink
cd /home/admin
JAR_FILE=$(ls -t POE2_HTC/target/poe-crafter-*-jar-with-dependencies.jar | head -1)
if [ -f "$JAR_FILE" ]; then
    ln -sf "$JAR_FILE" backend.jar
    echo "✅ Updated backend.jar symlink"
else
    echo "❌ JAR file not found"
    exit 1
fi

ENDSSH

if [ $? -ne 0 ]; then
    echo "❌ Server build failed"
    exit 1
fi

echo "✅ Build completed successfully"
echo ""

# Step 3: Restart service
echo "🔄 Restarting backend service..."
ssh -i "$KEY" "$SERVER" << 'ENDSSH'
sudo systemctl restart poe2-backend
sleep 3
sudo systemctl status poe2-backend --no-pager
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 To check slow request logs on the server:"
echo "   ssh -i $KEY $SERVER"
echo "   cd /home/admin/POE2_HTC"
echo "   ls -lh slow-requests-logs/"
echo ""
echo "📝 To view backend logs:"
echo "   ssh -i $KEY $SERVER 'sudo tail -f /var/log/poe2-backend.log'"
