const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting AWS deployment package creation...');

// Create deployment directory
const deployDir = path.join(__dirname, '..', 'deploy');
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir);

console.log('📦 Building client application...');
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

console.log('📦 Preparing server package...');
// Copy server files
const serverSource = path.join(__dirname, '..', 'server');
const serverDest = path.join(deployDir, 'server');
fs.mkdirSync(serverDest);

// Copy essential server files
const serverFiles = ['index.js', 'lambda.js', 'package.json'];
serverFiles.forEach(file => {
  fs.copyFileSync(path.join(serverSource, file), path.join(serverDest, file));
});

// Copy routes and models directories
const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const items = fs.readdirSync(src);
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

copyDir(path.join(serverSource, 'routes'), path.join(serverDest, 'routes'));
copyDir(path.join(serverSource, 'models'), path.join(serverDest, 'models'));

// Copy client build to deploy directory
const clientBuild = path.join(__dirname, '..', 'client', 'build');
const clientDest = path.join(deployDir, 'client-build');
if (fs.existsSync(clientBuild)) {
  copyDir(clientBuild, clientDest);
} else {
  console.error('❌ Client build directory not found. Run npm run build first.');
  process.exit(1);
}

// Copy AWS templates
const templateFiles = ['template.yaml', 'samconfig.toml'];
templateFiles.forEach(file => {
  const srcFile = path.join(__dirname, '..', file);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, path.join(deployDir, file));
  }
});

// Create deployment instructions
const instructions = `# Alexa ChatGPT Calendar Skill - AWS Deployment

## Files included:
- server/ - Backend Lambda function
- client-build/ - Frontend static files for S3
- template.yaml - AWS SAM template
- samconfig.toml - SAM configuration

## Deployment Steps:

### 1. Prerequisites
\`\`\`bash
# Install AWS CLI and SAM CLI
aws configure
sam --version
\`\`\`

### 2. Deploy Backend (Lambda + API Gateway + DynamoDB)
\`\`\`bash
sam build
sam deploy --guided

# Follow the prompts:
# - Stack Name: alexa-chatgpt-calendar
# - AWS Region: us-east-1 (recommended for Alexa)
# - OpenAI API Key: [your-openai-api-key]
# - Environment: prod
\`\`\`

### 3. Deploy Frontend (S3 + CloudFront)
\`\`\`bash
# Get S3 bucket name from SAM output
aws s3 cp client-build/ s3://[bucket-name]/ --recursive

# Update API endpoint in frontend (if needed)
# Edit client-build/static/js/main.[hash].js
# Replace localhost:3001 with your API Gateway URL
\`\`\`

### 4. Configure Alexa Skill
1. Go to Alexa Developer Console
2. Create new skill or update existing
3. Set endpoint to your Lambda function ARN
4. Upload interaction model from alexa-skill/

### 5. Test Deployment
- Frontend: Visit CloudFront URL
- Backend: Test API Gateway endpoints
- Alexa: Test in Alexa Developer Console

## Environment Variables
Set these in AWS Lambda console:
- OPENAI_API_KEY: Your OpenAI API key
- MONGODB_URI: (optional) MongoDB connection string
- OPENAI_MODEL: gpt-3.5-turbo
- NODE_ENV: production

## Monitoring
- CloudWatch Logs: Lambda function logs
- X-Ray: Request tracing (if enabled)
- API Gateway: API metrics and logs

## Costs Estimation (Monthly)
- Lambda: ~$5-20 (depending on usage)
- API Gateway: ~$3-10
- S3: ~$1-5
- CloudFront: ~$1-5
- DynamoDB: ~$2-10
- Total: ~$12-50/month (varies by usage)
`;

fs.writeFileSync(path.join(deployDir, 'DEPLOYMENT.md'), instructions);

console.log('✅ Deployment package created successfully!');
console.log(`📁 Package location: ${deployDir}`);
console.log('📖 Read DEPLOYMENT.md for deployment instructions');

// Create a ZIP file for easy distribution
try {
  const archiver = require('archiver');
  const zipFile = path.join(__dirname, '..', 'alexa-chatgpt-calendar-aws.zip');
  const output = fs.createWriteStream(zipFile);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  output.on('close', () => {
    console.log(`📦 ZIP package created: ${zipFile} (${archive.pointer()} bytes)`);
  });
  
  archive.pipe(output);
  archive.directory(deployDir, false);
  archive.finalize();
} catch (error) {
  console.log('ℹ️  ZIP creation skipped (archiver not installed)');
  console.log('   Run: npm install archiver --save-dev to enable ZIP packaging');
}