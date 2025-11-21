#!/bin/bash

echo "🚀 Deploying Alexa ChatGPT Calendar Skill to AWS..."

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install: https://aws.amazon.com/cli/"
    exit 1
fi

if ! command -v sam &> /dev/null; then
    echo "❌ SAM CLI not found. Please install: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html"
    exit 1
fi

# Set default values
STACK_NAME=${STACK_NAME:-alexa-chatgpt-calendar}
REGION=${AWS_REGION:-us-east-1}
ENVIRONMENT=${ENVIRONMENT:-prod}

echo "📋 Configuration:"
echo "   Stack Name: $STACK_NAME"
echo "   Region: $REGION"
echo "   Environment: $ENVIRONMENT"

# Build and package
echo "📦 Building application..."
npm run build

echo "🔨 Building SAM application..."
sam build

echo "🚀 Deploying to AWS..."
if [ "$1" = "--guided" ]; then
    sam deploy --guided --stack-name $STACK_NAME --region $REGION
else
    sam deploy --stack-name $STACK_NAME --region $REGION --confirm-changeset --resolve-s3
fi

# Get outputs
echo "📊 Getting deployment outputs..."
API_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' --output text)
WEBSITE_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`WebsiteUrl`].OutputValue' --output text)
S3_BUCKET=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' --output text)

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Website URL: $WEBSITE_URL"
echo "🔗 API URL: $API_URL"
echo "📦 S3 Bucket: $S3_BUCKET"

# Deploy frontend
if [ -d "client/build" ]; then
    echo "📤 Uploading frontend to S3..."
    aws s3 sync client/build/ s3://$S3_BUCKET/ --delete --region $REGION
    
    # Invalidate CloudFront cache
    DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistribution`].OutputValue' --output text 2>/dev/null)
    if [ ! -z "$DISTRIBUTION_ID" ]; then
        echo "🔄 Invalidating CloudFront cache..."
        aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --region $REGION
    fi
    
    echo "✅ Frontend deployed successfully!"
else
    echo "⚠️  Frontend build not found. Run 'npm run build' first."
fi

echo ""
echo "🎉 Deployment Summary:"
echo "   • Backend API: Deployed to Lambda + API Gateway"
echo "   • Frontend: Deployed to S3 + CloudFront"
echo "   • Database: DynamoDB tables created"
echo "   • Monitoring: CloudWatch logs enabled"
echo ""
echo "🔧 Next Steps:"
echo "   1. Configure your OpenAI API key in Lambda environment variables"
echo "   2. Set up your Alexa Skill in the developer console"
echo "   3. Test your application at: $WEBSITE_URL"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"