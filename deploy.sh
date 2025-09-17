#!/bin/bash

# Deployment script for CloudFront distribution
# Update these variables with your actual values
S3_BUCKET="your-s3-bucket-name"
CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"

echo "🏗️  Building application..."
npm run build

echo "📦 Uploading to S3..."
aws s3 sync dist/ s3://$S3_BUCKET/ --delete

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://learnstocktrends.stridecal.com"
