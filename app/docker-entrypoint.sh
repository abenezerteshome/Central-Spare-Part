#!/bin/bash
set -e

# Render binds to a dynamic PORT environment variable (defaults to 80 if not set)
PORT="${PORT:-80}"
sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf
sed -i "s/:80/:$PORT/g" /etc/apache2/sites-available/000-default.conf

# Cache configuration, routes, and views for optimal performance
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Run database migrations automatically against Neon Postgres
php artisan migrate --force || true

# Seed the admin user (safe - uses firstOrCreate, won't duplicate)
php artisan db:seed --class=AdminUserSeeder --force || true

# Start Apache in foreground
exec apache2-foreground
