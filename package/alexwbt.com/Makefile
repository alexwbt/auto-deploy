include .env

define update_runtime
	sudo chown -fR ${REMOTE_USER}:${REMOTE_USER} runtime
	git add .
	git diff-index --quiet HEAD || git commit -m "$@"
endef

certbot: nginx_http
	-docker-compose --env-file .env \
		run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ \
		-d {{ALEXWBT_DOMAIN}} -d www.{{ALEXWBT_DOMAIN}} -d mail.{{ALEXWBT_DOMAIN}} \
		--expand --non-interactive --agree-tos -m ${CERT_EMAIL}
	$(call update_runtime)

certbot_renew:
	-docker-compose --env-file .env run --rm certbot renew
	$(call update_runtime)

nginx_http:
	-docker-compose --env-file .env up -d nginx_http

nginx:
	-docker-compose --env-file .env up -d nginx

redis:
	-docker-compose --env-file .env up -d redis

emailengine:
	-docker-compose --env-file .env up -d emailengine
