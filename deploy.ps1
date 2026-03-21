$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Deploy AvaliaAI - VPS Crescentia" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

$VPS_IP = "178.156.172.18"
$VPS_USER = "root"

# 1. Build
Write-Host ""
Write-Host "1. Fazendo build da imagem Docker..." -ForegroundColor Yellow

docker build -t avaliaai:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no build!" -ForegroundColor Red
    exit 1
}

# 2. Salvar tar
Write-Host ""
Write-Host "2. Salvando imagem em arquivo tar..." -ForegroundColor Yellow

docker save avaliaai:latest -o avaliaai.tar

if (-not (Test-Path "avaliaai.tar")) {
    Write-Host "Erro ao criar avaliaai.tar!" -ForegroundColor Red
    exit 1
}

# 3. Enviar arquivos para VPS
Write-Host ""
Write-Host "3. Enviando arquivos para VPS..." -ForegroundColor Yellow

Write-Host "==> Enviando avaliaai.tar (pode demorar)..."
scp .\avaliaai.tar "${VPS_USER}@${VPS_IP}:/tmp/"

Write-Host "==> Enviando docker-compose.yml..."
scp .\docker-compose.yml "${VPS_USER}@${VPS_IP}:/root/"

# 4. Deploy na VPS
Write-Host ""
Write-Host "4. Executando deploy na VPS..." -ForegroundColor Yellow

$deployScript = @"
echo '==> Carregando imagem Docker...'
docker load < /tmp/avaliaai.tar

echo '==> Criando estrutura de diretorios...'
mkdir -p /root/avaliaai
mv /root/docker-compose.yml /root/avaliaai/ 2>/dev/null || true

echo '==> Criando arquivo .env...'
cat > /root/avaliaai/.env << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://vgawovbxbvtbyrcwdrto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYXdvdmJ4YnZ0YnlyY3dkcnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMDE2NzksImV4cCI6MjA2Mzc3NzY3OX0.ct3WAmmLjzN8VG1TdOuqOAufr0k5bgnrUiY_fSBXRyU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYXdvdmJ4YnZ0YnlyY3dkcnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODIwMTY3OSwiZXhwIjoyMDYzNzc3Njc5fQ.Vr6ABMs8umeoSB-AbujELL-SAhyNF26m1vhFn7s0yvw
NEXTAUTH_SECRET=avaliaai-production-secret-2026
NEXTAUTH_URL=https://avaliaai.crescentiagroup.com.br
ADMIN_EMAIL=pedro@crescentiagroup.com.br
ADMIN_PASSWORD=fazendao2024
ENVEOF

echo '==> Fazendo deploy via Docker Stack...'
cd /root/avaliaai
docker stack deploy -c docker-compose.yml avaliaai

echo '==> Limpando arquivo temporario...'
rm /tmp/avaliaai.tar

echo ''
echo 'Deploy concluido na VPS!'
echo ''
docker service ls | grep avaliaai
"@

ssh "${VPS_USER}@${VPS_IP}" $deployScript

# 5. Limpeza local
Write-Host ""
Write-Host "5. Limpando arquivos locais..." -ForegroundColor Yellow
Remove-Item avaliaai.tar -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "DEPLOY CONCLUIDO!" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse: https://avaliaai.crescentiagroup.com.br" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ver logs:" -ForegroundColor Yellow
Write-Host "  ssh root@178.156.172.18" -ForegroundColor Gray
Write-Host "  docker service logs -f avaliaai_avaliaai" -ForegroundColor Gray
