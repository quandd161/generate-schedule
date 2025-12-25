#!/bin/bash

# Build and Push Multi-Platform Docker Images to GitHub Container Registry
# Usage: ./build-and-push.sh <github-username>

set -e

if [ -z "$1" ]; then
    echo "Usage: ./build-and-push.sh <github-username>"
    echo "Example: ./build-and-push.sh myusername"
    exit 1
fi

USERNAME=$1
BACKEND_IMAGE="ghcr.io/${USERNAME}/study-scheduler-backend"
FRONTEND_IMAGE="ghcr.io/${USERNAME}/study-scheduler-frontend"

echo "========================================="
echo "Building and Pushing Docker Images"
echo "========================================="
echo "Backend Image:  ${BACKEND_IMAGE}"
echo "Frontend Image: ${FRONTEND_IMAGE}"
echo "========================================="

# Login to GitHub Container Registry
echo "Logging in to GitHub Container Registry..."
echo "Please enter your GitHub Personal Access Token:"
docker login ghcr.io -u ${USERNAME}

# Create buildx builder for multi-platform builds
echo ""
echo "Setting up Docker Buildx for multi-platform builds..."
docker buildx create --name multiplatform --use --driver docker-container || true
docker buildx inspect --bootstrap

# Build and push backend image
echo ""
echo "Building and pushing backend image..."
cd backend
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t ${BACKEND_IMAGE}:latest \
    -t ${BACKEND_IMAGE}:v1.0.0 \
    --push \
    .
cd ..

# Build and push frontend image
echo ""
echo "Building and pushing frontend image..."
cd frontend
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t ${FRONTEND_IMAGE}:latest \
    -t ${FRONTEND_IMAGE}:v1.0.0 \
    --push \
    .
cd ..

echo ""
echo "========================================="
echo "✅ Images successfully built and pushed!"
echo "========================================="
echo "Backend:  ${BACKEND_IMAGE}:latest"
echo "Frontend: ${FRONTEND_IMAGE}:latest"
echo ""
echo "To deploy using docker-compose:"
echo "1. Update docker-compose.nobuild.yml with your username"
echo "2. Run: docker compose -f docker-compose.nobuild.yml up -d"
echo "========================================="
