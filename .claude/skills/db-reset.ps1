# [SKILL] db-reset.ps1
# Description : Réinitialisation complète de la base de données efatura_db
# Usage : .\.claude\skills\db-reset.ps1 [-Force]

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_USER = "postgres"
$DB_PASS = "postgres"
$DB_NAME = "efatura_db"
$SQL_FILE = Join-Path $ProjectRoot "erp_core_setup.sql"

$env:PGPASSWORD = $DB_PASS

function Write-Step($msg) { Write-Host "  => $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "  [ERRO] $msg" -ForegroundColor Red; exit 1 }

Write-Host "`n=== DB RESET — $DB_NAME ===" -ForegroundColor Magenta

# Confirmation
if (-not $Force) {
    Write-Host "`n  ATENCAO: Esta acao vai APAGAR todos os dados de '$DB_NAME'!" -ForegroundColor Red
    $confirm = Read-Host "  Confirmar? (sim/nao)"
    if ($confirm -notmatch "^s(im)?$") {
        Write-Host "  Operacao cancelada." -ForegroundColor Yellow
        exit 0
    }
}

# 1. Verificar psql
Write-Step "Verificar psql..."
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    # Tentar caminho padrão PostgreSQL
    $psqlPaths = @(
        "C:\Program Files\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe"
    )
    $psql = $psqlPaths | Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $psql) { Write-Fail "psql nao encontrado. Adicione ao PATH." }
    $psqlCmd = $psql
} else {
    $psqlCmd = "psql"
}
Write-OK "psql disponivel"

# 2. Testar conexao
Write-Step "Testar conexao PostgreSQL..."
$testConn = & $psqlCmd -h $DB_HOST -p $DB_PORT -U $DB_USER -c "SELECT 1;" postgres 2>&1
if ($LASTEXITCODE -ne 0) { Write-Fail "Conexao falhou: $testConn" }
Write-OK "Conexao OK"

# 3. Terminar conexoes ativas
Write-Step "Terminar conexoes ativas em '$DB_NAME'..."
$killQuery = "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME' AND pid <> pg_backend_pid();"
& $psqlCmd -h $DB_HOST -p $DB_PORT -U $DB_USER -c $killQuery postgres 2>&1 | Out-Null
Write-OK "Conexoes terminadas"

# 4. Apagar base
Write-Step "Apagar base '$DB_NAME'..."
$dropResult = & $psqlCmd -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" postgres 2>&1
if ($LASTEXITCODE -ne 0) { Write-Fail "Erro ao apagar: $dropResult" }
Write-OK "Base apagada"

# 5. Recriar base
Write-Step "Criar base '$DB_NAME'..."
$createResult = & $psqlCmd -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME ENCODING 'UTF8';" postgres 2>&1
if ($LASTEXITCODE -ne 0) { Write-Fail "Erro ao criar: $createResult" }
Write-OK "Base criada"

# 6. Executar SQL setup
Write-Step "Executar erp_core_setup.sql..."
if (-not (Test-Path $SQL_FILE)) { Write-Fail "Ficheiro SQL nao encontrado: $SQL_FILE" }
$setupResult = & $psqlCmd -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $SQL_FILE 2>&1
if ($LASTEXITCODE -ne 0) { Write-Fail "Erro no SQL: $setupResult" }
Write-OK "Schema e dados iniciais criados"

# 7. Contar tabelas criadas
$tableCount = & $psqlCmd -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>&1
$tableCount = $tableCount.Trim()
Write-Host "`n  Tabelas criadas : $tableCount" -ForegroundColor Green
Write-Host "=== RESET CONCLUIDO ===" -ForegroundColor Magenta

$env:PGPASSWORD = $null
