# PowerShell script to update all Form.tsx files with PageContainer
$files = @(
    "c:\laragon\www\bun\src\features\penerima\components\PenerimaForm.tsx",
    "c:\laragon\www\bun\src\features\pekerjaan\components\PekerjaanForm.tsx",
    "c:\laragon\www\bun\src\features\output\components\OutputForm.tsx",
    "c:\laragon\www\bun\src\features\kecamatan\components\KecamatanForm.tsx",
    "c:\laragon\www\bun\src\features\foto\components\FotoForm.tsx",
    "c:\laragon\www\bun\src\features\desa\components\DesaForm.tsx",
    "c:\laragon\www\bun\src\features\berkas\components\BerkasForm.tsx",
    "c:\laragon\www\bun\src\features\kontrak\components\KontrakForm.tsx"
)

foreach ($file in $files) {
    Write-Host "Updating $file"
    $content = Get-Content $file -Raw
    
    # Add import if not exists
    if ($content -notmatch "PageContainer") {
        $content = $content -replace "import \{ ArrowLeft, Save", "import { ArrowLeft, Save"
        # Find the last import
        $lastImport = [regex]::Matches($content, "import.*?;")[-1]
        if ($lastImport) {
            $insertPos = $lastImport.Index + $lastImport.Length
            $newImport = "`r`nimport { PageContainer } from '@/components/layout/page-container';"
            $content = $content.Insert($insertPos, $newImport)
        }
    }
    
    # Replace max-w-2xl with max-w-4xl
    $content = $content -replace "max-w-2xl", "max-w-4xl"
    
    # Wrap return content with PageContainer
    $content = $content -replace "return \(\s*<div className=`"p-6 max-w-4xl", "return (`r`n        <PageContainer>`r`n            <div className=`"max-w-4xl"
    $content = $content -replace "</div>\s*\);\s*}", "            </div>`r`n        </PageContainer>`r`n    );`r`n}"
    
    Set-Content-Path $file -Value $content
}

Write-Host "All forms updated successfully!"
