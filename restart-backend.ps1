# Script para reiniciar el backend limpiamente
# Asegura que el pool de conexiones se recree con la nueva configuración useUTC

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  REINICIO LIMPIO DEL BACKEND - FIX UTC" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Detener todos los procesos Node.js
Write-Host "[1/4] Deteniendo procesos Node.js existentes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "  ✓ $($nodeProcesses.Count) proceso(s) Node.js detenido(s)" -ForegroundColor Green
} else {
    Write-Host "  ℹ No hay procesos Node.js corriendo" -ForegroundColor Gray
}

# 2. Esperar a que terminen completamente
Write-Host "[2/4] Esperando a que terminen..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "  ✓ Procesos terminados" -ForegroundColor Green

# 3. Navegar a la carpeta del backend
Write-Host "[3/4] Navegando a la carpeta del backend..." -ForegroundColor Yellow
$backendPath = "C:\Proyectos\CARO_ASOCIADOS\JURIS_SEARCH\jurissearch-api-caro"
if (Test-Path $backendPath) {
    Set-Location $backendPath
    Write-Host "  ✓ En: $backendPath" -ForegroundColor Green
} else {
    Write-Host "  ✗ ERROR: No se encontró la carpeta del backend" -ForegroundColor Red
    exit 1
}

# 4. Iniciar el backend
Write-Host "[4/4] Iniciando backend con configuración UTC..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  BACKEND INICIANDO..." -ForegroundColor Cyan
Write-Host "  Verifica que veas:" -ForegroundColor Gray
Write-Host "    [DB] Config useUTC: true" -ForegroundColor Gray
Write-Host "    [DB] ✓ Pool configurado con useUTC=true" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

npm run start:dev
