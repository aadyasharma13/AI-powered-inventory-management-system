@echo off
echo 🚀 Setting up AI Inventory Management System Database...

REM Check if bun is installed
bun --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Bun is not installed. Please install Bun first.
    echo Visit: https://bun.sh/docs/installation
    pause
    exit /b 1
)

echo ✅ Bun is installed

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  .env.local not found. Creating from example...
    if exist ".env.local.example" (
        copy ".env.local.example" ".env.local" >nul
        echo ✅ Created .env.local from example
        echo ⚠️  Please update .env.local with your database credentials
    ) else (
        echo ❌ .env.local.example not found
        pause
        exit /b 1
    )
)

REM Generate database schema
echo 📊 Generating database schema...
bun run db:generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate database schema
    pause
    exit /b 1
)

REM Push schema to database
echo 🗄️  Pushing schema to database...
bun run db:push
if %errorlevel% neq 0 (
    echo ❌ Failed to push schema to database
    pause
    exit /b 1
)

REM Seed database with data
echo 🌱 Seeding database with sample data...
bun run db:seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

echo 🎉 Database setup completed successfully!
echo 🚀 You can now start the development server with: bun run dev
pause 