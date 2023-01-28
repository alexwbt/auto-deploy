include .env

certbot:
	docker-compose -f compose/infra-compose.yml --env-file .env run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ -d alexwbt.com
	sudo chown -R ${USER}:${USER} runtime
	git add . && git commit -m "certbot"

certbot_renew:
	docker-compose -f compose/infra-compose.yml --env-file .env run --rm certbot renew
	sudo chown -R ${USER}:${USER} runtime
	git add . && git commit -m "certbot renew"

nginx_http:
	docker-compose -f compose/infra-compose.yml --env-file .env up -d nginx_http
	sudo chown -R ${USER}:${USER} runtime
	git add . && git commit -m "nginx_http"

nginx:
	docker-compose -f compose/infra-compose.yml --env-file .env up -d nginx
	sudo chown -R ${USER}:${USER} runtime
	git add . && git commit -m "nginx"
