# ClinicSay - Script de inicio para Windows
# Requiere Docker Desktop instalado y corriendo

Write-Host "[ClinicSay] Iniciando servicios..." -ForegroundColor Cyan

Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "[OK] Docker detectado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host "Instala Docker Desktop desde https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

try {
    docker info > $null 2>&1
    Write-Host "[OK] Docker Daemon esta corriendo" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker Daemon no esta corriendo" -ForegroundColor Red
    Write-Host "Inicia Docker Desktop y vuelve a ejecutar este script" -ForegroundColor Yellow
    exit 1
}

Write-Host "Construyendo e iniciando servicios (puede tardar unos minutos)..." -ForegroundColor Yellow
docker-compose up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "" 
    Write-Host "[ERROR] No se pudieron iniciar los servicios" -ForegroundColor Red
    Write-Host "Revisa los logs con: docker-compose logs" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[OK] Servicios iniciados correctamente" -ForegroundColor Green

Write-Host "Esperando que el backend este listo..." -ForegroundColor Yellow
$maxRetries = 30
$retryCount = 0
$backendReady = $false

while ($retryCount -lt $maxRetries) {
    Start-Sleep -Seconds 2
    $retryCount++
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        $backendReady = $true
        break
    } catch {
        Write-Host "  Intento $retryCount/$maxRetries..." -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host ">> Abriendo en el navegador:" -ForegroundColor Cyan
Write-Host "   http://localhost              (Frontend)" -ForegroundColor White
Write-Host "   http://localhost:3000/api/docs (Swagger)" -ForegroundColor White
Write-Host "   http://localhost:3000          (API)"     -ForegroundColor White

Start-Process "http://localhost"
Start-Sleep -Milliseconds 600
Start-Process "http://localhost:3000/api/docs"
Start-Sleep -Milliseconds 600
Start-Process "http://localhost:3000"

if (-not $backendReady) {
    Write-Host ""
    Write-Host "[!] El backend tardo mas de lo esperado." -ForegroundColor Yellow
    Write-Host "    Si las paginas no cargan, espera unos segundos y recarga." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Ver logs : docker-compose logs -f" -ForegroundColor Gray
Write-Host "Detener  : docker-compose down"    -ForegroundColor Gray
