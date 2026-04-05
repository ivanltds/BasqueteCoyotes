# ─────────────────────────────────────────────────────────────────
#  renomear-galeria.ps1
#  Renomeia todas as imagens de uma pasta para o padrão galeria-01.jpg
#
#  USO:
#    1. Coloque este script na pasta raiz do projeto (ou em qualquer lugar)
#    2. Abra o PowerShell nessa pasta
#    3. Execute:  .\renomear-galeria.ps1
#
#  PARÂMETROS OPCIONAIS:
#    -Pasta    Caminho da pasta com as fotos (padrão: .\public\images\gallery)
#    -Prefixo  Prefixo do nome final        (padrão: galeria)
#    -Simular  Mostra o que seria feito SEM renomear de verdade
#
#  EXEMPLOS:
#    .\renomear-galeria.ps1
#    .\renomear-galeria.ps1 -Simular
#    .\renomear-galeria.ps1 -Pasta "C:\Fotos\Baskferia" -Prefixo "baskferia"
#    .\renomear-galeria.ps1 -Pasta "C:\Fotos" -Prefixo "coyotes" -Simular
# ─────────────────────────────────────────────────────────────────

param(
    [string]$Pasta   = ".\public\images\gallery",
    [string]$Prefixo = "galeria",
    [switch]$Simular
)

# Extensões aceitas
$extensoes = @(".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif")

# ── Validação da pasta ──────────────────────────────────────────
if (-not (Test-Path $Pasta)) {
    Write-Host ""
    Write-Host "  ERRO: Pasta nao encontrada: $Pasta" -ForegroundColor Red
    Write-Host "  Use -Pasta para indicar o caminho correto." -ForegroundColor DarkGray
    Write-Host ""
    exit 1
}

# ── Busca arquivos de imagem ────────────────────────────────────
$arquivos = Get-ChildItem -Path $Pasta -File |
    Where-Object { $extensoes -contains $_.Extension.ToLower() } |
    Sort-Object Name

if ($arquivos.Count -eq 0) {
    Write-Host ""
    Write-Host "  Nenhuma imagem encontrada em: $Pasta" -ForegroundColor Yellow
    Write-Host "  Formatos aceitos: $($extensoes -join ', ')" -ForegroundColor DarkGray
    Write-Host ""
    exit 0
}

# ── Cabeçalho ───────────────────────────────────────────────────
Write-Host ""
Write-Host " COYOTES DO BASQUETEBOL — Renomeador de Galeria" -ForegroundColor Cyan
Write-Host " ─────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  Pasta  : $((Resolve-Path $Pasta).Path)" -ForegroundColor DarkGray
Write-Host "  Prefixo: $Prefixo" -ForegroundColor DarkGray
Write-Host "  Fotos  : $($arquivos.Count) encontradas" -ForegroundColor DarkGray
if ($Simular) {
    Write-Host "  MODO   : SIMULACAO (nenhum arquivo sera alterado)" -ForegroundColor Yellow
}
Write-Host " ─────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# ── Renomeação ──────────────────────────────────────────────────
$contador  = 1
$sucesso   = 0
$ignorados = 0

foreach ($arquivo in $arquivos) {
    # Mantém a extensão original em minúsculo (.JPG → .jpg)
    $ext      = $arquivo.Extension.ToLower()
    $novoNome = "$Prefixo-{0:D2}$ext" -f $contador
    $novoPath = Join-Path $Pasta $novoNome

    # Se já tem o nome certo, pula
    if ($arquivo.Name -eq $novoNome) {
        Write-Host "  [OK] $($arquivo.Name)" -ForegroundColor DarkGreen
        $ignorados++
        $contador++
        continue
    }

    # Exibe a operação
    Write-Host "  $($arquivo.Name.PadRight(40))" -NoNewline -ForegroundColor Gray
    Write-Host " → " -NoNewline -ForegroundColor DarkGray
    Write-Host "$novoNome" -ForegroundColor Green

    # Executa (ou simula)
    if (-not $Simular) {
        try {
            Rename-Item -Path $arquivo.FullName -NewName $novoNome -ErrorAction Stop
            $sucesso++
        } catch {
            Write-Host "    ERRO ao renomear: $_" -ForegroundColor Red
        }
    } else {
        $sucesso++
    }

    $contador++
}

# ── Resumo ──────────────────────────────────────────────────────
Write-Host ""
Write-Host " ─────────────────────────────────────────────" -ForegroundColor DarkGray
if ($Simular) {
    Write-Host "  SIMULACAO concluida: $sucesso arquivo(s) seriam renomeados, $ignorados ja estavam corretos." -ForegroundColor Yellow
    Write-Host "  Para aplicar de verdade, rode sem o -Simular." -ForegroundColor DarkGray
} else {
    Write-Host "  Concluido: $sucesso arquivo(s) renomeados, $ignorados ja estavam corretos." -ForegroundColor Cyan
}
Write-Host ""
