#!/bin/zsh

source ~/.zshrc

# Check if a commit message was provided
if [ "$#" -ne 1 ]; then
    echo "Please provide a commit message"
    exit 1
fi

# The commit message is the first argument to the script
COMMIT_MESSAGE="$1"

# Add changes to the staging area
# You can adjust this to add specific files or use other git add options
git add .

# Commit the changes with the provided commit message
git commit -m "$COMMIT_MESSAGE"

# Push changes to the Git repository
git push

# Check if the push was successful
if [ $? -eq 0 ]; then
    echo "🐈 Done pushing changes to git. Now pulling changes to VPS."
else
    echo "Git push failed"
    exit 1
fi


echo "Backing up db..."
# Sync the database
cp ./data.db ../data.bkp.db
# Copy the files to the VPS
ssh_main "\
cd /var/www/repos/mango/app; \
git reset --hard origin/main; \
git pull; \
echo '👍 pulled changes from git and reset to origin'; \
echo 'Current directory: '; pwd; \
echo '🏗️ Building docker now...'; \
docker compose down; \
if ! DOCKER_BUILDKIT=1 docker compose up -d --build; then \
  echo '❌ DEPLOYMENT FAILED: docker compose up returned an error'; \
  exit 1; \
fi; \
sleep 3; \
STATUS=\$(docker inspect -f '{{.State.Status}}' mengou 2>/dev/null); \
if [ \"\$STATUS\" != 'running' ]; then \
  echo '❌ DEPLOYMENT FAILED: container mengou is not running (status: '\$STATUS')'; \
  docker inspect -f 'Error: {{.State.Error}} (exit code {{.State.ExitCode}})' mengou; \
  docker compose logs --tail=30; \
  exit 1; \
fi; \
echo '🚀🚀🚀 Deployment successful'"

# Check if the remote deploy was successful
if [ $? -eq 0 ]; then
    echo "⭐️🚀✅ Deployment successful"
else
    echo "❌ Deployment failed — see output above"
    exit 1
fi
