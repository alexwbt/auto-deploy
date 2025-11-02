include .env

#
# docker
#
ps:
	docker ps --format 'table \{{.ID}}\t\{{.Names}}\t\{{.Status}}\t\{{.RunningFor}}\t\{{.Image}}'

pull:
	docker compose pull

up:
	docker compose up -d && docker restart nginx

down:
	docker compose down

#
# git
#
diff:
	git log --name-status HEAD^..HEAD
	git diff HEAD^ -w --ignore-space-at-eol

graph:
	git log --all --graph --pretty=format:"%h %C(green)%d %C(yellow)%aN %C(red)%ar %C(reset)%<(80,trunc)%s"

#
# certbot
#
certbot-init:
	docker compose \
		run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ \
		-d {{ALEXWBT_DOMAIN_NAME}} \
		--expand --non-interactive --agree-tos \
		-m ${CERTBOT_EMAIL}

certbot:
	docker compose run --rm certbot renew && docker restart nginx
