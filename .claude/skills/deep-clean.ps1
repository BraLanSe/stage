# [SKILL] deep-clean.ps1
# Description : Nettoyage profond Maven + Docker pour le projet eFatura
# Usage : .\.claude\skills\deep-clean.ps1 [-NoDocker]

param(
    [switch]$NoDocker
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

function Write-Step($msg) { Write-Host "  => $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  [!] $msg"  -ForegroundColor Yellow }

Write-Host "`n=== DEEP CLEAN — eFatura ===" -ForegroundColor Magenta
Write-Host "  Projet : $ProjectRoot`n"

# 1. Espace disque avant
$Before = (Get-PSDrive C).Free

# 2. Maven clean
Write-Step "Maven clean..."
Push-Location $ProjectRoot
try {
    $result = mvn clean -q 2>&1
    if ($LASTEXITCODE -ne 0) { throw "mvn clean a échoué: $result" }
    Write-OK "Target supprimé"
} finally {
    Pop-Location
}

# 3. Supprimer fichiers résiduels
Write-Step "Suppression des fichiers .class résiduels..."
$classFiles = Get-ChildItem -Path $ProjectRoot -Filter "*.class" -Recurse -ErrorAction SilentlyContinue
if ($classFiles.Count -gt 0) {
    $classFiles | Remove-Item -Force
    Write-OK "$($classFiles.Count) fichier(s) .class supprimé(s)"
} else {
    Write-OK "Aucun fichier .class résiduel"
}

# 4. Supprimer logs temporaires
Write-Step "Suppression des logs temporaires..."
@("spring_logs.txt", "*.log") | ForEach-Object {
    Get-ChildItem -Path $ProjectRoot -Filter $_ -ErrorAction SilentlyContinue | Remove-Item -Force
}
Write-OK "Logs temporaires nettoyés"

# 5. Docker (optionnel)
if (-not $NoDocker) {
    Write-Step "Vérification Docker..."
    $dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue
    if ($dockerAvailable) {
        # Arrêter conteneurs du projet
        $containers = docker ps -a --filter "name=efatura" --filter "name=postgres" -q 2>$null
        if ($containers) {
            Write-Step "Arrêt des conteneurs liés au projet..."
            docker stop $containers 2>$null | Out-Null
            docker rm $containers 2>$null | Out-Null
            Write-OK "Conteneurs supprimés"
        } else {
            Write-OK "Aucun conteneur actif à nettoyer"
        }
        # Nettoyer images dangling
        Write-Step "Nettoyage images Docker non utilisées..."
        docker image prune -f 2>$null | Out-Null
        Write-OK "Images orphelines supprimées"
    } else {
        Write-Warn "Docker non disponible — nettoyage Docker ignoré"
    }
} else {
    Write-Warn "Nettoyage Docker ignoré (-NoDocker)"
}

# 6. Espace libéré
$After = (Get-PSDrive C).Free
$Freed = [math]::Round(($After - $Before) / 1MB, 1)
Write-Host "`n  Espace libéré : +$Freed MB" -ForegroundColor Green
Write-Host "=== NETTOYAGE TERMINÉ ===" -ForegroundColor Magenta
