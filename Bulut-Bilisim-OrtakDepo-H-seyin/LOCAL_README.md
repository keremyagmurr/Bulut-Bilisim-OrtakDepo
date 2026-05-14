# 🎮 Trivia Node: Kaptan'ın Seçimi

Gerçek zamanlı, sınıf içi takım quiz oyunu. Node.js + Socket.io tabanlı, Kubernetes simülasyonu.

---

## 🚀 HIZLI BAŞLANGIÇ (3 Adımda)

### 1. Node.js ile Doğrudan Çalıştır

```bash
# Projeyi klasöre al
cd trivia-node

# Bağımlılıkları yükle
npm install

# Sunucuyu başlat
node server.js
```

Tarayıcınızda **http://localhost:3000** adresini açın. Oyun hazır!

---

### 2. Docker ile Çalıştır

```bash
# Docker imajı oluştur
docker build -t trivia-node:latest .

# Çalıştır
docker run -p 3000:3000 trivia-node:latest

# VEYA docker-compose ile:
docker-compose up
```

---

### 3. Kubernetes (Minikube) ile Çalıştır

```bash
# Minikube'u başlat
minikube start

# Docker imajını Minikube'e yükle
minikube image load trivia-node:latest

# Deploy et
kubectl apply -f k8s-deployment.yaml

# Servisi aç
minikube service trivia-node-service

# Pod'ları izle
kubectl get pods -w
```

---

## 🎮 OYUN NASIL OYNANIR?

### Oyuncular (Mobil)
1. Hoca tahtaya IP adresini yazar (örn: `http://192.168.1.5:3000`)
2. Herkes telefonundan bu adrese girer
3. Adını yazar ve "Katıl" butonuna basar
4. Sunucu herkesi 4'erli (veya 3/2'li) takımlara otomatik böler
5. Her takımdan biri rastgele **Kaptan (Router/Ingress)** seçilir

### Oyun Akışı
```
Lobi → Takım Atama → [ Kategori Açıklanır → Kaptan Seçer → Oyuncu Yanıtlar → Sonuç ] → ...
```

1. **Kategori Anı**: Tüm ekranlar "C++ Programlama — Orta" gibi kategoriyi gösterir
2. **Kaptan Anı**: Sadece kaptanın telefona "Bu soruyu kime göndereyim?" seçeneği düşer
3. **Cevaplama**: Soru sadece seçilen kişinin ekranına gider. 30 saniye süre!
4. **Sonuç**: Doğruysa +10, yanlışsa -5 puan
5. Tüm takımlar sırayla oynar

### Puanlama
| Durum | Puan |
|-------|------|
| Doğru cevap | +10 |
| Yanlış cevap | -5 |
| Süre doldu | -5 |

---

## 📡 SINIFTA NASIL KULLANILIR?

### Aynı Wi-Fi'deyseniz (En Kolay)
```bash
# Bilgisayarınızın IP'sini bulun
ipconfig   # Windows
ifconfig   # Mac/Linux

# Sunucuyu başlatın
node server.js

# Tahtaya yazın: http://192.168.X.X:3000
# Herkes bu adrese telefonundan girer
```

### Bulut (GKE/AWS) Kullanıyorsanız
Kubernetes LoadBalancer size public IP verir. O IP'yi tahtaya yazın.

---

## 🗂️ PROJE YAPISI

```
trivia-node/
├── server.js            # Ana sunucu + oyun mantığı (Node.js + Socket.io)
├── public/
│   └── index.html       # Tek sayfalık oyun arayüzü (HTML/CSS/JS)
├── package.json         # Bağımlılıklar
├── Dockerfile           # Docker imajı
├── docker-compose.yml   # Docker Compose
└── k8s-deployment.yaml  # Kubernetes Deployment + Service + HPA
```

---

## 🏗️ TEKNİK MİMARİ (Sunum Analojisel)

```
[Telefon]  →  HTTP Request  →  [Ingress / Kaptan]  →  [Pod / Takım Üyesi]
[Oyuncu]       Soru geldi         Routing kararı          Cevap verir
```

| Oyun Kavramı | Kubernetes Kavramı |
|---|---|
| Takım | Cluster |
| Kaptan | Ingress (Yük Dengeleyici) |
| Takım Üyesi | Pod |
| Gelen Soru | HTTP Request |
| Kategori | URL Path / Route |
| Socket.io | WebSocket |

---

## ⚙️ SORU BANKASI

Mevcut kategoriler (30 soru):
- **C++ Programlama** (5 soru)
- **Algoritmalar** (4 soru)
- **Şampiyonlar Ligi Tarihi** (4 soru)
- **Popüler Makyaj Markaları** (4 soru)
- **2000'ler Türkçe Pop** (4 soru)
- **İşletim Sistemleri** (4 soru)
- **Genel Kültür** (4 soru)

### Yeni Soru Eklemek
`server.js` dosyasında `QUESTIONS` dizisine ekleyin:
```js
{ 
  category: "Kategori Adı", 
  difficulty: "Kolay",  // Kolay | Orta | Zor
  question: "Soru metni?", 
  options: ["A", "B", "C", "D"], 
  answer: 2  // doğru şık index (0-3)
}
```

---

## 🐳 KUBERNETES ŞOVLARI (Sunum İçin)

### Şov 1: Yük Testi
```bash
kubectl get pods -w   # Herkes oyuna girince HPA pod sayısını artırır
```

### Şov 2: Self-Healing (Kaos Testi)
```bash
kubectl delete pod <pod-adı>   # Pod sil — K8s anında yenisini açar!
kubectl get pods -w            # Bunu canlı göster
```

### Şov 3: Rolling Update
```bash
# index.html'de bir butonu kırmızıdan maviye çevir
docker build -t trivia-node:v2 .
kubectl set image deployment/trivia-node trivia-node=trivia-node:v2
kubectl rollout status deployment/trivia-node
# Oyun hiç durmadan güncellendi!
```

---

## 📦 BAĞIMLILIKLAR

| Paket | Sürüm | Açıklama |
|-------|-------|----------|
| express | ^4.18.2 | HTTP sunucusu |
| socket.io | ^4.7.2 | Gerçek zamanlı WebSocket |

Node.js 16+ gereklidir.
