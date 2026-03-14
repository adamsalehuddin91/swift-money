FROM php:8.3-fpm-alpine AS base

# Install system deps + PHP extensions
RUN apk add --no-cache \
    nginx supervisor curl zip unzip git \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    oniguruma-dev libxml2-dev sqlite-dev \
    nodejs npm \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_sqlite pdo_mysql mbstring xml gd bcmath opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# ── App source first (so composer sees full autoload config) ──
COPY . .

# ── Dependencies ──
RUN composer install --optimize-autoloader --no-interaction
RUN npm ci --production=false

# ── Build frontend ──
RUN npm run build && rm -rf node_modules

# ── Laravel optimizations ──
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan storage:link

# ── Permissions ──
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache

# ── Nginx config ──
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# ── Supervisor config ──
COPY docker/supervisord.conf /etc/supervisord.conf

EXPOSE 80

# ── Entrypoint (fix volume permissions on startup) ──
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
