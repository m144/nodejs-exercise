FROM mysql:latest

ENV MYSQL_DATABASE=lytx \
    MYSQL_ROOT_PASSWORD=12345678

COPY ./lytx-dump.sql /docker-entrypoint-initdb.d/
COPY ./set-privileges.sql /docker-entrypoint-initdb.d/
