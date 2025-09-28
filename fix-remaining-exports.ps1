# Script to fix exports order in specific package.json files
$packageFiles = @(
    "features\auth\contracts\package.json",
    "features\collections\contracts\package.json",
    "features\schema\contracts\package.json",
    "features\schema\domain\package.json",
    "features\shared\contracts\package.json",
    "features\shared\domain\package.json",
    "features\shared\ui\package.json",
    "features\workspace\contracts\package.json",
    "libs\auth\package.json",
    "libs\utils\package.json"
)

foreach ($file in $packageFiles) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        $content = Get-Content $file -Raw
        
        # Fix the exports order pattern: import, require, types -> types, import, require
        $pattern = '"import":\s*"([^"]+)",\s*"require":\s*"([^"]+)",\s*"types":\s*"([^"]+)"'
        if ($content -match $pattern) {
            $importPath = $matches[1]
            $requirePath = $matches[2]
            $typesPath = $matches[3]
            $replacement = "`"types`": `"$typesPath`", `"import`": `"$importPath`", `"require`": `"$requirePath`""
            $newContent = $content -replace $pattern, $replacement
            
            if ($content -ne $newContent) {
                Write-Host "  - Updated exports order in $file"
                $newContent | Set-Content $file -NoNewline
            } else {
                Write-Host "  - No changes needed in $file"
            }
        } else {
            Write-Host "  - Pattern not found in $file"
        }
    } else {
        Write-Host "  - File not found: $file"
    }
}

Write-Host "Export order fixing completed for remaining packages!"