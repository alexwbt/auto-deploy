include .env

define update
	sudo chown -fR ${USER}:${USER} runtime
	git add .
	git diff-index --quiet HEAD || git commit -m "$@"
endef

certbot: nginx_http
	-docker-compose -f compose/infra-compose.yml --env-file .env \
		run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ \
		-d {{ALEXWBT_DOMAIN}} -d www.{{ALEXWBT_DOMAIN}} \
		--non-interactive --agree-tos -m ${CERT_EMAIL}
	$(call update)

certbot_renew:
	-docker-compose -f compose/infra-compose.yml --env-file .env run --rm certbot renew
	$(call update)

nginx_http:
	-docker-compose -f compose/infra-compose.yml --env-file .env up -d nginx_http
	$(call update)

nginx:
	-docker-compose -f compose/infra-compose.yml --env-file .env up -d nginx
	$(call update)
