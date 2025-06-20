#!/bin/bash

# Load configuration
CONFIG_FILE="aws-config.json"
DOMAIN=$(jq -r '.domain' $CONFIG_FILE)
BUCKET=$(jq -r '.bucket' $CONFIG_FILE)
REGION=$(jq -r '.region' $CONFIG_FILE)

# Create S3 bucket
echo "Creating S3 bucket..."
aws s3 mb s3://$BUCKET --region $REGION

# Enable static website hosting
echo "Enabling static website hosting..."
aws s3 website s3://$BUCKET --index-document index.html --error-document error.html

# Upload website files
echo "Uploading website files..."
aws s3 sync . s3://$BUCKET --exclude "*.git/*" --exclude "deploy.sh" --exclude "aws-config.json"

# Create CloudFront distribution
echo "Creating CloudFront distribution..."
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
    --origin-domain-name $BUCKET.s3-website-$REGION.amazonaws.com \
    --default-root-object index.html \
    --query 'Distribution.Id' \
    --output text)

# Create Route 53 hosted zone
echo "Creating Route 53 hosted zone..."
HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
    --name $DOMAIN \
    --caller-reference $(date +%s) \
    --query 'HostedZone.Id' \
    --output text)

# Create DynamoDB table for newsletter subscribers
echo "Creating DynamoDB table..."
aws dynamodb create-table \
    --table-name newsletter-subscribers \
    --attribute-definitions AttributeName=email,AttributeType=S \
    --key-schema AttributeName=email,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region $REGION

# Set up AWS SES
echo "Setting up AWS SES..."
aws ses verify-email-identity --email-address newsletter@$DOMAIN

echo "Deployment complete!"
echo "Next steps:"
echo "1. Update your domain registrar's nameservers with the values from Route 53"
echo "2. Wait for DNS propagation (can take up to 48 hours)"
echo "3. Verify your email address in AWS SES"
echo "4. Test the newsletter subscription functionality" 