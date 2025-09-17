# 🚀 AWS Lambda Deployment Guide for Stridecal Investment Analysis

## 📋 Prerequisites

Before deploying, make sure you have:

1. **Node.js and npm installed** (version 18 or higher)
2. **AWS Account** with programmatic access
3. **AWS CLI configured** (optional but recommended)

## ⚙️ Setup AWS Credentials

Choose one of these methods to set up your AWS credentials:

### Method 1: AWS CLI (Recommended)
```bash
# Install AWS CLI if not already installed
# macOS: brew install awscli
# Windows: Download from AWS website
# Linux: sudo apt-get install awscli

# Configure AWS credentials
aws configure
```

### Method 2: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your_access_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
export AWS_DEFAULT_REGION=us-east-1
```

### Method 3: AWS Credentials File
Create `~/.aws/credentials`:
```ini
[default]
aws_access_key_id = your_access_key_here
aws_secret_access_key = your_secret_access_key_here
region = us-east-1
```

## 🚀 One-Click Deployment

Run the automated deployment script:

```bash
./deploy-lambda.sh
```

This script will:
1. ✅ Check all requirements
2. 📦 Install Serverless Framework
3. 🔐 Verify AWS credentials
4. 🏗️ Build your React application
5. ⚙️ Setup Lambda environment
6. 🌍 Deploy to AWS Lambda + API Gateway
7. 📋 Show you the live URLs

## 🔧 Manual Deployment Steps

If you prefer manual control:

### 1. Build the React App
```bash
npm run build
```

### 2. Install Serverless Framework
```bash
npm install -g serverless
```

### 3. Install Lambda Dependencies
```bash
npm install serverless serverless-offline serverless-plugin-warmup aws-lambda
```

### 4. Deploy to AWS
```bash
# Deploy to development
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod
```

## 📊 What Gets Deployed

Your deployment creates:

- **AWS Lambda Function**: Serves your React app and API endpoints
- **API Gateway**: Handles HTTP requests and routes them to Lambda
- **CloudFront Distribution**: Global CDN for fast loading
- **IAM Roles**: Proper permissions for Lambda execution

## 🌐 Accessing Your App

After deployment, you'll get URLs like:

- **API Gateway URL**: `https://abc123.execute-api.us-east-1.amazonaws.com/dev/`
- **CloudFront URL**: `https://d123456789.cloudfront.net/`

Both URLs will serve your investment analysis app!

## 📱 Features Available

Your deployed app includes:

### 📈 Technical Analysis
- Interactive candlestick charts
- MACD, RSI, Bollinger Bands indicators
- Trend line analysis
- Chart pattern recognition

### 💰 Fundamental Analysis  
- Financial ratio calculations (P/E, ROE, Current Ratio)
- DCF valuation models
- Comparable company analysis
- Investment decision frameworks

### 📚 Educational Content
- Step-by-step tutorials
- Real-world examples
- Best practices guides
- Risk management strategies

### ⚡ Performance Features
- Lambda warming to prevent cold starts
- CloudFront caching for fast loading
- Mobile-responsive design
- Google Analytics integration

## 🛠️ Managing Your Deployment

### View Logs
```bash
serverless logs -f app -t --stage dev
```

### Update Your App
Simply run the deployment script again:
```bash
./deploy-lambda.sh
```

### Remove Deployment
```bash
serverless remove --stage dev
```

## 💰 Cost Estimation

AWS Lambda pricing is very cost-effective:

- **Lambda**: ~$0.20 per 1M requests
- **API Gateway**: ~$3.50 per 1M requests  
- **CloudFront**: ~$0.085 per GB transfer
- **Free Tier**: 1M Lambda requests/month FREE

For a typical investment analysis app, expect **$1-5/month** for moderate usage.

## 🔧 Troubleshooting

### Common Issues:

**❌ "AWS credentials not found"**
- Solution: Set up AWS credentials using one of the methods above

**❌ "Serverless command not found"**
- Solution: Install globally with `npm install -g serverless`

**❌ "Build failed"**
- Solution: Run `npm install` then `npm run build`

**❌ "Permission denied"**
- Solution: Check your AWS IAM permissions for Lambda, API Gateway, and CloudFront

### Getting Help:

1. Check the deployment logs
2. Verify AWS credentials and permissions
3. Ensure all dependencies are installed
4. Try deploying to `dev` stage first

## 🎯 Next Steps

After successful deployment:

1. **Test Your App**: Visit the provided URLs
2. **Custom Domain**: Set up a custom domain in Route 53
3. **Monitoring**: Set up CloudWatch alerts
4. **SSL Certificate**: Use AWS Certificate Manager for HTTPS
5. **Analytics**: Configure Google Analytics with your domain

## 📞 Support

If you encounter issues:

1. Check the AWS CloudWatch logs
2. Review the serverless deployment output
3. Verify your AWS account has necessary permissions
4. Ensure billing is set up correctly

---

🎉 **Congratulations!** Your Stridecal Investment Analysis app is now live on AWS Lambda with global distribution through CloudFront!
