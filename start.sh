#!/bin/bash

# ClinicSay - Script de inicio para Linux/macOS
# Requiere Docker instalado y corriendo

set -e

echo "🏥 ClinicSay - Iniciando servicios..."

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "✗ Error: Docker no está instalado"
    echo "Por favor instala Docker desde https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✓ Docker detectado: $(docker --version)"

# Verificar que Docker Daemon está corriendo
if ! docker info &> /dev/null; then
    echo "✗ Error: Docker Daemon no está corriendo"
    echo "Por favor inicia Docker y vuelve a ejecutar este script"
    exit 1
fi

echo "✓ Docker Daemon está corriendo"

# Construir e iniciar los servicios
echo "Construyendo e iniciando servicios (esto puede tardar unos minutos)..."
docker-compose up --build -d

if [ $? -ne 0 ]; then
    echo ""
    echo "✗ Error al iniciar los servicios"
    echo "Revisa los logs con: docker-compose logs"
    exit 1
fi

echo ""
echo "✓ ¡Servicios iniciados correctamente!"

# Esperar a que el backend responda antes de abrir el navegador
echo "Esperando que el backend esté listo..."
max_retries=30
retry_count=0
backend_ready=false

while [ $retry_count -lt $max_retries ]; do
    sleep 2
    retry_count=$((retry_count + 1))
    if curl -s --max-time 2 http://localhost:3000 > /dev/null 2>&1; then
        backend_ready=true
        break
    fi
    echo "  Intento $retry_count/$max_retries..."
done

echo ""
echo "🌐 Abriendo en el navegador:"
echo "  → http://localhost             (Frontend)"
echo "  → http://localhost:3000/api/docs   (Swagger)"
echo "  → http://localhost:3000            (API)"

# Detectar el comando correcto según el SO
if command -v open &> /dev/null; then
    open "http://localhost"
    sleep 0.6
    open "http://localhost:3000/api/docs"
    sleep 0.6
    open "http://localhost:3000"
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost"
    sleep 0.6
    xdg-open "http://localhost:3000/api/docs"
    sleep 0.6
    xdg-open "http://localhost:3000"
fi

if [ "$backend_ready" = false ]; then
    echo ""
    echo "⚠ El backend tardó más de lo esperado. Si las páginas no cargan, esperá unos segundos y recargá."
fi

echo ""
echo "📊 Ver logs: docker-compose logs -f"
echo "🛑 Detener:   docker-compose down"
