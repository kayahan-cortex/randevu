# Deployment Guide - Randevu

## Durum: Sunucu Kurulumu Bekliyor

CI/CD pipeline hazır, sunucuda ilk kurulum yapılması gerekiyor.

---

## Tamamlanan Adımlar

### 1. GitHub Actions Workflow (TAMAMLANDI)
- `.github/workflows/deploy.yml` oluşturuldu
- `main` branch'e push yapıldığında otomatik deploy tetiklenir
- `appleboy/ssh-action` kullanarak SSH ile sunucuya bağlanır

### 2. PM2 Ecosystem Config (TAMAMLANDI)
- `ecosystem.config.js` oluşturuldu
- Uygulama adı: `randevu`
- Port: 3000
- Max memory: 512M

### 3. GitHub Secret (TAMAMLANDI)
- `SSH_PRIVATE_KEY` secret'ı repo'ya eklendi
- `gh auth login` ile `KayahanKahriman` hesabıyla `workflow` scope dahil giriş yapıldı

### 4. Repo Klonlama (TAMAMLANDI)
- Sunucuda `/home/kayahan/randevu` dizinine repo klonlandı

---

## Kalan Adımlar (Sunucuda Yapılacak)

### 5. Sunucuya SSH ile bağlan
```bash
ssh kayahan@3.65.20.111
```

### 6. AWS Security Group Kontrolü
- EC2 konsolunda instance'ın Security Group'unu aç
- **Inbound Rules** → Port 22 (SSH) → `0.0.0.0/0` veya kendi IP'n açık olmalı
- GitHub Actions IP'leri için de açık olmalı (ya da `0.0.0.0/0`)

### 7. Sunucuda İlk Kurulum
```bash
cd /home/kayahan/randevu

# .env dosyası oluştur (DATABASE_URL vb.)
nano .env

# Bağımlılıkları yükle
npm ci

# Prisma client oluştur
npx prisma generate

# Veritabanı migration
npx prisma migrate deploy

# Projeyi build et
npm run build

# PM2 ile başlat
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Test Et
```bash
# PM2 durumu kontrol
pm2 status

# Uygulama çalışıyor mu?
curl http://localhost:3000
```

### 9. CI/CD Test
- Herhangi bir değişiklik yapıp `main`'e push et
- GitHub Actions'ta workflow'un başarıyla çalıştığını kontrol et:
  https://github.com/kayahan-cortex/randevu/actions

---

## Sunucu Bilgileri

| Bilgi | Değer |
|-------|-------|
| IP | 3.65.20.111 |
| Kullanıcı | kayahan |
| Proje Dizini | /home/kayahan/randevu |
| Node.js | v22.22.2 |
| npm | 10.9.7 |
| PM2 | 6.0.14 |
| Port | 3000 |

## CI/CD Akışı

```
git push origin main
  → GitHub Actions tetiklenir
    → SSH ile sunucuya bağlanır
      → git pull
      → npm ci
      → prisma generate
      → prisma migrate deploy
      → npm run build
      → pm2 restart randevu
```

## Sorun Giderme

### SSH bağlantı sorunu
- AWS Security Group'ta port 22 açık mı kontrol et
- `fail2ban` varsa: `sudo fail2ban-client unban --all`
- Çok fazla SSH bağlantısı açıldıysa sunucuyu bekle veya restart et

### GitHub Actions fail olursa
- `SSH_PRIVATE_KEY` secret'ının doğru eklendiğinden emin ol
- Sunucuda `.env` dosyasının mevcut olduğundan emin ol
- Actions loglarını kontrol et: https://github.com/kayahan-cortex/randevu/actions
