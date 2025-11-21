# AWS Deployment Script for Alexa ChatGPT Calendar Skill
# PowerShell Script for Windows Deployment

param(
    [string]$OpenAIApiKey = "",
    [string]$StackName = "alexa-chatgpt-calendar",
    [string]$Region = "us-east-1",
    [switch]$Guided = $false,
    [switch]$Build = $true,
    [switch]$Package = $true,
    [switch]$Deploy = $true,
    [switch]$UploadFrontend = $true
)

Write-Host "🚀 Alexa ChatGPT Calendar Skill - AWS Deployment Script" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Host "✅ AWS CLI detected: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    Write-Host "Download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check if SAM CLI is installed
try {
    $samVersion = sam --version
    Write-Host "✅ SAM CLI detected: $samVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ SAM CLI not found. Please install SAM CLI first." -ForegroundColor Red
    Write-Host "Install with: pip install aws-sam-cli" -ForegroundColor Yellow
    exit 1
}

# Check AWS credentials
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "✅ AWS Credentials configured for: $($identity.Arn)" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS credentials not configured. Run: aws configure" -ForegroundColor Red
    exit 1
}

# Validate OpenAI API Key
if ($OpenAIApiKey -eq "" -and -not $Guided) {
    Write-Host "⚠️  OpenAI API Key not provided. Will use guided deployment." -ForegroundColor Yellow
    $Guided = $true
}

if ($OpenAIApiKey -ne "" -and -not $OpenAIApiKey.StartsWith("sk-")) {
    Write-Host "❌ Invalid OpenAI API Key format. Should start with 'sk-'" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Deployment Configuration:" -ForegroundColor Cyan
Write-Host "   Stack Name: $StackName" -ForegroundColor White
Write-Host "   Region: $Region" -ForegroundColor White
Write-Host "   Guided Mode: $($Guided ? 'Yes' : 'No')" -ForegroundColor White
Write-Host "   OpenAI Key: $($OpenAIApiKey -ne '' ? 'Provided' : 'Not provided')" -ForegroundColor White
Write-Host ""

# Step 1: Build Frontend
if ($Build) {
    Write-Host "🏗️  Building React Frontend..." -ForegroundColor Blue
    Set-Location client
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing client dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install client dependencies" -ForegroundColor Red
            exit 1
        }
    }
    
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to build React app" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ..
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
}

# Step 2: Package Lambda
if ($Package) {
    Write-Host "📦 Creating Lambda deployment package..." -ForegroundColor Blue
    
    # Create deploy directory
    if (Test-Path "deploy") {
        Remove-Item -Recurse -Force "deploy"
    }
    New-Item -ItemType Directory -Path "deploy" | Out-Null
    
    # Copy server files
    Copy-Item -Recurse -Path "server/*" -Destination "deploy/"
    
    # Install production dependencies
    Set-Location deploy
    npm install --production
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Lambda dependencies" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ..
    Write-Host "✅ Lambda package created successfully" -ForegroundColor Green
}

# Step 3: SAM Build
Write-Host "🔨 Building SAM application..." -ForegroundColor Blue
sam build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ SAM build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ SAM build completed" -ForegroundColor Green

# Step 4: Deploy with SAM
if ($Deploy) {
    Write-Host "🚀 Deploying to AWS..." -ForegroundColor Blue
    
    if ($Guided) {
        Write-Host "🎯 Starting guided deployment..." -ForegroundColor Yellow
        sam deploy --guided
    } else {
        # Non-guided deployment with parameters
        $deployCmd = "sam deploy --stack-name $StackName --region $Region --capabilities CAPABILITY_IAM"
        if ($OpenAIApiKey -ne "") {
            $deployCmd += " --parameter-overrides OpenAIApiKey=$OpenAIApiKey"
        }
        
        Write-Host "Executing: $deployCmd" -ForegroundColor Gray
        Invoke-Expression $deployCmd
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Deployment failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ AWS deployment completed successfully!" -ForegroundColor Green
}

# Step 5: Upload Frontend to S3
if ($UploadFrontend) {
    Write-Host "📤 Uploading frontend to S3..." -ForegroundColor Blue
    
    try {
        # Get S3 bucket name from CloudFormation output
        $bucketName = aws cloudformation describe-stacks --stack-name $StackName --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' --output text
        
        if ($bucketName -and $bucketName -ne "None") {
            Write-Host "📁 Uploading to bucket: $bucketName" -ForegroundColor Yellow
            aws s3 sync client/build/ "s3://$bucketName/" --delete
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Frontend uploaded successfully" -ForegroundColor Green
                
                # Invalidate CloudFront cache
                try {
                    $distributionId = aws cloudformation describe-stacks --stack-name $StackName --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistribution`].OutputValue' --output text
                    if ($distributionId -and $distributionId -ne "None") {
                        Write-Host "🔄 Invalidating CloudFront cache..." -ForegroundColor Yellow
                        aws cloudfront create-invalidation --distribution-id $distributionId --paths "/*" | Out-Null
                        Write-Host "✅ CloudFront cache invalidated" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "⚠️  Could not invalidate CloudFront cache" -ForegroundColor Yellow
                }
            } else {
                Write-Host "❌ Failed to upload frontend" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠️  S3 bucket not found. Frontend not uploaded." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error uploading frontend: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 6: Display deployment information
Write-Host ""
Write-Host "🎉 Deployment Summary" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green

try {
    $outputs = aws cloudformation describe-stacks --stack-name $StackName --query 'Stacks[0].Outputs' --output json | ConvertFrom-Json
    
    foreach ($output in $outputs) {
        $key = $output.OutputKey
        $value = $output.OutputValue
        $description = $output.Description
        
        Write-Host "$key`: " -ForegroundColor Cyan -NoNewline
        Write-Host "$value" -ForegroundColor White
        if ($description) {
            Write-Host "   $description" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Could not retrieve stack outputs" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure your Alexa Skill endpoint with the Lambda ARN" -ForegroundColor White
Write-Host "2. Test your application using the Website URL" -ForegroundColor White
Write-Host "3. Monitor logs in CloudWatch" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Deployment completed successfully! 🎊" -ForegroundColor Green