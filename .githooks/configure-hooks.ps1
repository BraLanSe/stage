# [TOOL] .githooks/configure-hooks.ps1
# Description : Configure Git pour utiliser .githooks comme répertoire de hooks actifs
# Usage : .\.githooks\configure-hooks.ps1 [-HooksPath ".githooks"]

param(
    [string]$HooksPath = ".githooks"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

function Write-Step($msg) { Write-Host "  => $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "  [ERRO] $msg" -ForegroundColor Red; exit 1 }

Write-Host "`n=== CONFIGURATION GIT HOOKS ===" -ForegroundColor Magenta
Write-Host "  Projet : $ProjectRoot`n"

# 1. Vérifier Git
Write-Step "Vérification Git disponible..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Fail "Git non trouvé dans le PATH. Installez Git for Windows."
}
Write-OK "$(git --version)"

# 2. Vérifier dépôt Git
Write-Step "Vérification dépôt Git..."
Push-Location $ProjectRoot
try {
    git rev-parse --git-dir 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Fail "Pas un dépôt Git : $ProjectRoot" }
    Write-OK "Dépôt Git validé"

    # 3. Vérifier que le dossier hooks existe
    $FullHooksPath = Join-Path $ProjectRoot $HooksPath
    if (-not (Test-Path $FullHooksPath)) {
        Write-Fail "Dossier hooks introuvable : $FullHooksPath"
    }
    Write-OK "Dossier '$HooksPath' trouvé"

    # 4. Configurer core.hooksPath
    Write-Step "Application de core.hooksPath = '$HooksPath'..."
    git config core.hooksPath $HooksPath
    if ($LASTEXITCODE -ne 0) { Write-Fail "Échec de git config" }
    Write-OK "core.hooksPath configuré"

    # 5. Marquer les hooks sans extension comme exécutables (compatibilité bash)
    $hooks = Get-ChildItem $FullHooksPath -File | Where-Object { $_.Extension -eq "" }
    if ($hooks.Count -gt 0) {
        foreach ($hook in $hooks) {
            $relPath = ($HooksPath + "/" + $hook.Name) -replace '\\', '/'
            git update-index --chmod=+x $relPath 2>$null | Out-Null
        }
        Write-OK "$($hooks.Count) hook(s) marqué(s) exécutable(s) : $($hooks.Name -join ', ')"
    } else {
        Write-Host "  [!] Aucun hook sans extension trouvé dans '$HooksPath'" -ForegroundColor Yellow
    }

    # 6. Afficher la configuration finale
    $configured = git config core.hooksPath
    Write-Host "`n  core.hooksPath = $configured" -ForegroundColor Green

} finally {
    Pop-Location
}

Write-Host "=== HOOKS ACTIVÉS ===" -ForegroundColor Magenta
