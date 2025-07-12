# PowerShell script for setting up the database on Windows
Write-Host "🚀 Setting up AI Inventory Management System Database..." -ForegroundColor Green

# Check if bun is installed
try {
    $bunVersion = bun --version
    Write-Host "✅ Bun is installed: $bunVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Bun is not installed. Please install Bun first." -ForegroundColor Red
    Write-Host "Visit: https://bun.sh/docs/installation" -ForegroundColor Yellow
    exit 1
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found. Creating from example..." -ForegroundColor Yellow
    if (Test-Path ".env.local.example") {
        Copy-Item ".env.local.example" ".env.local"
        Write-Host "✅ Created .env.local from example" -ForegroundColor Green
        Write-Host "⚠️  Please update .env.local with your database credentials" -ForegroundColor Yellow
    } else {
        Write-Host "❌ .env.local.example not found" -ForegroundColor Red
        exit 1
    }
}

# Generate database schema
Write-Host "📊 Generating database schema..." -ForegroundColor Blue
bun run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate database schema" -ForegroundColor Red
    exit 1
}

# Push schema to database
Write-Host "🗄️  Pushing schema to database..." -ForegroundColor Blue
bun run db:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push schema to database" -ForegroundColor Red
    exit 1
}

# Seed database with data
Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Blue
bun run db:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host "🚀 You can now start the development server with: bun run dev" -ForegroundColor Cyan 