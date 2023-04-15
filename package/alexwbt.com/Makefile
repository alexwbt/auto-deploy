include .env

certbot:
	docker-compose \
		run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ \
		-d {{ALEXWBT_DOMAIN}} -d www.{{ALEXWBT_DOMAIN}} -d mail.{{ALEXWBT_DOMAIN}} \
		--expand --non-interactive --agree-tos -m ${CERT_EMAIL}

certbot-renew:
	docker-compose run --rm certbot renew
