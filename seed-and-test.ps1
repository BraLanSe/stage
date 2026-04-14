# seed-and-test.ps1
# Initialise les donnees de base et cree une fatura de venda de test
# Usage : .\seed-and-test.ps1 [-BaseUrl "http://localhost:8080"]

param([string]$BaseUrl = "http://localhost:8080")
$ErrorActionPreference = "Stop"

$H = @{ "Content-Type" = "application/json" }

function Write-Step($msg)  { Write-Host "" ; Write-Host "  >> $msg" -ForegroundColor Cyan }
function Write-OK($msg)    { Write-Host "     [OK]   $msg" -ForegroundColor Green }
function Write-Skip($msg)  { Write-Host "     [SKIP] $msg" -ForegroundColor Yellow }
function Write-Fail($msg)  { Write-Host "     [FAIL] $msg" -ForegroundColor Red ; exit 1 }
function Write-Data($k,$v) { Write-Host "            $k : $v" -ForegroundColor Gray }

function Invoke-Api {
    param([string]$Method, [string]$Path, $Body = $null)
    $uri = "$BaseUrl/$Path"
    try {
        if ($Body) {
            $json = $Body | ConvertTo-Json -Depth 10 -Compress
            Invoke-RestMethod -Method $Method -Uri $uri -Headers $H -Body $json
        } else {
            Invoke-RestMethod -Method $Method -Uri $uri -Headers $H
        }
    } catch {
        $code    = $_.Exception.Response.StatusCode.value__
        $errBody = $_.ErrorDetails.Message
        throw "HTTP $code - $errBody"
    }
}

Write-Host ""
Write-Host "  =================================================" -ForegroundColor Magenta
Write-Host "  SEED & TEST - eFatura API (H2 in-memory)" -ForegroundColor Magenta
Write-Host "  Base URL : $BaseUrl" -ForegroundColor Magenta
Write-Host "  =================================================" -ForegroundColor Magenta

# ── 0. Verifier que l'API repond ──────────────────────────────────────
Write-Step "0/7  Verification API disponible..."
try {
    Invoke-RestMethod -Uri "$BaseUrl/api/v1/parametrizacao/impostos" -Method GET -Headers $H | Out-Null
    Write-OK "API accessible sur $BaseUrl"
} catch {
    Write-Fail "API inaccessible - Demarrez d'abord : mvn spring-boot:run"
}

# Helper GET-or-create : cherche par codigo dans une liste, cree si absent
function Get-OrCreate {
    param($ListPath, $CreatePath, $Codigo, $Body, $Label)
    $all = Invoke-Api GET $ListPath
    $existing = $all | Where-Object { $_.codigo -eq $Codigo }
    if ($existing) {
        Write-Skip "$Label '$Codigo' deja present (id=$($existing.id))"
        return $existing
    }
    $created = Invoke-Api POST $CreatePath $Body
    Write-OK "$Label cri/e - id=$($created.id), codigo=$($created.codigo)"
    return $created
}

# ── 1. Moeda CVE ──────────────────────────────────────────────────────
Write-Step "1/7  Moeda CVE..."
$moeda = Get-OrCreate "api/v1/parametrizacao/moedas" "api/v1/parametrizacao/moedas" "CVE" @{
    codigo = "CVE"; desig = "Escudo Cabo-verdiano"; simbolo = "CVE"; estado = "ATIVO"
} "Moeda"

# ── 2. Tipo de Fatura FT ──────────────────────────────────────────────
Write-Step "2/7  TipoFatura 'FT'..."
$tipoFatura = Get-OrCreate "api/v1/parametrizacao/tipos-fatura" "api/v1/parametrizacao/tipos-fatura" "FT" @{
    codigo = "FT"; desig = "Fatura"; descr = "Fatura de venda padrao"; estado = "ATIVO"
} "TipoFatura"
$tipoFaturaId = $tipoFatura.id

# ── 3. Serie FT-2025 ──────────────────────────────────────────────────
Write-Step "3/7  Serie 'FT-2025'..."
$serie = Get-OrCreate "api/v1/parametrizacao/series" "api/v1/parametrizacao/series" "FT-2025" @{
    codigo = "FT-2025"; desig = "Serie Faturas 2025"; contador = 0
    prFaturaTipoId = $tipoFaturaId; estado = "ATIVO"
} "Serie"
$prSerieId = $serie.id

# ── 4. Imposto IVA 15% ────────────────────────────────────────────────
Write-Step "4/7  Imposto IVA15..."
$imposto = Get-OrCreate "api/v1/parametrizacao/impostos" "api/v1/parametrizacao/impostos" "IVA15" @{
    codigo = "IVA15"; desig = "IVA 15%"
    descr = "Imposto sobre o Valor Acrescentado - taxa normal 15%"
    tipoCalculo = "PERCENTAGEM"; valor = 15.00; aplicaRetencao = $false; estado = "ATIVO"
} "Imposto"
$impostoId = $imposto.id

# ── 5. Unidade UN ─────────────────────────────────────────────────────
Write-Step "5/7  Unidade 'UN'..."
$prUnidadeId = $null
$unidade = Get-OrCreate "api/v1/parametrizacao/unidades" "api/v1/parametrizacao/unidades" "UN" @{
    codigo = "UN"; desig = "Unidade"; estado = "ATIVO"
} "Unidade"
$prUnidadeId = $unidade.id

# ── 6. Cliente ────────────────────────────────────────────────────────
Write-Step "6/7  Cliente 'CLI-001'..."
$allClientes  = Invoke-Api GET "api/v1/clientes"
$clienteExist = $allClientes | Where-Object { $_.codigo -eq "CLI-001" }
if ($clienteExist) {
    Write-Skip "Cliente 'CLI-001' deja present (id=$($clienteExist.id))"
    $cliente = $clienteExist
} else {
    $cliente = Invoke-Api POST "api/v1/clientes" @{
        codigo = "CLI-001"; desig = "Empresa Teste, Lda"
        descr = "Cliente de teste criado pelo seed script"
        nif = "200123456"; numCliente = "C001"
        email = "teste@empresa.cv"; telefone = "+238 261 0000"
        pais = "CPV"; endereco = "Praia, Santiago, Cabo Verde"
        indColetivo = $true; aplicarImpostos = $true; estado = "ATIVO"
    }
    Write-OK "Cliente criado - id=$($cliente.id)"
    Write-Data "Designacao" $cliente.desig
    Write-Data "NIF"        $cliente.nif
}
$clienteId = $cliente.id

# ── 7. Fatura de Venda ────────────────────────────────────────────────
Write-Step "7/7  Creer Fatura de Venda de test..."
Write-Host "     Calcul : 2 x 10000 CVE = 20000 bruto + IVA 15% (3000) = 23000 CVE total" -ForegroundColor DarkGray
Write-Data "  clienteId"    $clienteId
Write-Data "  tipoFaturaId" $tipoFaturaId
Write-Data "  prSerieId"    $prSerieId
Write-Data "  impostoId"    $impostoId

$qtd          = 2
$precoUnit    = 10000.00
$baseCalculo  = $qtd * $precoUnit
$taxaIva      = 15
$valorImposto = $baseCalculo * $taxaIva / 100

$faturaBody = @{
    tipoFaturaId       = $tipoFaturaId
    prSerieId          = $prSerieId
    clienteId          = $clienteId
    dtFaturacao        = (Get-Date -Format "yyyy-MM-dd")
    dtVencimentoFatura = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    codigoReferencia   = "REF-TEST-001"
    nota               = "Fatura de teste criada pelo seed-and-test.ps1"
    termCondicoes      = "Pagamento a 30 dias"
    items              = @(
        @{
            numLinha      = 1
            desig         = "Servicos de Consultoria em TI"
            descr         = "Consultoria e desenvolvimento de software"
            codigoArtigo  = "SVC-001"
            quantidade    = $qtd
            precoUnitario = $precoUnit
            prUnidadeId   = $prUnidadeId
            impostos      = @(
                @{
                    impostoId    = $impostoId
                    tipoCalculo  = "PERCENTAGEM"
                    taxa         = $taxaIva
                    baseCalculo  = $baseCalculo
                    valorImposto = $valorImposto
                    ordem        = 1
                }
            )
        }
    )
}

try {
    $fatura = Invoke-Api POST "api/v1/faturas-venda" $faturaBody
    $faturaId = $fatura.id
    Write-OK "Fatura de Venda criada com sucesso!"
    Write-Data "ID"             $fatura.id
    Write-Data "Codigo"         $fatura.codigo
    Write-Data "Estado"         $fatura.estado
    Write-Data "Dt. Faturacao"  $fatura.dtFaturacao
    Write-Data "Valor Iliquido" "$($fatura.valorIliquido) CVE"
    Write-Data "Valor Imposto"  "$($fatura.valorImposto) CVE  (IVA 15%)"
    Write-Data "VALOR TOTAL"    "$($fatura.valorFatura) CVE"
} catch {
    Write-Fail "Erro ao criar Fatura de Venda - $_"
}

# ── Confirmar Fatura ──────────────────────────────────────────────────
Write-Step "Confirmacao - PUT /api/v1/faturas-venda/$faturaId/confirmar..."
try {
    $confirmed = Invoke-Api PUT "api/v1/faturas-venda/$faturaId/confirmar"
    Write-OK "Fatura confirmada com sucesso!"
    Write-Data "Estado"          $confirmed.estado
    Write-Data "Dt. Confirmacao" $confirmed.dtConfirmacao
} catch {
    Write-Fail "Erro ao confirmar fatura - $_"
}

Write-Step "Reconfirmacao (deve falhar com 422)..."
try {
    Invoke-Api PUT "api/v1/faturas-venda/$faturaId/confirmar" | Out-Null
    Write-Host "     [WARN] Esperado erro 422 mas recebeu 200" -ForegroundColor Yellow
} catch {
    if ($_ -match "422") {
        Write-OK "Correto - 422 Unprocessable Entity (nao esta em RASCUNHO)"
    } else {
        Write-Host "     [WARN] Erro inesperado - $_" -ForegroundColor Yellow
    }
}

# ── Verification GET ──────────────────────────────────────────────────
Write-Step "Verification - GET /api/v1/faturas-venda/$faturaId..."
try {
    $check = Invoke-Api GET "api/v1/faturas-venda/$faturaId"
    Write-OK "Fatura retrouvee en base H2"
    Write-Data "codigo"     $check.codigo
    Write-Data "cliente"    $check.cliente.desig
    Write-Data "tipoFatura" $check.tipoFatura.desig
    Write-Data "Items"      $check.items.Count
    if ($check.items -and $check.items.Count -gt 0) {
        $i = $check.items[0]
        Write-Data "  Item[0] desig"        $i.desig
        Write-Data "  Item[0] qtd"          $i.quantidade
        Write-Data "  Item[0] precoUnitario" $i.precoUnitario
        Write-Data "  Item[0] valorBruto"   $i.valorBruto
        Write-Data "  Item[0] valorImposto" $i.valorImposto
        Write-Data "  Item[0] valorTotal"   $i.valorTotal
    }
} catch {
    Write-Host "     [WARN] Erreur GET verification - $_" -ForegroundColor Yellow
}

# ── Resume ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  =================================================" -ForegroundColor Green
Write-Host "  TERMINE - Toutes les etapes completees" -ForegroundColor Green
Write-Host "  =================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  IDs crees en base H2 :" -ForegroundColor White
Write-Host "    TipoFatura  id = $tipoFaturaId  (FT)" -ForegroundColor Gray
Write-Host "    Serie       id = $prSerieId  (FT-2025)" -ForegroundColor Gray
Write-Host "    Imposto     id = $impostoId  (IVA 15%)" -ForegroundColor Gray
Write-Host "    Cliente     id = $clienteId  (CLI-001)" -ForegroundColor Gray
Write-Host "    FaturaVenda id = $faturaId  ($($fatura.codigo))" -ForegroundColor Gray
Write-Host ""
Write-Host "  Calcul fatura :" -ForegroundColor White
Write-Host "    2 x 10000 CVE =  20000 CVE (base iliquida)" -ForegroundColor Gray
Write-Host "    IVA 15%       =   3000 CVE" -ForegroundColor Gray
Write-Host "    TOTAL         =  23000 CVE" -ForegroundColor Gray
Write-Host ""
Write-Host "  Actions suivantes :" -ForegroundColor White
Write-Host "    Confirmer : PUT $BaseUrl/api/v1/faturas-venda/$faturaId/confirmar" -ForegroundColor Gray
Write-Host "    H2 Console: $BaseUrl/h2-console  (JDBC: jdbc:h2:mem:efaturadb)" -ForegroundColor Gray
Write-Host ""
