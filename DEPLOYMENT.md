# SwiftMoney — Deployment SOP (Coolify + Hetzner + Cloudflare)

## Stack Deployment
- **Server**: Hetzner VPS
- **Platform**: Coolify (self-hosted PaaS)
- **DNS/CDN**: Cloudflare
- **Container**: Docker (PHP-FPM + Nginx + Supervisor)
- **DB**: SQLite (file-based, mounted volume)

---

## PERTAMA KALI — Setup Awal

### 1. Push ke GitHub
```bash
cd "SwiftApp Dev/swift-money"
git init
git add .
git commit -m "SwiftMoney v1.0 — Sprint 1-4 complete"
git remote add origin git@github.com:adamsalehuddin91/swift-money.git
git push -u origin main
```

### 2. Coolify — Add Resource
1. Dashboard Coolify → Project → Environment (Production)
2. **+ Add New Resource** → Private Repository
3. Pilih repo `adamsalehuddin91/swift-money`, branch `main`
4. Build Pack: **Docker** (auto-detect Dockerfile)

### 3. Coolify — Environment Variables
Set dalam Coolify dashboard:

```env
APP_NAME=SwiftMoney
APP_ENV=production
APP_KEY=base64:xxxxx          # Generate: php artisan key:generate --show
APP_DEBUG=false
APP_URL=https://money.swiftapps.my

DB_CONNECTION=sqlite
DB_DATABASE=/app/database/database.sqlite

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

### 4. Coolify — Storage (Persistent Volume)
**PENTING** — SQLite + receipts perlu persistent storage:

| Mount Path (Container) | Purpose |
|------------------------|---------|
| `/app/database` | SQLite database file |
| `/app/storage/app/public/receipts` | Receipt uploads |

Dalam Coolify: Settings → Storages → Add:
- `/app/database` → persistent volume
- `/app/storage/app/public/receipts` → persistent volume

### 5. Coolify — Domain
- Domain: `money.swiftapps.my`
- Port: `80`
- Enable HTTPS (Coolify auto-generate SSL via Let's Encrypt)

### 6. Cloudflare — DNS
1. DNS → Add Record:
   - Type: `A`
   - Name: `money`
   - Content: `[Hetzner IP]`
   - Proxy: ON (orange cloud)
2. SSL/TLS → Mode: **Full (Strict)**

### 7. Deploy
Klik **Deploy** dalam Coolify. First deploy akan:
- Build Docker image
- Run `composer install` + `npm run build`
- Cache config/routes/views
- Start PHP-FPM + Nginx + Scheduler

### 8. Post-Deploy — Migrate
Masuk terminal container (Coolify → Terminal):
```bash
php artisan migrate --force
php artisan db:seed --force    # First time only
```

---

## SETIAP KALI NAK DEPLOY (Routine)

### Quick Deploy Checklist
```
[ ] 1. Code siap + tested locally
[ ] 2. npm run build — CLEAN (no errors)
[ ] 3. git add + commit
[ ] 4. git push origin main
[ ] 5. Coolify auto-deploy (atau manual klik Deploy)
[ ] 6. Check site live
```

### Step-by-step:

**1. Test locally**
```bash
npm run build          # Frontend clean?
php artisan serve      # App jalan ok?
```

**2. Commit & push**
```bash
git add .
git commit -m "feat: description of changes"
git push origin main
```

**3. Deploy**
- Coolify **auto-deploy on push** (jika enabled)
- Atau manual: Coolify Dashboard → Deploy

**4. Post-deploy (jika ada migration)**
Coolify Terminal:
```bash
php artisan migrate --force
```

**5. Verify**
- Buka `https://money.swiftapps.my`
- Test login: abg@swiftmoney.my
- Test toggle bil, upload receipt
- Check PWA install prompt

---

## TROUBLESHOOTING

| Masalah | Fix |
|---------|-----|
| 502 Bad Gateway | Check Coolify logs — PHP-FPM crash? Memory issue? |
| CSS/JS broken | Clear: `php artisan cache:clear && php artisan view:clear` |
| SQLite locked | Restart container (single-writer issue) |
| Receipt upload fail | Check volume mount `/app/storage/app/public/receipts` |
| PWA not updating | Hard refresh / clear service worker |
| Scheduler not running | Check supervisor: `supervisorctl status` |

## ROLLBACK
Coolify keeps previous builds. Klik **Rollback** pada deployment history kalau ada issue.
