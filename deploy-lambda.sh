#!/bin/bash

# Stridecal Investment Analysis - AWS Lambda Deployment Script
# This script deploys the React app to AWS Lambda with automated setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Stridecal Investment Analysis - AWS Lambda Deployment${NC}"
echo "================================================================"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 16 ]; then
    print_error "Node.js version $NODE_VERSION detected. Minimum required: v16.0.0"
    echo "Please update Node.js: https://nodejs.org/"
    exit 1
elif [ "$NODE_MAJOR" -lt 18 ]; then
    print_warning "Node.js version $NODE_VERSION detected. Recommended: v18+ for optimal Lambda performance"
else
    print_status "Node.js version $NODE_VERSION is optimal for AWS Lambda"
fi

# Install AWS CLI if not present
if ! command -v aws &> /dev/null; then
    echo -e "${BLUE}Installing AWS CLI...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install awscli
        else
            print_error "Homebrew not found. Please install AWS CLI manually:"
            echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
            exit 1
        fi
    else
        # Linux
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf aws awscliv2.zip
    fi
    print_status "AWS CLI installed successfully"
else
    print_status "AWS CLI is already installed"
fi

# Check AWS credentials
echo -e "${BLUE}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    print_warning "AWS credentials not configured. Setting up now..."
    echo ""
    echo "Please enter your AWS credentials:"
    echo "You can find these in your AWS Console > IAM > Users > Security credentials"
    echo ""
    aws configure
else
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
    print_status "AWS credentials configured for account: $ACCOUNT_ID"
    print_status "Using credentials: $USER_ARN"
fi

# Install Serverless Framework
if ! command -v serverless &> /dev/null && ! command -v sls &> /dev/null; then
    echo -e "${BLUE}Installing Serverless Framework...${NC}"
    npm install -g serverless
    print_status "Serverless Framework installed successfully"
else
    print_status "Serverless Framework is already installed"
fi

# Install project dependencies
echo -e "${BLUE}Installing project dependencies...${NC}"
if [ -f "package.json" ]; then
    npm install
    print_status "Project dependencies installed"
else
    print_warning "No package.json found, skipping npm install"
fi

# Build the React application
echo -e "${BLUE}Building React application...${NC}"
npm run build
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi
print_status "React application built successfully"

# Install Lambda-specific dependencies
echo -e "${BLUE}Installing Lambda dependencies...${NC}"
if [ -f "package-lambda.json" ]; then
    cp package-lambda.json lambda/package.json
    cd lambda
    npm install --production
    cd ..
    print_status "Lambda dependencies installed"
else
    print_warning "No package-lambda.json found, using basic setup"
    mkdir -p lambda
    echo '{"name":"stridecal-lambda","version":"1.0.0","dependencies":{}}' > lambda/package.json
fi

# Install serverless plugins
echo -e "${BLUE}Installing serverless plugins...${NC}"
npm install --save-dev serverless-offline
print_status "Serverless plugins installed"

# Prompt for deployment stage
echo ""
echo -e "${BLUE}Select deployment stage:${NC}"
echo "1) dev (development)"
echo "2) staging"
echo "3) prod (production)"
read -p "Enter choice (1-3) [default: 1]: " stage_choice

case $stage_choice in
    2) STAGE="staging" ;;
    3) STAGE="prod" ;;
    *) STAGE="dev" ;;
esac

print_status "Deploying to stage: $STAGE"

# Deploy to AWS Lambda
echo ""
echo -e "${BLUE}Deploying to AWS Lambda...${NC}"
echo "This may take a few minutes..."

if serverless deploy --stage $STAGE; then
    echo ""
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo "================================================================"
    
    # Get the API Gateway URL
    API_URL=$(serverless info --stage $STAGE | grep "ANY" | head -1 | awk '{print $3}' | sed 's|/{proxy\+}||')
    
    if [ ! -z "$API_URL" ]; then
        echo -e "${GREEN}🌐 Your application is now live at:${NC}"
        echo -e "${BLUE}$API_URL${NC}"
        echo ""
        echo -e "${GREEN}📋 Deployment Summary:${NC}"
        echo "• Stage: $STAGE"
        echo "• Region: us-east-1"
        echo "• Runtime: Node.js 16.x"
        echo "• Memory: 512 MB"
        echo "• Timeout: 30 seconds"
        echo ""
        echo -e "${YELLOW}💡 Next Steps:${NC}"
        echo "• Test your application: curl $API_URL"
        echo "• View logs: serverless logs -f app --stage $STAGE"
        echo "• Remove deployment: serverless remove --stage $STAGE"
        echo ""
        echo -e "${GREEN}✨ Happy analyzing!${NC}"
    else
        print_warning "Deployment completed but couldn't retrieve URL. Check AWS Console."
    fi
else
    print_error "Deployment failed. Check the error messages above."
    echo ""
    echo -e "${YELLOW}💡 Common solutions:${NC}"
    echo "• Verify AWS credentials: aws sts get-caller-identity"
    echo "• Check AWS permissions for Lambda, API Gateway, and CloudFormation"
    echo "• Ensure unique service name in serverless.yml"
    echo "• Try deploying to a different region or stage"
    exit 1
fi

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
