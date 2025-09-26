# GitHub Project Board Setup Script
# Creates a GitHub Project (beta) for managing the Struktura backlog

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Continue"

# Configuration
$REPO = "cbnsndwch/struktura"
$PROJECT_NAME = "Struktura Development Backlog"

Write-Host "📊 Setting up GitHub Project Board..." -ForegroundColor Green
Write-Host ""

# Check GitHub CLI authentication and extensions
Write-Host "🔐 Checking GitHub CLI setup..." -ForegroundColor Blue
$authResult = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ GitHub CLI is not authenticated. Please run: gh auth login" -ForegroundColor Red
    exit 1
}

# Check if projects extension is available
$extensionResult = gh extension list 2>&1
if (-not ($extensionResult -match "gh-projects")) {
    Write-Host "📦 Installing GitHub Projects CLI extension..." -ForegroundColor Blue
    gh extension install github/gh-projects
}

Write-Host "✅ GitHub CLI ready" -ForegroundColor Green
Write-Host ""

# Function to create project
function Create-Project {
    Write-Host "📋 Creating GitHub Project..." -ForegroundColor Blue
    
    if ($DryRun) {
        Write-Host "🔄 [DRY RUN] Would create project: $PROJECT_NAME" -ForegroundColor Yellow
        return
    }
    
    # Create the project
    $result = gh project create --title $PROJECT_NAME --body "Comprehensive project management board for Struktura development, tracking epics, stories, and tasks across all milestones." --owner cbnsndwch 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Created project: $PROJECT_NAME" -ForegroundColor Green
        
        # Extract project URL from result
        $projectUrl = $result | Select-String -Pattern "https://github.com/users/\S+/projects/\d+" | ForEach-Object { $_.Matches.Value }
        Write-Host "🔗 Project URL: $projectUrl" -ForegroundColor Cyan
        
        # Get project number from URL
        $projectNumber = $projectUrl -replace ".*projects/(\d+).*", '$1'
        Write-Host "📊 Project Number: $projectNumber" -ForegroundColor Cyan
        
        return $projectNumber
    } else {
        Write-Host "❌ Failed to create project: $result" -ForegroundColor Red
        return $null
    }
}

# Function to configure project fields
function Configure-ProjectFields {
    param($projectNumber)
    
    Write-Host "🔧 Configuring project fields..." -ForegroundColor Blue
    
    if ($DryRun) {
        Write-Host "🔄 [DRY RUN] Would configure project fields" -ForegroundColor Yellow
        return
    }
    
    if (-not $projectNumber) {
        Write-Host "❌ No project number available, skipping field configuration" -ForegroundColor Red
        return
    }
    
    # Add Epic field
    Write-Host "Adding Epic field..." -ForegroundColor Blue
    gh project field-create $projectNumber --name "Epic" --type "single_select" --option "Foundation" --option "Platform Foundation" --option "Schema Management" --option "Data Management" --option "Admin Interface" --option "Real-time" --option "Views" --option "Enterprise" 2>&1
    
    # Add Story Points field  
    Write-Host "Adding Story Points field..." -ForegroundColor Blue
    gh project field-create $projectNumber --name "Story Points" --type "number" 2>&1
    
    # Add Priority field
    Write-Host "Adding Priority field..." -ForegroundColor Blue
    gh project field-create $projectNumber --name "Priority" --type "single_select" --option "Critical" --option "High" --option "Medium" --option "Low" 2>&1
    
    # Add Component field
    Write-Host "Adding Component field..." -ForegroundColor Blue
    gh project field-create $projectNumber --name "Component" --type "single_select" --option "Frontend" --option "Backend" --option "Infrastructure" --option "Auth" --option "UI" --option "API" --option "Schema" --option "Sync" 2>&1
    
    Write-Host "✅ Project fields configured" -ForegroundColor Green
}

# Function to create project views
function Create-ProjectViews {
    param($projectNumber)
    
    Write-Host "👁️  Creating project views..." -ForegroundColor Blue
    
    if ($DryRun) {
        Write-Host "🔄 [DRY RUN] Would create project views" -ForegroundColor Yellow
        return
    }
    
    if (-not $projectNumber) {
        Write-Host "❌ No project number available, skipping views creation" -ForegroundColor Red
        return
    }
    
    # Epic Overview View
    Write-Host "Creating Epic Overview view..." -ForegroundColor Blue
    gh project view-create $projectNumber --name "Epic Overview" --type "board" --field "Epic" 2>&1
    
    # Sprint Planning View
    Write-Host "Creating Sprint Planning view..." -ForegroundColor Blue  
    gh project view-create $projectNumber --name "Sprint Planning" --type "table" --field "Priority,Epic,Story Points,Component" 2>&1
    
    # Priority View
    Write-Host "Creating Priority view..." -ForegroundColor Blue
    gh project view-create $projectNumber --name "By Priority" --type "board" --field "Priority" 2>&1
    
    Write-Host "✅ Project views created" -ForegroundColor Green
}

# Function to add issues to project
function Add-IssuesToProject {
    param($projectNumber)
    
    Write-Host "📌 Adding existing issues to project..." -ForegroundColor Blue
    
    if ($DryRun) {
        Write-Host "🔄 [DRY RUN] Would add issues to project" -ForegroundColor Yellow
        return
    }
    
    if (-not $projectNumber) {
        Write-Host "❌ No project number available, skipping issues addition" -ForegroundColor Red
        return
    }
    
    # Get all issues from the repository
    $issues = gh issue list --repo $REPO --limit 100 --json number,title | ConvertFrom-Json
    
    foreach ($issue in $issues) {
        Write-Host "Adding issue #$($issue.number): $($issue.title)" -ForegroundColor Blue
        gh project item-add $projectNumber --url "https://github.com/$REPO/issues/$($issue.number)" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Added issue #$($issue.number)" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to add issue #$($issue.number)" -ForegroundColor Red
        }
    }
}

# Main execution
$projectNumber = Create-Project

if ($projectNumber) {
    Configure-ProjectFields $projectNumber
    Create-ProjectViews $projectNumber
    Add-IssuesToProject $projectNumber
    
    Write-Host ""
    Write-Host "🎉 GitHub Project Board setup completed!" -ForegroundColor Green
    Write-Host "🔗 Project URL: https://github.com/users/cbnsndwch/projects/$projectNumber" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Project Board setup failed!" -ForegroundColor Red
}

Write-Host ""