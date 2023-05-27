include .env

ps:
	docker ps --format 'table \{{.ID}}\t\{{.Names}}\t\{{.Status}}\t\{{.RunningFor}}\t\{{.Image}}'

certbot:
	docker-compose \
		run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ \
		-d {{ALEXWBT_DOMAIN}} -d www.{{ALEXWBT_DOMAIN}} -d mail.{{ALEXWBT_DOMAIN}} -d api.{{ALEXWBT_DOMAIN}} \
		--expand --non-interactive --agree-tos -m ${CERT_EMAIL}

certbot-renew:
	docker-compose run --rm certbot renew
