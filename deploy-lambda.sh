#!/bin/bash

# Stridecal Investment Analysis - AWS Lambda Deployment Script
# This script builds and deploys your React app to AWS Lambda + API Gateway

set -e

echo "🚀 Starting Stridecal Investment Analysis Lambda Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo -e "${BLUE}📋 Checking requirements...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js and npm are installed${NC}"
}

# Install serverless framework globally if not present
install_serverless() {
    if ! command -v serverless &> /dev/null; then
        echo -e "${YELLOW}📦 Installing Serverless Framework...${NC}"
        npm install -g serverless
    else
        echo -e "${GREEN}✅ Serverless Framework is already installed${NC}"
    fi
}

# Setup AWS credentials check
check_aws_credentials() {
    echo -e "${BLUE}🔐 Checking AWS credentials...${NC}"
    
    if [[ -z "$AWS_ACCESS_KEY_ID" || -z "$AWS_SECRET_ACCESS_KEY" ]]; then
        echo -e "${YELLOW}⚠️  AWS credentials not found in environment variables.${NC}"
        echo -e "${BLUE}Please set up your AWS credentials using one of these methods:${NC}"
        echo "1. Run: aws configure (if AWS CLI is installed)"
        echo "2. Set environment variables:"
        echo "   export AWS_ACCESS_KEY_ID=your_access_key"
        echo "   export AWS_SECRET_ACCESS_KEY=your_secret_key"
        echo "3. Use AWS credential files in ~/.aws/"
        echo ""
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo -e "${GREEN}✅ AWS credentials found${NC}"
    fi
}

# Build the React application
build_react_app() {
    echo -e "${BLUE}🏗️  Building React application...${NC}"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing React app dependencies...${NC}"
        npm install
    fi
    
    # Build the React app
    echo -e "${BLUE}🔨 Building production version...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ React build completed successfully${NC}"
    else
        echo -e "${RED}❌ React build failed${NC}"
        exit 1
    fi
}

# Setup Lambda environment
setup_lambda_environment() {
    echo -e "${BLUE}⚙️  Setting up Lambda environment...${NC}"
    
    # Copy package.json for Lambda
    if [ -f "package-lambda.json" ]; then
        cp package-lambda.json package.json.bak
        mv package-lambda.json package.json
    fi
    
    # Install Lambda-specific dependencies
    echo -e "${YELLOW}📦 Installing Lambda dependencies...${NC}"
    npm install serverless serverless-offline serverless-plugin-warmup --save-dev
    npm install aws-lambda --save
    
    echo -e "${GREEN}✅ Lambda environment setup completed${NC}"
}

# Deploy to AWS Lambda
deploy_to_lambda() {
    echo -e "${BLUE}🚀 Deploying to AWS Lambda...${NC}"
    
    # Choose deployment stage
    echo -e "${YELLOW}Please choose deployment stage:${NC}"
    echo "1. dev (development)"
    echo "2. prod (production)"
    read -p "Enter choice (1 or 2): " stage_choice
    
    case $stage_choice in
        1)
            STAGE="dev"
            ;;
        2)
            STAGE="prod"
            ;;
        *)
            echo -e "${YELLOW}Invalid choice. Using 'dev' as default.${NC}"
            STAGE="dev"
            ;;
    esac
    
    echo -e "${BLUE}🌍 Deploying to ${STAGE} environment...${NC}"
    
    # Deploy using serverless
    serverless deploy --stage $STAGE
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
        echo ""
        echo -e "${BLUE}📋 Deployment Summary:${NC}"
        echo "• Stage: $STAGE"
        echo "• Service: stridecal-investment-analysis"
        echo "• Region: us-east-1"
        echo ""
        echo -e "${GREEN}🌐 Your app endpoints:${NC}"
        serverless info --stage $STAGE
    else
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
}

# Cleanup function
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up...${NC}"
    
    # Restore original package.json if backup exists
    if [ -f "package.json.bak" ]; then
        mv package.json.bak package.json
    fi
}

# Main execution
main() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}  Stridecal Investment Analysis       ${NC}"
    echo -e "${BLUE}  AWS Lambda Deployment               ${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
    
    check_requirements
    install_serverless
    check_aws_credentials
    build_react_app
    setup_lambda_environment
    deploy_to_lambda
    cleanup
    
    echo ""
    echo -e "${GREEN}🎊 All done! Your investment analysis app is now live on AWS Lambda!${NC}"
    echo -e "${BLUE}📖 You can now access your app using the URLs shown above.${NC}"
    echo ""
    echo -e "${YELLOW}💡 Useful commands:${NC}"
    echo "• View logs: serverless logs -f app -t --stage $STAGE"
    echo "• Update deployment: ./deploy-lambda.sh"
    echo "• Remove deployment: serverless remove --stage $STAGE"
}

# Trap to ensure cleanup happens
trap cleanup EXIT

# Run main function
main "$@"
