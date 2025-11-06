#!/bin/bash

# Sync site: Commit and push from VPS, then pull to local

VPS_HOST="root@96.30.194.79"
VPS_APP_PATH="/var/www/repos/mango/app"

echo "🔄 Syncing site from VPS to local..."
echo ""

# Step 1: SSH into VPS and commit/push
echo "📤 Step 1: Committing and pushing from VPS..."
ssh "$VPS_HOST" "cd $VPS_APP_PATH && git add . && git commit -m 'sync request from local' && git push"

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: VPS commit/push had issues (this is normal if there are no changes)"
fi

echo ""

# Step 2: Pull changes to local
echo "📥 Step 2: Pulling changes to local..."
git pull

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Sync completed successfully"
else
    echo ""
    echo "✗ Local pull failed"
    exit 1
fi

