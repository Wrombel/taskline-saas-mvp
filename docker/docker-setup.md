# Docker setup

## ENV

MONGO_URI=mongodb://localhost:27017/mydb?replicaSet=rs0
REDIS_URL=redis://localhost:6379

## Start

docker compose -f docker/docker-compose.yml up -d

## Reset

docker compose -f docker/docker-compose.yml down -v

## checking replica set

docker exec -it mongodb_dev mongosh
rs.status() // expected => "PRIMARY"
