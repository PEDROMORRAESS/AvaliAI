#!/bin/bash
set -e

VPS_USER="root"
VPS_HOST="178.156.172.18"
IMAGE_NAME="avaliaai"
IMAGE_TAG="latest"
TAR_FILE="/tmp/${IMAGE_NAME}.tar"
STACK_NAME="avaliaai"
COMPOSE_FILE="docker-compose.yml"

echo "==> Build da imagem Docker..."
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

echo "==> Exportando imagem para tar..."
docker save ${IMAGE_NAME}:${IMAGE_TAG} -o ${TAR_FILE}

echo "==> Enviando imagem para VPS (${VPS_HOST})..."
scp ${TAR_FILE} ${VPS_USER}@${VPS_HOST}:/tmp/

echo "==> Carregando imagem na VPS..."
ssh ${VPS_USER}@${VPS_HOST} "docker load -i /tmp/${IMAGE_NAME}.tar && rm /tmp/${IMAGE_NAME}.tar"

echo "==> Enviando docker-compose.yml..."
scp ${COMPOSE_FILE} ${VPS_USER}@${VPS_HOST}:/root/${STACK_NAME}/

echo "==> Fazendo deploy no Swarm..."
ssh ${VPS_USER}@${VPS_HOST} "cd /root/${STACK_NAME} && docker stack deploy -c ${COMPOSE_FILE} ${STACK_NAME} --with-registry-auth"

echo "==> Limpando tar local..."
rm -f ${TAR_FILE}

echo "==> Deploy concluido!"
echo "    URL: https://avaliaai.crescentiagroup.com.br"
echo ""
echo "Para ver os logs:"
echo "    ssh ${VPS_USER}@${VPS_HOST} 'docker service logs ${STACK_NAME}_${IMAGE_NAME} -f'"
