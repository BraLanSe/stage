function Write-OK ($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn ($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err ($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Host "=== VÉRIFICATION DE L'ENVIRONNEMENT ===" -ForegroundColor Cyan

# Vérification Java
try {
    $java = java --version 2>&1 | Select-Object -First 1
    if ($java) { Write-OK "Java : $java" } else { Write-Err "Java introuvable" }
} catch { Write-Err "Java introuvable" }

# Vérification Maven
try {
    $mvn = mvn -v 2>&1 | Select-Object -First 1
    if ($mvn) { Write-OK "Maven : $mvn" } else { Write-Err "Maven introuvable" }
} catch { Write-Err "Maven introuvable" }

# Vérification PostgreSQL
try {
    $psql = psql -V 2>&1 | Select-Object -First 1
    if ($LASTEXITCODE -eq 0) { Write-OK "PostgreSQL (psql) : $psql" } else { Write-Warn "psql introuvable dans le PATH" }
} catch { Write-Warn "psql introuvable dans le PATH" }

Write-Host "=======================================" -ForegroundColor Cyan