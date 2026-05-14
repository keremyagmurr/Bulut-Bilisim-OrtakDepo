# ============================================================
# Trivia Node: Kaptan'ın Seçimi — Production Dockerfile
# Multi-stage build | Non-root user | Health check
# ============================================================

# ── Aşama 1: Bağımlılık Kurulumu ────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Sadece package dosyalarını kopyala (cache optimizasyonu)
COPY package*.json ./
RUN npm ci --only=production

# ── Aşama 2: Production Image ───────────────────────────────
FROM node:20-alpine

# Güvenlik: non-root kullanıcı oluştur
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Builder'dan sadece node_modules'ü al
COPY --from=builder /app/node_modules ./node_modules

# Uygulama dosyalarını kopyala
COPY package*.json ./
COPY server.js ./
COPY public/ ./public/

# Soru bankası dosyasını kopyala (varsa)
COPY ornek_sorular*.json ./

# Veri klasörü (PersistentVolume mount noktası)
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

# Sahipliği ayarla
RUN chown -R appuser:appgroup /app

# Non-root kullanıcıya geç
USER appuser

# Port
EXPOSE 3000

# Ortam değişkenleri
ENV NODE_ENV=production
ENV PORT=3000

# Health check — Kubernetes liveness probe'a ek güvence
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Uygulamayı başlat
CMD ["node", "server.js"]
