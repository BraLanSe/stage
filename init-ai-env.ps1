# ============================================================================
# init-ai-env.ps1 — Script maître d'initialisation de l'environnement IA
# ============================================================================
# Recrée instantanément toute l'architecture d'assistance Claude Code dans
# n'importe quel projet Spring Boot / Maven.
#
# Crée :
#   CLAUDE.md                         — Contexte projet pour Claude
#   .claude/settings.json             — MCP: PostgreSQL + Filesystem
#   .claude/skills/deep-clean.ps1     — Nettoyage Maven + Docker
#   .claude/skills/analyze-logs.ps1   — Analyse logs Spring Boot
#   .claude/skills/db-reset.ps1       — Reset base de données
#   .claude/skills/health-check.ps1   — Vérification environnement
#   .claude/skills/skills.md          — Documentation des skills
#   .githooks/pre-commit              — Hook qualité Git (bash)
#   .githooks/configure-hooks.ps1     — Active les hooks Git
#
# Usage :
#   .\init-ai-env.ps1
#   .\init-ai-env.ps1 -ProjectName "MonApp" -DbName "mon_db" -Port 9090 -Force
# ============================================================================

param(
    [string]$ProjectName   = "",
    [string]$AppMainClass  = "",
    [string]$DbName        = "",
    [string]$DbUser        = "postgres",
    [string]$DbPass        = "postgres",
    [string]$Port          = "8080",
    [string]$JavaVersion   = "21",
    [string]$SpringVersion = "3.x",
    [switch]$Force,
    [switch]$SkipGitConfig,
    [switch]$SkipExisting
)

$ErrorActionPreference = "Stop"
$TargetRoot = $PSScriptRoot

function Write-Step($msg)    { Write-Host "  => $msg" -ForegroundColor Cyan }
function Write-OK($msg)      { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg)    { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Write-Fail($msg)    { Write-Host "  [ERRO] $msg" -ForegroundColor Red; exit 1 }
function Write-Created($msg) { Write-Host "  [+] $msg" -ForegroundColor Blue }
function Write-Skipped($msg) { Write-Host "  [~] $msg (existant conservé)" -ForegroundColor DarkGray }

# ── Bannière ──────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "  ║   INIT AI ENVIRONMENT — Claude Code              ║" -ForegroundColor Magenta
Write-Host "  ║   Architecture complète d'assistance IA          ║" -ForegroundColor Magenta
Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# ── Collecte des paramètres manquants ────────────────────────────────────────
$folderName = Split-Path $TargetRoot -Leaf

if (-not $ProjectName) {
    $v = Read-Host "  Nom du projet [$folderName]"
    $ProjectName = if ($v) { $v } else { $folderName }
}
if (-not $DbName) {
    $defaultDb = ($ProjectName -replace '[^a-zA-Z0-9]', '_').ToLower() + "_db"
    $v = Read-Host "  Base de données [$defaultDb]"
    $DbName = if ($v) { $v } else { $defaultDb }
}
if (-not $AppMainClass) {
    $defaultClass = $ProjectName -replace '[^a-zA-Z0-9]', ''
    $defaultClass = ($defaultClass.Substring(0,1).ToUpper() + $defaultClass.Substring(1)) + "Application"
    $v = Read-Host "  Classe principale Spring Boot [$defaultClass]"
    $AppMainClass = if ($v) { $v } else { $defaultClass }
}

# ── Afficher la config retenue ────────────────────────────────────────────────
Write-Host ""
Write-Host "  Configuration retenue :" -ForegroundColor White
Write-Host "    Projet       : $ProjectName"    -ForegroundColor Gray
Write-Host "    Classe main  : $AppMainClass"   -ForegroundColor Gray
Write-Host "    Base DB      : $DbName"         -ForegroundColor Gray
Write-Host "    DB User      : $DbUser"         -ForegroundColor Gray
Write-Host "    Port         : $Port"           -ForegroundColor Gray
Write-Host "    Java         : $JavaVersion"    -ForegroundColor Gray
Write-Host "    Spring Boot  : $SpringVersion"  -ForegroundColor Gray
Write-Host "    Cible        : $TargetRoot"     -ForegroundColor Gray
Write-Host ""

if (-not $Force) {
    $confirm = Read-Host "  Créer l'environnement IA dans ce dossier ? (o/n)"
    if ($confirm -notmatch "^[oOyY]") {
        Write-Host "  Annulé." -ForegroundColor Yellow
        exit 0
    }
}

# ── Helpers d'écriture ────────────────────────────────────────────────────────
$CreatedFiles  = [System.Collections.Generic.List[string]]::new()
$SkippedFiles  = [System.Collections.Generic.List[string]]::new()

function New-Dir($path) {
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Created "Dossier créé : $(Split-Path $path -Leaf)/"
    }
}

function New-ProjectFile {
    param([string]$RelPath, [string]$Content)
    $FullPath = Join-Path $TargetRoot $RelPath
    $exists = Test-Path $FullPath

    if ($exists -and $SkipExisting -and -not $Force) {
        Write-Skipped $RelPath
        $SkippedFiles.Add($RelPath) | Out-Null
        return
    }
    Set-Content -Path $FullPath -Value $Content -Encoding UTF8 -NoNewline
    $verb = if ($exists) { "Mis à jour" } else { "Créé     " }
    Write-Created "$verb : $RelPath"
    $CreatedFiles.Add($RelPath) | Out-Null
}

function Apply-Template {
    param([string]$Template, [hashtable]$Vars)
    $result = $Template
    foreach ($kv in $Vars.GetEnumerator()) {
        $result = $result -replace [regex]::Escape("##$($kv.Key)##"), $kv.Value
    }
    return $result
}

$Vars = @{
    PROJECT_NAME   = $ProjectName
    APP_MAIN_CLASS = $AppMainClass
    DB_NAME        = $DbName
    DB_USER        = $DbUser
    DB_PASS        = $DbPass
    PORT           = $Port
    JAVA_VERSION   = $JavaVersion
    SPRING_VERSION = $SpringVersion
    PROJECT_ROOT   = ($TargetRoot -replace '\\', '\\')
}

# ── Créer l'arborescence ──────────────────────────────────────────────────────
Write-Host ""
Write-Step "Création de l'arborescence..."
New-Dir (Join-Path $TargetRoot ".claude")
New-Dir (Join-Path $TargetRoot ".claude\skills")
New-Dir (Join-Path $TargetRoot ".githooks")

# ════════════════════════════════════════════════════════════════════════════════
# 1 — .claude/settings.json
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "MCP settings..."
$tmpl = @'
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://##DB_USER##:##DB_PASS##@localhost:5432/##DB_NAME##"
      ],
      "env": {}
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "##PROJECT_ROOT##"
      ],
      "env": {}
    }
  }
}
'@
New-ProjectFile ".claude\settings.json" (Apply-Template $tmpl $Vars)

# ════════════════════════════════════════════════════════════════════════════════
# 2 — CLAUDE.md
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "CLAUDE.md..."
# CLAUDE.md uniquement créé s'il n'existe pas encore (ou avec -Force)
$claudemdPath = Join-Path $TargetRoot "CLAUDE.md"
if (-not (Test-Path $claudemdPath) -or $Force) {
    $tmpl = @'
# ##PROJECT_NAME## — Contexte Claude

## Projet
[Description du projet à compléter]

## Stack technique
| Composant       | Version / Détail                        |
|-----------------|-----------------------------------------|
| Java            | ##JAVA_VERSION##                        |
| Spring Boot     | ##SPRING_VERSION##                      |
| Build           | Maven 3.x                               |
| Base de données | PostgreSQL 5432 / base `##DB_NAME##`    |
| OS Dev          | Windows 11, PowerShell 7+               |

## Commandes essentielles

```powershell
# Compiler
mvn clean compile

# Lancer (profil dev)
mvn spring-boot:run -Dspring-boot.run.profiles=development

# Build complet
mvn clean package -DskipTests

# Nettoyage profond
.\.claude\skills\deep-clean.ps1

# Analyser les logs
.\.claude\skills\analyze-logs.ps1

# Réinitialiser la base
.\.claude\skills\db-reset.ps1

# Vérifier l'environnement
.\.claude\skills\health-check.ps1
```

## Base de données locale
```
Host     : localhost:5432
Database : ##DB_NAME##
User     : ##DB_USER##
Password : ##DB_PASS##
Schema   : public
DDL auto : update (Hibernate)
```

## Architecture du projet
```
src/main/java/[votre.package]/
├── shared/              # Infrastructure partagée
├── [module1]/           # application/ → domain/ → infrastructure/ → interfaces/
└── [module2]/
```

## Conventions de code

- **Imports** : jamais de wildcard `*`
- **Montants** : toujours `BigDecimal`, jamais float/double
- **Transactions** : `@Transactional` sur les services/handlers, jamais sur les contrôleurs
- **Noms** : camelCase Java, snake_case SQL, PascalCase classes

## Règle absolue — Format des solutions

> Toutes les solutions impliquant le système de fichiers, la base de données,
> la configuration, le build ou le déploiement **doivent être fournies sous forme
> de scripts PowerShell robustes** avec gestion d'erreurs (`try/catch`),
> messages de statut colorés (`Write-Host -ForegroundColor`) et vérification
> préalable des prérequis.

## Skills disponibles (`.claude/skills/`)

| Script               | Description                                      |
|----------------------|--------------------------------------------------|
| `deep-clean.ps1`     | Nettoyage Maven + Docker + target                |
| `analyze-logs.ps1`   | Analyse des logs Spring Boot                     |
| `db-reset.ps1`       | Reset complet de la base PostgreSQL              |
| `health-check.ps1`   | Vérification état de l'environnement             |

## MCP Servers (`.claude/settings.json`)

| Serveur        | Capacité                                        |
|----------------|-------------------------------------------------|
| `postgres`     | Lire/écrire directement dans `##DB_NAME##`      |
| `filesystem`   | Accès fichiers au dossier du projet             |

## Git Hooks (`.githooks/`)
- `pre-commit` — Vérifications qualité avant commit
- Activer les hooks : `.\.githooks\configure-hooks.ps1`

## Réutiliser cette architecture dans un nouveau projet
```powershell
.\init-ai-env.ps1 -ProjectName "MonProjet" -DbName "mon_db"
```

## Fichiers importants à ne pas modifier
- `src/main/java/.../shared/` — infrastructure partagée
- `pom.xml` — dépendances framework
- `.env` — variables d'environnement locales
'@
    New-ProjectFile "CLAUDE.md" (Apply-Template $tmpl $Vars)
} else {
    Write-Warn "CLAUDE.md existant conservé (utilisez -Force pour écraser)"
}

# ════════════════════════════════════════════════════════════════════════════════
# 3 — .githooks/pre-commit
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "Hook pre-commit..."
$tmpl = @'
#!/usr/bin/env bash
# .githooks/pre-commit — Vérifications qualité avant chaque commit

set -e
RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'

echo ""
echo "=== PRE-COMMIT — ##PROJECT_NAME## ==="
ERRORS=0

JAVA_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.java$' || true)

if [ -n "$JAVA_FILES" ]; then
    # System.out.println interdit — utiliser SLF4J
    SYSOUT=$(echo "$JAVA_FILES" | xargs grep -l "System\.out\.println" 2>/dev/null || true)
    if [ -n "$SYSOUT" ]; then
        echo -e "  ${RED}[ERRO] System.out.println détecté (utiliser log.info/error) :${NC}"
        echo "$SYSOUT" | while read f; do echo "    - $f"; done
        ERRORS=$((ERRORS + 1))
    fi

    # TODO/FIXME/HACK — avertissement non bloquant
    TODOS=$(echo "$JAVA_FILES" | xargs grep -ln "TODO\|FIXME\|HACK" 2>/dev/null || true)
    if [ -n "$TODOS" ]; then
        echo -e "  ${YELLOW}[AVISO] TODO/FIXME présents :${NC}"
        echo "$TODOS" | while read f; do echo "    - $f"; done
    fi

    # float/double pour montants — avertissement
    FLOATS=$(echo "$JAVA_FILES" | xargs grep -ln "\bdouble\b\|\bfloat\b" 2>/dev/null | grep -v "[Tt]est" || true)
    if [ -n "$FLOATS" ]; then
        echo -e "  ${YELLOW}[AVISO] float/double détecté (utiliser BigDecimal) :${NC}"
        echo "$FLOATS" | while read f; do echo "    - $f"; done
    fi

    # Credentials en dur — bloquant
    CREDS=$(echo "$JAVA_FILES" | xargs grep -ln "password\s*=\s*\"[^\"]\|secret\s*=\s*\"[^\"]\|apiKey\s*=\s*\"" 2>/dev/null || true)
    if [ -n "$CREDS" ]; then
        echo -e "  ${RED}[ERRO] Credentials potentiels en dur :${NC}"
        echo "$CREDS" | while read f; do echo "    - $f"; done
        ERRORS=$((ERRORS + 1))
    fi
fi

# .env ne doit JAMAIS être commité
ENV_STAGED=$(git diff --cached --name-only | grep "^\.env$" || true)
if [ -n "$ENV_STAGED" ]; then
    echo -e "  ${RED}[ERRO] Fichier .env en cours de commit ! Ajoutez-le au .gitignore${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Fichiers > 5 MB — avertissement
BIG_FILES=$(git diff --cached --name-only | while read f; do
    [ -f "$f" ] && SIZE=$(wc -c < "$f") && [ "$SIZE" -gt 5242880 ] && echo "$f ($((SIZE/1024/1024))MB)"
done || true)
if [ -n "$BIG_FILES" ]; then
    echo -e "  ${YELLOW}[AVISO] Fichiers volumineux (>5MB) :${NC}"
    echo "$BIG_FILES" | while read f; do echo "    - $f"; done
fi

echo ""
if [ "$ERRORS" -gt 0 ]; then
    echo -e "  ${RED}COMMIT BLOQUÉ — $ERRORS erreur(s) critique(s) à corriger${NC}"
    echo ""
    exit 1
else
    echo -e "  ${GREEN}Vérifications OK — commit autorisé${NC}"
    echo ""
    exit 0
fi
'@
New-ProjectFile ".githooks\pre-commit" (Apply-Template $tmpl $Vars)

# ════════════════════════════════════════════════════════════════════════════════
# 4 — .githooks/configure-hooks.ps1
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "configure-hooks.ps1..."
$tmpl = @'
# [TOOL] .githooks/configure-hooks.ps1
# Description : Configure Git pour utiliser .githooks comme répertoire de hooks actifs
# Usage : .\.githooks\configure-hooks.ps1 [-HooksPath ".githooks"]

param([string]$HooksPath = ".githooks")
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

function Write-Step($msg) { Write-Host "  => $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "  [ERRO] $msg" -ForegroundColor Red; exit 1 }

Write-Host "`n=== CONFIGURATION GIT HOOKS ===" -ForegroundColor Magenta
Write-Host "  Projet : $ProjectRoot`n"

Write-Step "Vérification Git..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Write-Fail "Git non trouvé dans le PATH" }
Write-OK "$(git --version)"

Push-Location $ProjectRoot
try {
    git rev-parse --git-dir 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Fail "Pas un dépôt Git : $ProjectRoot" }
    Write-OK "Dépôt Git validé"

    $FullHooksPath = Join-Path $ProjectRoot $HooksPath
    if (-not (Test-Path $FullHooksPath)) { Write-Fail "Dossier hooks introuvable : $FullHooksPath" }
    Write-OK "Dossier '$HooksPath' trouvé"

    Write-Step "Application de core.hooksPath = '$HooksPath'..."
    git config core.hooksPath $HooksPath
    if ($LASTEXITCODE -ne 0) { Write-Fail "Échec de git config" }
    Write-OK "core.hooksPath configuré"

    $hooks = Get-ChildItem $FullHooksPath -File | Where-Object { $_.Extension -eq "" }
    foreach ($hook in $hooks) {
        $relPath = ($HooksPath + "/" + $hook.Name) -replace '\\', '/'
        git update-index --chmod=+x $relPath 2>$null | Out-Null
    }
    if ($hooks.Count -gt 0) { Write-OK "$($hooks.Count) hook(s) marqué(s) exécutable(s)" }

    $configured = git config core.hooksPath
    Write-Host "`n  core.hooksPath = $configured" -ForegroundColor Green
} finally {
    Pop-Location
}
Write-Host "=== HOOKS ACTIVÉS ===" -ForegroundColor Magenta
'@
New-ProjectFile ".githooks\configure-hooks.ps1" (Apply-Template $tmpl $Vars)

# ════════════════════════════════════════════════════════════════════════════════
# 5 — .claude/skills/deep-clean.ps1
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "Skill deep-clean.ps1..."
$tmpl = @'
# [SKILL] deep-clean.ps1
# Description : Nettoyage profond Maven + Docker pour ##PROJECT_NAME##
# Usage : .\.claude\skills\deep-clean.ps1 [-NoDocker]

param([switch]$NoDocker)
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

function Write-Step($msg) { Write-Host "  => $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  [!] $msg"  -ForegroundColor Yellow }

Write-Host "`n=== DEEP CLEAN — ##PROJECT_NAME## ===" -ForegroundColor Magenta
Write-Host "  Projet : $ProjectRoot`n"
$Before = (Get-PSDrive C).Free

# 1. Maven clean
Write-Step "Maven clean..."
Push-Location $ProjectRoot
try {
    $result = mvn clean -q 2>&1
    if ($LASTEXITCODE -ne 0) { throw "mvn clean a échoué: $result" }
    Write-OK "Dossier target/ supprimé"
} finally { Pop-Location }

# 2. Fichiers .class résiduels
Write-Step "Fichiers .class résiduels..."
$classFiles = Get-ChildItem -Path $ProjectRoot -Filter "*.class" -Recurse -ErrorAction SilentlyContinue
if ($classFiles.Count -gt 0) {
    $classFiles | Remove-Item -Force
    Write-OK "$($classFiles.Count) fichier(s) .class supprimé(s)"
} else { Write-OK "Aucun fichier .class résiduel" }

# 3. Docker (optionnel)
if (-not $NoDocker) {
    Write-Step "Docker cleanup..."
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        docker info 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $projName = Split-Path $ProjectRoot -Leaf
            $containers = docker ps -a --filter "name=$projName" -q 2>$null
            if ($containers) {
                docker stop $containers 2>$null | Out-Null
                docker rm $containers 2>$null | Out-Null
                Write-OK "Conteneurs projet supprimés"
            } else { Write-OK "Aucun conteneur projet à nettoyer" }
            docker image prune -f 2>$null | Out-Null
            Write-OK "Images orphelines supprimées"
        } else { Write-Warn "Docker daemon non démarré" }
    } else { Write-Warn "Docker non disponible — nettoyage ignoré" }
} else { Write-Warn "Docker ignoré (-NoDocker)" }

# Espace libéré
$Freed = [math]::Round(((Get-PSDrive C).Free - $Before) / 1MB, 1)
Write-Host "`n  Espace libéré : +$Freed MB" -ForegroundColor Green
Write-Host "=== NETTOYAGE TERMINÉ ===" -ForegroundColor Magenta
'@
$deepCleanDest = ".claude\skills\deep-clean.ps1"
if (-not (Test-Path (Join-Path $TargetRoot $deepCleanDest)) -or $Force) {
    New-ProjectFile $deepCleanDest (Apply-Template $tmpl $Vars)
} else { Write-Skipped $deepCleanDest }

# ════════════════════════════════════════════════════════════════════════════════
# 6 — .claude/skills/analyze-logs.ps1
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "Skill analyze-logs.ps1..."
$tmpl = @'
# [SKILL] analyze-logs.ps1
# Description : Analyse des logs Spring Boot — erreurs, exceptions, statut démarrage
# Usage : .\.claude\skills\analyze-logs.ps1 [-LogFile path] [-Level ERROR|WARN|ALL] [-Last N]

param(
    [string]$LogFile = "spring_logs.txt",
    [ValidateSet("ALL","ERROR","WARN")][string]$Level = "ALL",
    [int]$Last = 0
)
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$FullPath = if ([System.IO.Path]::IsPathRooted($LogFile)) { $LogFile } else { Join-Path $ProjectRoot $LogFile }

Write-Host "`n=== ANALYSE LOGS — ##PROJECT_NAME## ===" -ForegroundColor Magenta

if (-not (Test-Path $FullPath)) {
    Write-Host "  [!] Fichier introuvable : $FullPath" -ForegroundColor Red
    Write-Host "  Astuce : mvn spring-boot:run > spring_logs.txt 2>&1" -ForegroundColor Yellow
    exit 1
}

$AllLines = Get-Content $FullPath
if ($Last -gt 0) { $AllLines = $AllLines | Select-Object -Last $Last }
$Errors = $AllLines | Where-Object { $_ -match "\bERROR\b" }
$Warns  = $AllLines | Where-Object { $_ -match "\bWARN\b" }

Write-Host "  Fichier : $FullPath ($($AllLines.Count) lignes)`n" -ForegroundColor Gray
Write-Host "--- RÉSUMÉ ---" -ForegroundColor Yellow
Write-Host "  ERRORs : $($Errors.Count)" -ForegroundColor $(if ($Errors.Count -gt 0) {"Red"} else {"Green"})
Write-Host "  WARNs  : $($Warns.Count)"  -ForegroundColor $(if ($Warns.Count -gt 0) {"Yellow"} else {"Green"})

$DbErrors = $AllLines | Where-Object { $_ -match "Connection refused|FATAL|could not connect|Unable to acquire|HikariPool" }
if ($DbErrors.Count -gt 0) {
    Write-Host "`n--- PROBLÈMES BASE DE DONNÉES ($($DbErrors.Count)) ---" -ForegroundColor Red
    $DbErrors | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}

$PortErrors = $AllLines | Where-Object { $_ -match "Address already in use|BindException" }
if ($PortErrors.Count -gt 0) {
    Write-Host "`n--- PORT OCCUPÉ ---" -ForegroundColor Red
    Write-Host "  Solution : Stop-Process -Id (Get-NetTCPConnection -LocalPort ##PORT##).OwningProcess -Force" -ForegroundColor Yellow
}

Write-Host "`n--- TOP EXCEPTIONS ---" -ForegroundColor Cyan
$Exceptions = $AllLines | Where-Object { $_ -match "Exception|Error:" } |
    ForEach-Object { if ($_ -match "([\w.]+Exception|[\w.]+Error)") { $Matches[1] } } |
    Where-Object { $_ } | Group-Object | Sort-Object Count -Descending | Select-Object -First 10

if ($Exceptions) {
    $Exceptions | ForEach-Object {
        Write-Host ("  {0,4}x  {1}" -f $_.Count, $_.Name) -ForegroundColor $(if ($_.Count -gt 5) {"Red"} else {"Yellow"})
    }
} else { Write-Host "  Aucune exception détectée" -ForegroundColor Green }

$StartupOk   = $AllLines | Where-Object { $_ -match "Started \w+Application" }
$StartupFail = $AllLines | Where-Object { $_ -match "APPLICATION FAILED TO START|BUILD FAILURE" }
Write-Host "`n--- STATUT DÉMARRAGE ---" -ForegroundColor Cyan
if ($StartupOk)   { Write-Host "  [OK] $($StartupOk | Select-Object -Last 1)" -ForegroundColor Green }
elseif ($StartupFail) { Write-Host "  [ECHEC] Application n'a pas démarré" -ForegroundColor Red }
else { Write-Host "  [?] Statut indéterminé (logs incomplets ?)" -ForegroundColor Yellow }

Write-Host "`n=== FIN ANALYSE ===" -ForegroundColor Magenta
'@
$analyzeLogsDest = ".claude\skills\analyze-logs.ps1"
if (-not (Test-Path (Join-Path $TargetRoot $analyzeLogsDest)) -or $Force) {
    New-ProjectFile $analyzeLogsDest (Apply-Template $tmpl $Vars)
} else { Write-Skipped $analyzeLogsDest }

# ════════════════════════════════════════════════════════════════════════════════
# 7 — .claude/skills/db-reset.ps1
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "Skill db-reset.ps1..."
$tmpl = @'
# [SKILL] db-reset.ps1
# Description : Réinitialisation complète de ##DB_NAME##
# Usage : .\.claude\skills\db-reset.ps1 [-Force]

param([switch]$Force)
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$DB_HOST = "localhost"; $DB_PORT = "5432"
$DB_USER = "##DB_USER##"; $DB_PASS = "##DB_PASS##"; $DB_NAME = "##DB_NAME##"
$SQL_FILE = Join-Path $ProjectRoot "erp_core_setup.sql"
$env:PGPASSWORD = $DB_PASS

function Write-Step($msg) { Write-Host "  => $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "  [ERRO] $msg" -ForegroundColor Red; exit 1 }

Write-Host "`n=== DB RESET — $DB_NAME ===" -ForegroundColor Magenta

if (-not $Force) {
    Write-Host "`n  ATTENTION : TOUTES les données de '$DB_NAME' seront supprimées !" -ForegroundColor Red
    $confirm = Read-Host "  Confirmer ? (o/n)"
    if ($confirm -notmatch "^[oOyY]") { Write-Host "  Annulé." -ForegroundColor Yellow; exit 0 }
}

Write-Step "Vérifier psql..."
$psqlCmd = "psql"
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    $p = @("C:\Program Files\PostgreSQL\17\bin\psql.exe","C:\Program Files\PostgreSQL\16\bin\psql.exe","C:\Program Files\PostgreSQL\15\bin\psql.exe") |
        Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $p) { Write-Fail "psql introuvable. Ajoutez PostgreSQL au PATH." }
    $psqlCmd = $p
}
Write-OK "psql disponible"

Write-Step "Test connexion..."
$test = & $psqlCmd -h $DB_HOST -p $DB_PORT -U $DB_USER -c "SELECT 1;" postgres 2>&1
if ($LASTEXITCODE -ne 0) { Write-Fail "Connexion échouée : $test" }
Write-OK "Connexion OK"

Write-Step "Terminer connexions actives sur '$DB_NAME'..."
$killQ = "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME' AND pid <> pg_backend_pid();"
& $psqlCmd -h $DB_HOST -p $DB_PORT -U $DB_USER -c $killQ postgres 2>&1 | Out-Null
Write-OK "Connexions terminées"

Write-Step "Supprimer base '$DB_NAME'..."
& $psqlCmd -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" postgres 2>&1 | Out-Null
Write-OK "Base supprimée"

Write-Step "Créer base '$DB_NAME'..."
$r = & $psqlCmd -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME ENCODING 'UTF8';" postgres 2>&1
if ($LASTEXITCODE -ne 0) { Write-Fail "Erreur création : $r" }
Write-OK "Base créée"

if (Test-Path $SQL_FILE) {
    Write-Step "Exécution SQL setup..."
    $r = & $psqlCmd -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $SQL_FILE 2>&1
    if ($LASTEXITCODE -ne 0) { Write-Fail "Erreur SQL : $r" }
    $n = & $psqlCmd -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>&1
    Write-OK "Schema initialisé — $($n.Trim()) table(s)"
} else {
    Write-Host "  [!] Pas de fichier SQL setup trouvé ($SQL_FILE)" -ForegroundColor Yellow
    Write-Host "      Créez erp_core_setup.sql ou initialisez Hibernate DDL auto" -ForegroundColor Gray
}

$env:PGPASSWORD = $null
Write-Host "=== RESET TERMINÉ ===" -ForegroundColor Magenta
'@
$dbResetDest = ".claude\skills\db-reset.ps1"
if (-not (Test-Path (Join-Path $TargetRoot $dbResetDest)) -or $Force) {
    New-ProjectFile $dbResetDest (Apply-Template $tmpl $Vars)
} else { Write-Skipped $dbResetDest }

# ════════════════════════════════════════════════════════════════════════════════
# 8 — .claude/skills/health-check.ps1
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "Skill health-check.ps1..."
$tmpl = @'
# [SKILL] health-check.ps1
# Description : Vérifie l'état complet de l'environnement ##PROJECT_NAME##
# Usage : .\.claude\skills\health-check.ps1 [-Port ##PORT##]

param(
    [int]$Port      = ##PORT##,
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbName = "##DB_NAME##",
    [string]$DbUser = "##DB_USER##",
    [string]$DbPass = "##DB_PASS##"
)
$ErrorActionPreference = "SilentlyContinue"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

function Write-OK($msg)    { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Write-Fail($msg)  { Write-Host "  [FAIL] $msg" -ForegroundColor Red }
function Write-Warn($msg)  { Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Section($t) { Write-Host "`n--- $t ---" -ForegroundColor Cyan }

Write-Host "`n=== HEALTH CHECK — ##PROJECT_NAME## ===" -ForegroundColor Magenta

Write-Section "SPRING BOOT (port $Port)"
try {
    $r = Invoke-WebRequest -Uri "http://localhost:$Port/actuator/health" -TimeoutSec 3 -UseBasicParsing
    if ($r.StatusCode -eq 200) {
        $h = $r.Content | ConvertFrom-Json
        Write-OK "Actuator Health UP — statut: $($h.status)"
    }
} catch {
    $javaProc = Get-Process -Name "java" -ErrorAction SilentlyContinue
    if ($javaProc) { Write-Warn "Java tourne (PID: $($javaProc.Id -join ', ')) mais /actuator/health inaccessible" }
    else { Write-Fail "Spring Boot non démarré (port $Port libre)"; Write-Host "         Démarrer : mvn spring-boot:run" -ForegroundColor Gray }
}

Write-Section "POSTGRESQL (${DbHost}:${DbPort})"
$env:PGPASSWORD = $DbPass
$psqlCmd = "psql"
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    $found = @("C:\Program Files\PostgreSQL\17\bin\psql.exe","C:\Program Files\PostgreSQL\16\bin\psql.exe","C:\Program Files\PostgreSQL\15\bin\psql.exe") |
        Where-Object { Test-Path $_ } | Select-Object -First 1
    $psqlCmd = if ($found) { $found } else { $null }
}
if ($psqlCmd) {
    $pgVer = & $psqlCmd -h $DbHost -p $DbPort -U $DbUser -t -c "SELECT version();" postgres 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-OK "PostgreSQL UP — $(($pgVer.Trim() -split ' ')[0..2] -join ' ')"
        $dbOk = & $psqlCmd -h $DbHost -p $DbPort -U $DbUser -t -c "SELECT 1 FROM pg_database WHERE datname='$DbName';" postgres 2>&1
        if ($dbOk -match "1") {
            $tc = & $psqlCmd -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>&1
            Write-OK "Base '$DbName' OK — $($tc.Trim()) table(s)"
        } else { Write-Fail "Base '$DbName' introuvable — lancer db-reset.ps1" }
    } else { Write-Fail "PostgreSQL inaccessible — ${DbHost}:${DbPort}" }
} else { Write-Warn "psql non trouvé" }
$env:PGPASSWORD = $null

Write-Section "DOCKER"
if (Get-Command docker -ErrorAction SilentlyContinue) {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $projName = Split-Path $ProjectRoot -Leaf
        $c = docker ps --filter "name=$projName" --format "{{.Names}} ({{.Status}})" 2>$null
        if ($c) { Write-OK "Docker actif — $c" } else { Write-Warn "Docker actif — aucun conteneur projet" }
    } else { Write-Warn "Docker daemon non démarré" }
} else { Write-Warn "Docker non installé" }

Write-Section "PORTS RÉSEAU"
foreach ($p in @($Port, 5432)) {
    $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        Write-OK "Port $p — $($proc.Name) (PID $($proc.Id))"
    } else { Write-Warn "Port $p — libre" }
}

Write-Host "`n=== FIN HEALTH CHECK ===" -ForegroundColor Magenta
'@
$healthCheckDest = ".claude\skills\health-check.ps1"
if (-not (Test-Path (Join-Path $TargetRoot $healthCheckDest)) -or $Force) {
    New-ProjectFile $healthCheckDest (Apply-Template $tmpl $Vars)
} else { Write-Skipped $healthCheckDest }

# ════════════════════════════════════════════════════════════════════════════════
# 9 — .claude/skills/skills.md
# ════════════════════════════════════════════════════════════════════════════════
Write-Step "skills.md..."
$tmpl = @'
# Claude Skills — ##PROJECT_NAME##

Scripts PowerShell réutilisables pour l'assistance IA sur ce projet.

## Appel des skills

Dans Claude Code, demandez directement :
> "Exécute le skill deep-clean"
> "Lance health-check"
> "Analyse les logs avec analyze-logs"

Ou en PowerShell :
```powershell
.\.claude\skills\deep-clean.ps1
.\.claude\skills\analyze-logs.ps1 -LogFile .\spring_logs.txt
.\.claude\skills\db-reset.ps1 -Force
.\.claude\skills\health-check.ps1
```

---

## deep-clean.ps1
Nettoyage complet : `mvn clean` + suppression `.class` résiduels + Docker prune.

```powershell
.\.claude\skills\deep-clean.ps1            # Standard (avec Docker)
.\.claude\skills\deep-clean.ps1 -NoDocker  # Maven uniquement
```

---

## analyze-logs.ps1
Analyse logs Spring Boot : erreurs, exceptions groupées, statut démarrage, problèmes DB.

```powershell
.\.claude\skills\analyze-logs.ps1                        # Analyse spring_logs.txt
.\.claude\skills\analyze-logs.ps1 -LogFile .\app.log    # Fichier spécifique
.\.claude\skills\analyze-logs.ps1 -Level ERROR           # Seulement ERRORs
.\.claude\skills\analyze-logs.ps1 -Last 100              # 100 dernières lignes
```

---

## db-reset.ps1
Drop + create `##DB_NAME##` + exécution SQL setup.

```powershell
.\.claude\skills\db-reset.ps1         # Avec confirmation interactive
.\.claude\skills\db-reset.ps1 -Force  # Sans confirmation (CI/CD)
```

---

## health-check.ps1
État complet : Spring Boot, PostgreSQL, Docker, ports réseau.

```powershell
.\.claude\skills\health-check.ps1             # Check complet (port par défaut)
.\.claude\skills\health-check.ps1 -Port 9090  # Port personnalisé
```

---

## Ajouter un nouveau skill

1. Créer `nom-skill.ps1` dans ce dossier
2. Ajouter l'entrée dans ce fichier `skills.md`
3. Respecter le template :

```powershell
# [SKILL] nom-skill.ps1
# Description : ...
# Usage : .\.claude\skills\nom-skill.ps1 [-Param valeur]
param(...)
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
# ... logique ...
```
'@
New-ProjectFile ".claude\skills\skills.md" (Apply-Template $tmpl $Vars)

# ════════════════════════════════════════════════════════════════════════════════
# 10 — Configuration Git hooks
# ════════════════════════════════════════════════════════════════════════════════
if (-not $SkipGitConfig) {
    Write-Step "Configuration Git hooks (core.hooksPath)..."
    if (Get-Command git -ErrorAction SilentlyContinue) {
        Push-Location $TargetRoot
        try {
            git rev-parse --git-dir 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                git config core.hooksPath ".githooks"
                $hooks = Get-ChildItem (Join-Path $TargetRoot ".githooks") -File |
                    Where-Object { $_.Extension -eq "" }
                foreach ($hook in $hooks) {
                    git update-index --chmod=+x ".githooks/$($hook.Name)" 2>$null | Out-Null
                }
                Write-OK "core.hooksPath = .githooks ($($hooks.Count) hook(s))"
            } else {
                Write-Warn "Pas un dépôt Git — core.hooksPath non configuré"
                Write-Warn "Lancez 'git init' puis '.\.githooks\configure-hooks.ps1'"
            }
        } catch {
            Write-Warn "Erreur configuration hooks : $_"
        } finally {
            Pop-Location
        }
    } else {
        Write-Warn "Git non disponible — hooks non configurés"
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# RÉCAPITULATIF FINAL
# ════════════════════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║   ENVIRONNEMENT IA INITIALISÉ — $ProjectName".PadRight(58) + "║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

if ($CreatedFiles.Count -gt 0) {
    Write-Host "  Fichiers créés/mis à jour ($($CreatedFiles.Count)) :" -ForegroundColor White
    foreach ($f in $CreatedFiles) { Write-Host "    + $f" -ForegroundColor Blue }
}
if ($SkippedFiles.Count -gt 0) {
    Write-Host "`n  Fichiers conservés ($($SkippedFiles.Count)) :" -ForegroundColor DarkGray
    foreach ($f in $SkippedFiles) { Write-Host "    ~ $f" -ForegroundColor DarkGray }
}

Write-Host ""
Write-Host "  Prochaines étapes :" -ForegroundColor White
Write-Host "    1. Personnaliser CLAUDE.md avec la description de votre projet" -ForegroundColor Gray
Write-Host "    2. Vérifier l'env  : .\.claude\skills\health-check.ps1" -ForegroundColor Gray
Write-Host "    3. Tester le hook  : git diff --cached | git commit --dry-run" -ForegroundColor Gray
Write-Host ""
Write-Host "  Pour réutiliser dans un autre projet :" -ForegroundColor White
Write-Host "    Copiez init-ai-env.ps1 à la racine du nouveau projet et lancez-le." -ForegroundColor Gray
Write-Host ""
