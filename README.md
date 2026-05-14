# 🎮 Trivia Node: Kaptan'ın Seçimi

> **Gerçek zamanlı, sınıf içi takım quiz oyunu**  
> Node.js + Socket.io + Docker + Kubernetes + Jenkins CI/CD  
> Akamai (Linode) Kubernetes Engine üzerinde deploy edilmiştir.

[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?logo=jenkins&logoColor=white)](https://www.jenkins.io/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

---

## 📑 İçindekiler

1. [Proje Hakkında](#-proje-hakkında)
2. [Uygulama Mimarisi](#-uygulama-mimarisi)
3. [Kubernetes Mimarisi](#-kubernetes-mimarisi)
4. [Sistem Mimarisi](#-sistem-mimarisi)
5. [CI/CD Pipeline Akışı](#-cicd-pipeline-akışı)
6. [Deployment, Service, PV/PVC, NetworkPolicy](#-kubernetes-bileşenleri)
7. [Rolling Update, Rollback ve Ölçekleme](#-rolling-update-rollback-ve-ölçekleme)
8. [Hızlı Başlangıç](#-hızlı-başlangıç)
9. [Proje Yapısı](#-proje-yapısı)
10. [Soru Bankası](#-soru-bankası)
11. [Sunum Şovları](#-sunum-şovları)
12. [Kapatma Rehberi](#-kapatma-rehberi)

---

## 🎯 Proje Hakkında

**Trivia Node: Kaptan'ın Seçimi**, sınıf ortamında öğrencilerin telefonlarından katılarak takım halinde yarıştığı gerçek zamanlı bir quiz oyunudur.

### Temel Özellikler
- 🎮 **Gerçek zamanlı oyun** — Socket.io ile anlık iletişim
- 👥 **Takım bazlı** — Solo, İkili, Üçlü, Dörtlü modlar
- 🧑‍✈️ **Kaptan sistemi** — Her takımdan bir kaptan soru yönlendirir
- ♟️ **Çoklu soru türü** — Çoktan seçmeli, Doğru/Yanlış, Satranç, Fark Bul
- 📱 **Mobil uyumlu** — Telefon tarayıcısından erişim
- ☸️ **Kubernetes** — Otomatik ölçekleme, self-healing, rolling update
- 🔄 **CI/CD** — Jenkins pipeline ile otomatik build & deploy

---

## 🏗️ Uygulama Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                   UYGULAMA MİMARİSİ                     │
│                                                         │
│  ┌─────────────┐    HTTP/WS     ┌──────────────────┐   │
│  │   Client     │ ────────────► │   Express.js     │   │
│  │  (Tarayıcı)  │ ◄──────────── │   HTTP Server    │   │
│  │  index.html  │   Socket.io   │                  │   │
│  └─────────────┘               │  ┌─────────────┐ │   │
│                                 │  │  Socket.io   │ │   │
│  ┌─────────────┐               │  │  Server      │ │   │
│  │   Client     │ ────WS─────► │  └──────┬──────┘ │   │
│  │  (Telefon)   │               │         │        │   │
│  └─────────────┘               │  ┌──────▼──────┐ │   │
│                                 │  │  Oyun Motoru │ │   │
│  ┌─────────────┐               │  │  (Game Logic)│ │   │
│  │   Client     │ ────WS─────► │  └──────┬──────┘ │   │
│  │  (Telefon)   │               │         │        │   │
│  └─────────────┘               │  ┌──────▼──────┐ │   │
│                                 │  │ Soru Bankası │ │   │
│                                 │  │ (In-Memory + │ │   │
│                                 │  │  PV/PVC)     │ │   │
│                                 │  └─────────────┘ │   │
│                                 └──────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Kullanılan Teknolojiler

| Teknoloji | Sürüm | Rol |
|-----------|-------|-----|
| **Node.js** | 20 LTS | Runtime |
| **Express.js** | 4.18.x | HTTP sunucu, statik dosya servisi |
| **Socket.io** | 4.7.x | Gerçek zamanlı WebSocket iletişimi |
| **Docker** | 29.x | Container |
| **Kubernetes** | 1.31 | Orkestrasyon |
| **Jenkins** | LTS | CI/CD Pipeline |

---

## ☸️ Kubernetes Mimarisi

```
┌──────────────────────────────────────────────────────────────┐
│              AKAMAI LKE KUBERNETES CLUSTER                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                  Namespace: trivia-node                 │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │              Service (LoadBalancer)               │  │  │
│  │  │          External IP: xxx.xxx.xxx.xxx             │  │  │
│  │  │              Port 80 → 3000                       │  │  │
│  │  │           SessionAffinity: ClientIP               │  │  │
│  │  └──────────────┬───────────┬───────────┬───────────┘  │  │
│  │                 │           │           │               │  │
│  │         ┌───────▼──┐ ┌─────▼────┐ ┌────▼─────┐       │  │
│  │         │  Pod 1   │ │  Pod 2   │ │  Pod 3   │       │  │
│  │         │ trivia-  │ │ trivia-  │ │ trivia-  │       │  │
│  │         │ node:v1  │ │ node:v1  │ │ node:v1  │       │  │
│  │         │ :3000    │ │ :3000    │ │ :3000    │       │  │
│  │         └────┬─────┘ └────┬─────┘ └────┬─────┘       │  │
│  │              │            │            │               │  │
│  │         ┌────▼────────────▼────────────▼────┐         │  │
│  │         │    PersistentVolumeClaim (10Gi)    │         │  │
│  │         │    Linode Block Storage             │         │  │
│  │         └───────────────────────────────────┘         │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │  ConfigMap   │  │NetworkPolicy │  │    HPA     │  │  │
│  │  │  PORT=3000   │  │ Deny All +   │  │ Min:2      │  │  │
│  │  │  ENV=prod    │  │ Allow :3000  │  │ Max:10     │  │  │
│  │  └──────────────┘  └──────────────┘  │ CPU>70%    │  │  │
│  │                                       └────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Node 1  │  │  Node 2  │  │  Node 3  │  (Linode 2GB)   │
│  └──────────┘  └──────────┘  └──────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

### Kubernetes Bileşenleri

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| **Namespace** | `k8s/namespace.yaml` | Tüm kaynakları `trivia-node` namespace altında izole eder |
| **Deployment** | `k8s/deployment.yaml` | 3 replica, RollingUpdate, health probes |
| **Service** | `k8s/service.yaml` | LoadBalancer tipi, dış dünyaya açar |
| **PVC** | `k8s/pv-pvc.yaml` | 10Gi Linode Block Storage, kalıcı veri |
| **NetworkPolicy** | `k8s/networkpolicy.yaml` | Default deny + allow port 3000 |
| **HPA** | `k8s/hpa.yaml` | CPU/Memory bazlı otomatik ölçekleme |
| **ConfigMap** | `k8s/configmap.yaml` | Ortam değişkenleri dışsallaştırma |

---

## 🌐 Sistem Mimarisi

```
┌──────────────────────────────────────────────────────────────────┐
│                      SİSTEM MİMARİSİ                             │
│                                                                  │
│  ┌──────────┐     git push      ┌──────────────┐                │
│  │Developer │ ─────────────────► │   GitHub     │                │
│  │   PC     │                    │  Repository  │                │
│  └──────────┘                    └──────┬───────┘                │
│                                         │ webhook                │
│                                         ▼                        │
│                                  ┌──────────────┐                │
│                                  │   Jenkins    │                │
│                                  │   CI/CD      │                │
│                                  └──────┬───────┘                │
│                                         │                        │
│                           ┌─────────────┼─────────────┐          │
│                           │             │             │          │
│                           ▼             ▼             ▼          │
│                     ┌──────────┐  ┌──────────┐ ┌──────────┐     │
│                     │  Build   │  │   Test   │ │  Push    │     │
│                     │  Docker  │  │  Smoke   │ │ DockerHub│     │
│                     │  Image   │  │  Test    │ │          │     │
│                     └──────────┘  └──────────┘ └────┬─────┘     │
│                                                      │           │
│                                                      ▼           │
│                                               ┌──────────────┐  │
│                                               │  DockerHub   │  │
│                                               │  Registry    │  │
│                                               └──────┬───────┘  │
│                                                      │           │
│                                                kubectl apply     │
│                                                      │           │
│                                                      ▼           │
│                                         ┌────────────────────┐  │
│                                         │   Akamai LKE       │  │
│                                         │   Kubernetes       │  │
│                                         │   Cluster          │  │
│                                         │                    │  │
│  ┌──────────┐   HTTP    ┌──────────┐   │  ┌──┐ ┌──┐ ┌──┐  │  │
│  │ Oyuncular│ ────────► │NodeBalan.│ ──►│  │P1│ │P2│ │P3│  │  │
│  │(Telefon) │ ◄──────── │(LoadBal.)│ ◄──│  └──┘ └──┘ └──┘  │  │
│  └──────────┘  WebSocket└──────────┘   │                    │  │
│                                         └────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 CI/CD Pipeline Akışı

Jenkins pipeline 7 aşamadan oluşur:

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 1.       │   │ 2.       │   │ 3.       │   │ 4.       │
│ Checkout │──►│ Install  │──►│  Test    │──►│ Docker   │
│ (GitHub) │   │ (npm ci) │   │ (Smoke)  │   │  Build   │
└──────────┘   └──────────┘   └──────────┘   └────┬─────┘
                                                    │
┌──────────┐   ┌──────────┐   ┌──────────┐        │
│ 7.       │   │ 6.       │   │ 5.       │        │
│ Verify   │◄──│ Deploy   │◄──│ Docker   │◄───────┘
│          │   │ (K8s)    │   │  Push    │
└──────────┘   └──────────┘   └──────────┘
```

| Aşama | Açıklama | Komut |
|-------|----------|-------|
| **Checkout** | GitHub'dan kodu çeker | `git clone` |
| **Install** | Node.js bağımlılıklarını yükler | `npm ci` |
| **Test** | Sunucu başlıyor mu kontrolü | `curl localhost:3000` |
| **Docker Build** | Container image oluşturur | `docker build -t trivia-node:v1 .` |
| **Docker Push** | Image'ı DockerHub'a gönderir | `docker push` |
| **Deploy** | K8s manifestlerini uygular | `kubectl apply -f k8s/` |
| **Verify** | Pod'ların çalıştığını doğrular | `kubectl rollout status` |

### Jenkinsfile Konumu
```
trivia-node/Jenkinsfile
```

---

## 📦 Kubernetes Bileşenleri

### 1. Deployment (`k8s/deployment.yaml`)

Uygulamayı 3 replica olarak çalıştırır. RollingUpdate stratejisi ile kesintisiz güncelleme sağlar.

```yaml
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1           # +1 fazla Pod açılabilir
      maxUnavailable: 0     # Güncelleme sırasında sıfır kesinti
  revisionHistoryLimit: 5   # Rollback için son 5 sürüm saklanır
```

**Health Probes:**
- **Liveness Probe:** Pod yanıt vermezse otomatik yeniden başlatılır (Self-Healing)
- **Readiness Probe:** Pod hazır olana kadar trafik yönlendirilmez

---

### 2. Service (`k8s/service.yaml`)

LoadBalancer tipi Service, Linode NodeBalancer oluşturarak dış dünyadan erişim sağlar.

```yaml
spec:
  type: LoadBalancer
  ports:
    - port: 80              # Dışarıdan :80
      targetPort: 3000      # Container :3000
  sessionAffinity: ClientIP  # WebSocket için aynı Pod'a yönlendir
```

---

### 3. PersistentVolume / PVC (`k8s/pv-pvc.yaml`)

Linode Block Storage kullanarak kalıcı veri depolama sağlar. Pod yeniden başlatıldığında veriler korunur.

```yaml
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: linode-block-storage-retain
  resources:
    requests:
      storage: 10Gi
```

**Kullanım Amacı:** Soru bankası verileri ve oyun loglarının kalıcı depolanması.

---

### 4. NetworkPolicy (`k8s/networkpolicy.yaml`)

Güvenlik katmanı olarak ağ trafiğini kısıtlar.

| Kural | Açıklama |
|-------|----------|
| **Default Deny** | Tüm gelen trafik varsayılan olarak engellenir |
| **Allow :3000** | Sadece 3000 portuna HTTP/WebSocket trafiğine izin |
| **Allow DNS** | Kube-dns erişimi (port 53 UDP/TCP) |
| **Allow HTTPS Egress** | Dış internet erişimi (443, 80 portları) |

---

### 5. HPA (`k8s/hpa.yaml`)

Otomatik yatay ölçeklendirme.

```yaml
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          averageUtilization: 70    # CPU %70 aşarsa scale up
```

---

## 🔄 Rolling Update, Rollback ve Ölçekleme

### Rolling Update (Kesintisiz Güncelleme)

```bash
# 1. Kod değişikliği yapın (örn: server.js'de bir renk değiştirin)

# 2. Yeni Docker image oluşturun
docker build -t DOCKERHUB_USER/trivia-node:v2 .
docker push DOCKERHUB_USER/trivia-node:v2

# 3. Kubernetes'te güncelleme başlatın
kubectl set image deployment/trivia-node \
    trivia-node=DOCKERHUB_USER/trivia-node:v2 \
    -n trivia-node

# 4. Güncelleme durumunu izleyin
kubectl rollout status deployment/trivia-node -n trivia-node

# 5. Pod'ların durumunu canlı izleyin
kubectl get pods -n trivia-node -w
```

> **Önemli:** `maxUnavailable: 0` ayarı sayesinde güncelleme sırasında **hiçbir Pod kapatılmaz**. Önce yeni Pod açılır, hazır olduktan sonra eski Pod kapatılır. Kullanıcılar hiçbir kesinti yaşamaz.

### Rollback (Geri Alma)

```bash
# Son sürüme geri dön
kubectl rollout undo deployment/trivia-node -n trivia-node

# Belirli bir sürüme geri dön
kubectl rollout undo deployment/trivia-node --to-revision=2 -n trivia-node

# Deployment geçmişini görüntüle
kubectl rollout history deployment/trivia-node -n trivia-node
```

### Ölçekleme (Scaling)

```bash
# Manuel ölçekleme — 5 Pod'a çıkar
kubectl scale deployment trivia-node --replicas=5 -n trivia-node

# HPA durumunu kontrol et
kubectl get hpa -n trivia-node

# Pod sayısını canlı izle
kubectl get pods -n trivia-node -w
```

---

## 🚀 Hızlı Başlangıç

### Yöntem 1: Node.js ile Yerel Çalıştırma

```bash
cd trivia-node
npm install
node server.js
# → http://localhost:3000
```

### Yöntem 2: Docker ile Çalıştırma

```bash
docker build -t trivia-node:latest .
docker run -p 3000:3000 trivia-node:latest
# → http://localhost:3000
```

### Yöntem 3: Docker Compose ile

```bash
docker-compose up -d
# → http://localhost:3000
```

### Yöntem 4: Kubernetes (Akamai LKE) ile

```bash
# 1. Kubeconfig'i ayarla
export KUBECONFIG=~/trivia-kubeconfig.yaml

# 2. Tüm manifesleri uygula
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/pv-pvc.yaml
kubectl apply -f k8s/networkpolicy.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# 3. External IP'yi al
kubectl get svc trivia-node-service -n trivia-node
# → http://<EXTERNAL-IP>
```

---

## 🗂️ Proje Yapısı

```
trivia-node/
├── server.js                    # Ana sunucu + oyun mantığı
├── public/
│   └── index.html               # Tek sayfalık oyun arayüzü
├── package.json                 # Node.js bağımlılıkları
├── Dockerfile                   # Multi-stage Docker image
├── .dockerignore                # Docker build hariç tutma
├── docker-compose.yml           # Docker Compose yapılandırması
├── Jenkinsfile                  # CI/CD pipeline tanımı
├── k8s/                         # Kubernetes manifest dosyaları
│   ├── namespace.yaml           #   └─ Namespace tanımı
│   ├── configmap.yaml           #   └─ Ortam değişkenleri
│   ├── deployment.yaml          #   └─ Deployment (3 replica)
│   ├── service.yaml             #   └─ LoadBalancer Service
│   ├── pv-pvc.yaml              #   └─ Kalıcı depolama
│   ├── networkpolicy.yaml       #   └─ Ağ güvenlik politikası
│   └── hpa.yaml                 #   └─ Otomatik ölçekleme
├── jenkins/
│   └── docker-compose.jenkins.yml  # Jenkins yerel çalıştırma
├── k8s-deployment.yaml          # (Eski) Tek dosya K8s yapılandırması
└── README.md                    # Bu dosya
```

---

## 🎮 Oyun Nasıl Oynanır?

### Oyuncular (Mobil)
1. Hoca tahtaya IP adresini yazar (örn: `http://<EXTERNAL-IP>`)
2. Herkes telefonundan bu adrese girer
3. Adını yazar ve "Katıl" butonuna basar
4. Sunucu herkesi takımlara otomatik böler
5. Her takımdan biri rastgele **Kaptan** seçilir

### Oyun Akışı
```
Lobi → Takım Atama → [ Kategori → Kaptan Seçer → Oyuncu Yanıtlar → Sonuç ] → ...
```

### Puanlama

| Durum | Puan |
|-------|------|
| Doğru cevap | +10 |
| Yanlış cevap | -5 |
| Süre doldu | -5 |

---

## ⚙️ Soru Bankası

**50+ soru**, 10 farklı kategori:

| Kategori | Soru Tipi |
|----------|-----------|
| C++ Programlama | Multi + Doğru/Yanlış |
| Algoritmalar | Multi + Doğru/Yanlış |
| Şampiyonlar Ligi | Multi + Doğru/Yanlış |
| Makyaj & Güzellik | Multi + Doğru/Yanlış |
| Türkçe Pop | Multi + Doğru/Yanlış |
| İşletim Sistemleri | Multi + Doğru/Yanlış |
| Genel Kültür | Multi + Doğru/Yanlış |
| Bilim & Teknoloji | Multi + Doğru/Yanlış |
| Bulut Bilişim | Multi + Doğru/Yanlış |
| Satranç Bulmacaları | FEN tabanlı |
| Fark Bul | Emoji grid |

### Yeni Soru Eklemek
```js
{ 
  category: "Kategori Adı", 
  difficulty: "Kolay",  // Kolay | Orta | Orta Üstü | Zor
  type: "multi",         // multi | truefalse | chess | spotdiff
  question: "Soru metni?", 
  options: ["A", "B", "C", "D"], 
  answer: 2              // Doğru şık index (0-3)
}
```

---

## 🎪 Sunum Şovları

### Şov 1: Self-Healing (Kaos Testi)
```bash
# Pod'u sil — Kubernetes anında yenisini oluşturur!
kubectl delete pod <pod-adı> -n trivia-node
kubectl get pods -n trivia-node -w
```

### Şov 2: Rolling Update
```bash
# Canlı güncelleme — Oyun hiç durmaz!
kubectl set image deployment/trivia-node \
    trivia-node=DOCKERHUB_USER/trivia-node:v2 -n trivia-node
kubectl rollout status deployment/trivia-node -n trivia-node
```

### Şov 3: Rollback
```bash
# Güncelleme geri alınır
kubectl rollout undo deployment/trivia-node -n trivia-node
```

### Şov 4: Scaling
```bash
# Pod sayısını artır
kubectl scale deployment trivia-node --replicas=5 -n trivia-node
kubectl get pods -n trivia-node -w
```

---

## 📦 Bağımlılıklar

| Paket | Sürüm | Açıklama |
|-------|-------|----------|
| express | ^4.18.2 | HTTP sunucusu |
| socket.io | ^4.7.2 | Gerçek zamanlı WebSocket |

**Node.js 16+** gereklidir.

---

## ⚠️ KAPATMA REHBERİ

> **⚠️ ÖNEMLİ: Sunumdan sonra Akamai LKE cluster'ını silmeyi UNUTMAYIN!**
> Aksi halde aylık ~$36 ücret kesilmeye devam eder.

### Cluster Silme Adımları:
1. [cloud.linode.com](https://cloud.linode.com) adresine gidin
2. Sol menüden **Kubernetes** seçin
3. Cluster'ınızı seçin → **Delete Cluster** butonuna basın
4. **Volumes** bölümünden kullanılmayan Block Storage'ları silin
5. **NodeBalancers** bölümünden oluşturulan NodeBalancer'ı silin

### Maliyet Kontrolü:
```bash
# Cluster kaynaklarını kontrol edin
kubectl get all -n trivia-node

# Tüm kaynakları silmek için (cluster silmeden):
kubectl delete namespace trivia-node
```

---

## 👥 Ekip

| İsim | Rol |
|------|-----|
| Hüseyin Konak | Geliştirici |

---

## 📄 Lisans

Bu proje eğitim amaçlıdır. BSM Final Projesi 2026.
