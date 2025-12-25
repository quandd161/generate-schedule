# Build and Push Multi-Platform Docker Images to GitHub Container Registry
# Usage: .\build-and-push.ps1 <github-username>

param(
    [Parameter(Mandatory=$true)]
    [string]$Username
)

$ErrorActionPreference = "Stop"

$BackendImage = "ghcr.io/$Username/study-scheduler-backend"
$FrontendImage = "ghcr.io/$Username/study-scheduler-frontend"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Building and Pushing Docker Images" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Backend Image:  $BackendImage" -ForegroundColor Yellow
Write-Host "Frontend Image: $FrontendImage" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan

# Login to GitHub Container Registry
Write-Host "`nLogging in to GitHub Container Registry..." -ForegroundColor Green
Write-Host "Please enter your GitHub Personal Access Token when prompted" -ForegroundColor Yellow
docker login ghcr.io -u $Username

# Create buildx builder for multi-platform builds
Write-Host "`nSetting up Docker Buildx for multi-platform builds..." -ForegroundColor Green
try {
    docker buildx create --name multiplatform --use --driver docker-container
} catch {
    Write-Host "Buildx builder already exists, using existing one..." -ForegroundColor Yellow
}
docker buildx inspect --bootstrap

# Build and push backend image
Write-Host "`nBuilding and pushing backend image..." -ForegroundColor Green
Set-Location backend
docker buildx build `
    --platform linux/amd64,linux/arm64 `
    -t "${BackendImage}:latest" `
    -t "${BackendImage}:v1.0.0" `
    --push `
    .
Set-Location ..

# Build and push frontend image
Write-Host "`nBuilding and pushing frontend image..." -ForegroundColor Green
Set-Location frontend
docker buildx build `
    --platform linux/amd64,linux/arm64 `
    -t "${FrontendImage}:latest" `
    -t "${FrontendImage}:v1.0.0" `
    --push `
    .
Set-Location ..

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "✅ Images successfully built and pushed!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Backend:  ${BackendImage}:latest" -ForegroundColor Yellow
Write-Host "Frontend: ${FrontendImage}:latest" -ForegroundColor Yellow
Write-Host "`nTo deploy using docker-compose:" -ForegroundColor Green
Write-Host "1. Update docker-compose.nobuild.yml with your username" -ForegroundColor White
Write-Host "2. Run: docker compose -f docker-compose.nobuild.yml up -d" -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Cyan
