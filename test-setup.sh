#!/bin/bash

# Quick test script to verify Lambda deployment setup

echo "🧪 Testing Lambda Deployment Setup..."

# Check if files exist
echo "📁 Checking required files..."

if [ -f "serverless.yml" ]; then
    echo "✅ serverless.yml found"
else
    echo "❌ serverless.yml missing"
    exit 1
fi

if [ -f "lambda/app.js" ]; then
    echo "✅ lambda/app.js found"
else
    echo "❌ lambda/app.js missing"
    exit 1
fi

if [ -f "deploy-lambda.sh" ]; then
    echo "✅ deploy-lambda.sh found"
else
    echo "❌ deploy-lambda.sh missing"
    exit 1
fi

# Check if build directory exists
if [ -d "dist" ]; then
    echo "✅ dist directory found (React app built)"
else
    echo "⚠️ dist directory not found - need to run 'npm run build'"
fi

# Test Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

if [[ "$NODE_VERSION" < "v18" ]]; then
    echo "⚠️ Node.js version 18+ recommended for AWS Lambda"
else
    echo "✅ Node.js version is compatible"
fi

# Check if AWS CLI is available
if command -v aws &> /dev/null; then
    echo "✅ AWS CLI is available"
    aws --version
else
    echo "⚠️ AWS CLI not found (optional but recommended)"
fi

# Test if serverless is available
if command -v serverless &> /dev/null; then
    echo "✅ Serverless Framework is available"
    serverless --version
else
    echo "⚠️ Serverless Framework not found (will be installed during deployment)"
fi

echo ""
echo "🎯 Setup verification complete!"
echo "📝 Run './deploy-lambda.sh' to deploy to AWS Lambda"
