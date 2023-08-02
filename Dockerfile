FROM nginxinc/nginx-unprivileged

COPY --chown=nginx nginx_default.conf /etc/nginx/conf.d/default.conf
COPY ./dist /usr/share/nginx/html
