# Script to fix the order of exports conditions in all package.json files
# The correct order is: types, import, require

# Get all package.json files that have exports
$packageFiles = Get-ChildItem -Path . -Recurse -Name "package.json" | Where-Object { 
    $content = Get-Content $_ -Raw
    $content -match '"exports"'
}

Write-Host "Found $($packageFiles.Count) package.json files with exports"

foreach ($file in $packageFiles) {
    Write-Host "Processing: $file"
    
    # Read the file content
    $content = Get-Content $file -Raw
    
    # Replace the problematic export order pattern
    # Pattern: "import": "...", "require": "...", "types": "..."
    $pattern = '("import":\s*"[^"]+",\s*"require":\s*"[^"]+",\s*"types":\s*"[^"]+")'
    $replacement = {
        $match = $args[0].Value
        # Extract the three parts
        if ($match -match '"import":\s*"([^"]+)".*"require":\s*"([^"]+)".*"types":\s*"([^"]+)"') {
            $importPath = $matches[1]
            $requirePath = $matches[2] 
            $typesPath = $matches[3]
            return "`"types`": `"$typesPath`", `"import`": `"$importPath`", `"require`": `"$requirePath`""
        }
        return $match
    }
    
    $newContent = [regex]::Replace($content, $pattern, $replacement)
    
    if ($content -ne $newContent) {
        Write-Host "  - Updated exports order in $file"
        $newContent | Set-Content $file -NoNewline
    } else {
        Write-Host "  - No changes needed in $file"
    }
}

Write-Host "Export order fixing completed!"
