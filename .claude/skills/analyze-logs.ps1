# [SKILL] analyze-logs.ps1
# Description : Analyse des logs Spring Boot — erreurs, exceptions, patterns
# Usage : .\.claude\skills\analyze-logs.ps1 [-LogFile path] [-Level ERROR|WARN] [-Last N]

param(
    [string]$LogFile = "spring_logs.txt",
    [ValidateSet("ALL","ERROR","WARN")][string]$Level = "ALL",
    [int]$Last = 0
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$FullPath = if ([System.IO.Path]::IsPathRooted($LogFile)) { $LogFile } else { Join-Path $ProjectRoot $LogFile }

Write-Host "`n=== ANALYSE LOGS — eFatura ===" -ForegroundColor Magenta

# Vérification
if (-not (Test-Path $FullPath)) {
    Write-Host "  [!] Fichier introuvable : $FullPath" -ForegroundColor Red
    Write-Host "  Astuce : lancez d'abord 'mvn spring-boot:run > spring_logs.txt 2>&1'" -ForegroundColor Yellow
    exit 1
}

$AllLines = Get-Content $FullPath
if ($Last -gt 0) { $AllLines = $AllLines | Select-Object -Last $Last }

Write-Host "  Fichier : $FullPath"
Write-Host "  Lignes  : $($AllLines.Count)`n"

# Extraction par niveau
$Errors = $AllLines | Where-Object { $_ -match "\bERROR\b" }
$Warns  = $AllLines | Where-Object { $_ -match "\bWARN\b" }

# Compteurs
Write-Host "--- RESUME ---" -ForegroundColor Yellow
Write-Host "  ERRORs : $($Errors.Count)" -ForegroundColor Red
Write-Host "  WARNs  : $($Warns.Count)"  -ForegroundColor Yellow

# Détection DB
$DbErrors = $AllLines | Where-Object { $_ -match "Connection refused|FATAL|could not connect|Unable to acquire|HikariPool" }
if ($DbErrors.Count -gt 0) {
    Write-Host "`n--- PROBLEMES BASE DE DONNEES ($($DbErrors.Count)) ---" -ForegroundColor Red
    $DbErrors | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}

# Détection port déjà utilisé
$PortErrors = $AllLines | Where-Object { $_ -match "Address already in use|BindException" }
if ($PortErrors.Count -gt 0) {
    Write-Host "`n--- PORT OCCUPE ---" -ForegroundColor Red
    $PortErrors | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host "  Solution : Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force" -ForegroundColor Yellow
}

# Top exceptions
Write-Host "`n--- TOP EXCEPTIONS ---" -ForegroundColor Cyan
$Exceptions = $AllLines | Where-Object { $_ -match "Exception|Error:" } |
    ForEach-Object { if ($_ -match "([\w.]+Exception|[\w.]+Error)") { $Matches[1] } } |
    Where-Object { $_ } |
    Group-Object | Sort-Object Count -Descending | Select-Object -First 10

if ($Exceptions) {
    $Exceptions | ForEach-Object {
        Write-Host ("  {0,4}x  {1}" -f $_.Count, $_.Name) -ForegroundColor $(if ($_.Count -gt 5) { "Red" } else { "Yellow" })
    }
} else {
    Write-Host "  Aucune exception détectée" -ForegroundColor Green
}

# Affichage détaillé selon le niveau demandé
if ($Level -ne "ALL" -or $Errors.Count -le 20) {
    $ToShow = switch ($Level) {
        "ERROR" { $Errors }
        "WARN"  { $Warns }
        default { $Errors }
    }
    if ($ToShow.Count -gt 0) {
        Write-Host "`n--- DETAIL ($Level) ---" -ForegroundColor Cyan
        $ToShow | Select-Object -First 20 | ForEach-Object {
            $color = if ($_ -match "ERROR") { "Red" } else { "Yellow" }
            Write-Host "  $_" -ForegroundColor $color
        }
        if ($ToShow.Count -gt 20) {
            Write-Host "  ... et $($ToShow.Count - 20) ligne(s) supplémentaire(s)" -ForegroundColor Gray
        }
    }
}

# Statut démarrage
$StartupOk = $AllLines | Where-Object { $_ -match "Started EFaturaApplication" }
$StartupFail = $AllLines | Where-Object { $_ -match "APPLICATION FAILED TO START|BUILD FAILURE" }

Write-Host "`n--- STATUT DEMARRAGE ---" -ForegroundColor Cyan
if ($StartupOk) {
    $StartupOk | Select-Object -Last 1 | ForEach-Object { Write-Host "  [OK] $_" -ForegroundColor Green }
} elseif ($StartupFail) {
    Write-Host "  [ECHEC] Application n'a pas démarré" -ForegroundColor Red
} else {
    Write-Host "  [?] Statut indéterminé (logs incomplets)" -ForegroundColor Yellow
}

Write-Host "`n=== FIN ANALYSE ===" -ForegroundColor Magenta
