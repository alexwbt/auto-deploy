
certbot:
	docker-compose -f compose/infra-compose.yml --env-file .env up -d certbot

run_nginx:
	docker-compose -f compose/infra-compose.yml --env-file .env up -d nginx
