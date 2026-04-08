function Write-OK ($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Err ($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Host "=== VÉRIFICATION FRONTEND ===" -ForegroundColor Cyan

# Vérification Node.js
try {
    $node = node -v 2>&1
    if ($LASTEXITCODE -eq 0) { Write-OK "Node.js : $node" } else { Write-Err "Node.js non installé" }
} catch { Write-Err "Node.js non installé" }

# Vérification du design Pencil (.pen)
$design = Get-ChildItem -Filter "*.pen" -Recurse | Select-Object -First 1
if ($design) { Write-OK "Design Pencil détecté : $($design.Name)" } else { Write-Host "[!] Aucun fichier .pen trouvé (Design visuel manquant)" -ForegroundColor Yellow }

Write-Host "=============================" -ForegroundColor Cyan