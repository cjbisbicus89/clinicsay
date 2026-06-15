# ClinicSay - Script de inicio para Windows
# Requiere Docker Desktop instalado y corriendo

Write-Host "[ClinicSay] Iniciando servicios..." -ForegroundColor Cyan

# Verificar que Docker está corriendo
Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker detectado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: Docker no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop desde https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar que Docker Daemon está corriendo
try {
    docker info > $null 2>&1
    Write-Host "✓ Docker Daemon está corriendo" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: Docker Daemon no está corriendo" -ForegroundColor Red
    Write-Host "Por favor inicia Docker Desktop y vuelve a ejecutar este script" -ForegroundColor Yellow
    exit 1
}

# Construir e iniciar los servicios
Write-Host "Construyendo e iniciando servicios (esto puede tardar unos minutos)..." -ForegroundColor Yellow
docker-compose up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n✗ Error al iniciar los servicios" -ForegroundColor Red
    Write-Host "Revisa los logs con: docker-compose logs" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✓ ¡Servicios iniciados correctamente!" -ForegroundColor Green

# Esperar a que el backend responda antes de abrir el navegador
Write-Host "Esperando que el backend esté listo..." -ForegroundColor Yellow
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

Write-Host "`n>> Abriendo en el navegador:" -ForegroundColor Cyan
Write-Host "  → http://localhost           (Frontend)" -ForegroundColor White
Write-Host "  → http://localhost:3000/api/docs  (Swagger)" -ForegroundColor White
Write-Host "  → http://localhost:3000           (API)" -ForegroundColor White

Start-Process "http://localhost"
Start-Sleep -Milliseconds 600
Start-Process "http://localhost:3000/api/docs"
Start-Sleep -Milliseconds 600
Start-Process "http://localhost:3000"

if (-not $backendReady) {
    Write-Host "`n[!] El backend tardo mas de lo esperado. Si las paginas no cargan, espera unos segundos y recarga." -ForegroundColor Yellow
}

Write-Host "`n[*] Ver logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host "[x] Detener:   docker-compose down" -ForegroundColor Gray
