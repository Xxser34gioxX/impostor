# Build y prepara para desplegar en Netlify/Pages
# Uso: .\build-pwa.ps1

Write-Host "🏗️  Construyendo PWA..." -ForegroundColor Cyan
npm install
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completado con éxito!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📂 Archivos listos en: ./dist/" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos para desplegar:" -ForegroundColor Yellow
    Write-Host "1️⃣  Opción Netlify: arrastra la carpeta 'dist' a https://app.netlify.com"
    Write-Host "2️⃣  Opción GitHub Pages: sube 'dist' a tu repo"
    Write-Host "3️⃣  Opción Cloudflare: conecta tu repo en https://pages.cloudflare.com"
    Write-Host ""
    Write-Host "Una vez desplegado, comparte la URL pública con tus amigos 🎉" -ForegroundColor Green
} else {
    Write-Host "❌ Error en la compilación" -ForegroundColor Red
    exit 1
}
