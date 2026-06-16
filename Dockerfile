FROM php:8.3-fpm-bookworm AS base

# Install system deps + PHP extensions via apt (pre-compiled, no source compile)
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx supervisor curl zip unzip git \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libonig-dev libxml2-dev libsqlite3-dev \
    nodejs npm \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_sqlite pdo_mysql mbstring xml gd bcmath opcache pcntl posix sockets \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# App source
COPY . .

# PHP dependencies
RUN composer install --optimize-autoloader --no-interaction --no-dev

# Frontend build-time vars — Vite bakes these into the bundle (runtime env is too late).
# Pass via Coolify "Build Variables". Empty defaults keep features dormant + safe.
ARG VITE_VAPID_PUBLIC_KEY=""
ARG VITE_REVERB_APP_KEY=""
ARG VITE_REVERB_HOST=""
ARG VITE_REVERB_PORT="443"
ARG VITE_REVERB_SCHEME="https"
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY \
    VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY \
    VITE_REVERB_HOST=$VITE_REVERB_HOST \
    VITE_REVERB_PORT=$VITE_REVERB_PORT \
    VITE_REVERB_SCHEME=$VITE_REVERB_SCHEME

# Node dependencies + frontend build
RUN npm ci --production=false \
    && npm run build \
    && rm -rf node_modules

# Permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache

# Nginx — remove default site, install ours
RUN rm -f /etc/nginx/sites-enabled/default
COPY docker/nginx.conf /etc/nginx/sites-enabled/swiftmoney.conf

# Supervisor config
COPY docker/supervisord.conf /etc/supervisord.conf

# Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 8080

CMD ["/entrypoint.sh"]
