# PowerShell script to update all page.tsx files to use AppLayout

$files = @(
    "d:/Project/JKJ/New App/app/warehouse/page.tsx",
    "d:/Project/JKJ/New App/app/warehouse/outbound/page.tsx",
    "d:/Project/JKJ/New App/app/warehouse/inbound/page.tsx",
    "d:/Project/JKJ/New App/app/sales/page.tsx",
    "d:/Project/JKJ/New App/app/sales/[id]/page.tsx",
    "d:/Project/JKJ/New App/app/sales/new/page.tsx",
    "d:/Project/JKJ/New App/app/reports/sales/page.tsx",
    "d:/Project/JKJ/New App/app/reports/production/page.tsx",
    "d:/Project/JKJ/New App/app/reports/page.tsx",
    "d:/Project/JKJ/New App/app/reports/inventory/page.tsx",
    "d:/Project/JKJ/New App/app/purchasing/po/page.tsx",
    "d:/Project/JKJ/New App/app/purchasing/suppliers/page.tsx",
    "d:/Project/JKJ/New App/app/purchasing/page.tsx",
    "d:/Project/JKJ/New App/app/purchasing/po/create/page.tsx",
    "d:/Project/JKJ/New App/app/production/wo/[id]/page.tsx",
    "d:/Project/JKJ/New App/app/production/wo/create/page.tsx",
    "d:/Project/JKJ/New App/app/production/wo/new/page.tsx",
    "d:/Project/JKJ/New App/app/production/planning/page.tsx",
    "d:/Project/JKJ/New App/app/production/page.tsx",
    "d:/Project/JKJ/New App/app/logistics/shipments/page.tsx",
    "d:/Project/JKJ/New App/app/logistics/page.tsx",
    "d:/Project/JKJ/New App/app/logistics/fleet/page.tsx",
    "d:/Project/JKJ/New App/app/finance/reports/page.tsx",
    "d:/Project/JKJ/New App/app/finance/page.tsx",
    "d:/Project/JKJ/New App/app/finance/invoices/page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Replace imports
        $content = $content -replace "import Sidebar from '@/components/sidebar'", "import AppLayout from '@/components/app-layout'"
        $content = $content -replace "import TopNav from '@/components/top-nav'", ""
        
        # Replace layout structure - pattern 1: with Sidebar and TopNav
        $content = $content -replace '(?s)<div className="flex h-screen bg-background">\s*<Sidebar />\s*<div className="flex flex-1 flex-col overflow-hidden">\s*<TopNav />\s*<main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">', '<AppLayout><div className="p-6">'
        
        # Replace closing tags
        $content = $content -replace '(?s)</main>\s*</div>\s*</div>\s*\)', '</div></AppLayout>)'
        
        # Clean up extra blank lines from removed imports
        $content = $content -replace '\n\n\n+', "`n`n"
        
        Set-Content $file -Value $content -NoNewline
        Write-Host "Updated: $file"
    }
}

Write-Host "`nAll files updated successfully!"
