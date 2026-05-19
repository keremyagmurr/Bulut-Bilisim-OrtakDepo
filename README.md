# 🎮 ClusterQuiz — Gerçek Zamanlı Takım Bilgi Yarışması

> **BSM Bulut Bilişim Final Projesi — 2026**  
> Node.js + Socket.io + Docker + Kubernetes + GitHub Actions CI/CD  
> Akamai (Linode) Kubernetes Engine üzerinde deploy edilmiştir.

[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/r/huseyinkonak41/trivia-node)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=github-actions&logoColor=white)](https://github.com/keremyagmurr/Bulut-Bilisim-OrtakDepo/actions)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

---

## 👥 Ekip

| Öğrenci No | İsim | Rol | GitHub |
|------------|------|-----|--------|
| 22010310051 | **Hüseyin Konak** | Geliştirici & DevOps | [@huseyinkonak41](https://github.com/huseyinkonak41) |
| 22010310076 | **Kerem Yağmur** | Geliştirici & DevOps | [@keremyagmurr](https://github.com/keremyagmurr) |

**GitHub Repo:** [Bulut-Bilisim-OrtakDepo](https://github.com/keremyagmurr/Bulut-Bilisim-OrtakDepo)  
**Docker Hub:** [huseyinkonak41/trivia-node](https://hub.docker.com/r/huseyinkonak41/trivia-node)

---

## 📑 İçindekiler

1. [Proje Hakkında](#proje-hakkında)
2. [Uygulama Mimarisi](#uygulama-mimarisi)
3. [Kubernetes Mimarisi](#kubernetes-mimarisi)
4. [Sistem Mimarisi](#sistem-mimarisi)
5. [CI/CD Pipeline Akışı](#cicd-pipeline-akışı)
6. [Deployment, Service, PV/PVC ve NetworkPolicy](#deployment-service-pvpvc-ve-networkpolicy)
7. [Rolling Update, Rollback ve Ölçekleme](#rolling-update-rollback-ve-ölçekleme)
8. [Proje Yapısı](#proje-yapısı)
9. [Test ve Doğrulama](#test-ve-doğrulama)
10. [Kaynak Yönetimi](#kaynak-yönetimi)

---

<a id="proje-hakkında"></a>

## Proje Hakkında

**ClusterQuiz**, sınıf ortamında öğrencilerin telefonlarından katılarak takım halinde yarıştığı gerçek zamanlı bir bilgi yarışması oyunudur. Uygulama Docker ile containerize edilmiş ve Akamai (Linode) Kubernetes Engine üzerinde deploy edilmiştir.

**Temel Özellikler:**
- 🎮 Gerçek zamanlı oyun — Socket.io ile anlık iletişim
- 👥 Takım bazlı — Solo, İkili, Üçlü, Dörtlü modlar
- ♟️ Çoklu soru türü — Çoktan seçmeli, Doğru/Yanlış, Satranç, Fark Bul
- 📱 Mobil uyumlu — Telefon tarayıcısından erişim
- ☸️ Kubernetes — Otomatik ölçekleme, self-healing, rolling update
- 🔄 GitHub Actions CI/CD — Otomatik build & deploy

**Soru Bankası:** 68 soru, 11 farklı kategori (C++, Algoritmalar, Şampiyonlar Ligi, Satranç, Fark Bul vb.)

| Teknoloji | Sürüm | Rol |
|-----------|-------|-----|
| Node.js | 20 LTS | Runtime |
| Express.js | 4.18.x | HTTP sunucu |
| Socket.io | 4.7.x | WebSocket iletişimi |
| Docker | 29.x | Container |
| Kubernetes | 1.35 | Orkestrasyon |
| GitHub Actions | - | CI/CD Pipeline |

---

<a id="uygulama-mimarisi"></a>

## Uygulama Mimarisi

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
│                                 │  │  (Game Logic)│ │   │
│  ┌─────────────┐               │  └──────┬──────┘ │   │
│  │   Client     │ ────WS─────► │         │        │   │
│  │  (Telefon)   │               │  ┌──────▼──────┐ │   │
│  └─────────────┘               │  │ Soru Bankası │ │   │
│                                 │  │ (68 Soru +   │ │   │
│                                 │  │  PV/PVC)     │ │   │
│                                 │  └─────────────┘ │   │
│                                 └──────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

<a id="kubernetes-mimarisi"></a>

## Kubernetes Mimarisi

```
┌──────────────────────────────────────────────────────────────┐
│              AKAMAI LKE KUBERNETES CLUSTER                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                Namespace: trivia-node                   │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │              Service (LoadBalancer)               │  │  │
│  │  │          External IP: xxx.xxx.xxx.xxx             │  │  │
│  │  │              Port 80 → 3000                       │  │  │
│  │  └──────────────────────┬───────────────────────────┘  │  │
│  │                         │                               │  │
│  │              ┌──────────▼──────────┐                   │  │
│  │              │       Pod           │                   │  │
│  │              │  ClusterQuiz:v10    │                   │  │
│  │              │  Port: 3000         │                   │  │
│  │              └──────────┬──────────┘                   │  │
│  │                         │                               │  │
│  │              ┌──────────▼──────────┐                   │  │
│  │              │   PVC (10Gi)        │                   │  │
│  │              │   Block Storage     │                   │  │
│  │              └─────────────────────┘                   │  │
│  │                                                        │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────┐    │  │
│  │  │ ConfigMap  │  │NetworkPolicy │  │    HPA     │    │  │
│  │  │ PORT=3000  │  │ Deny All +   │  │ Min:1      │    │  │
│  │  │ ENV=prod   │  │ Allow :3000  │  │ Max:10     │    │  │
│  │  └────────────┘  └──────────────┘  └────────────┘    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| Namespace | `k8s/namespace.yaml` | Kaynakları izole eder |
| Deployment | `k8s/deployment.yaml` | RollingUpdate, health probes |
| Service | `k8s/service.yaml` | LoadBalancer, dış erişim |
| PVC | `k8s/pv-pvc.yaml` | 10Gi kalıcı depolama |
| NetworkPolicy | `k8s/networkpolicy.yaml` | Deny all + allow :3000 |
| HPA | `k8s/hpa.yaml` | CPU bazlı ölçekleme |
| ConfigMap | `k8s/configmap.yaml` | Ortam değişkenleri |

---

<a id="sistem-mimarisi"></a>

## Sistem Mimarisi

```
┌──────────────────────────────────────────────────────────┐
│                    SİSTEM MİMARİSİ                        │
│                                                          │
│  ┌──────────┐   git push   ┌──────────────┐             │
│  │Developer │ ────────────►│   GitHub     │             │
│  │   PC     │              │  Repository  │             │
│  └──────────┘              └──────┬───────┘             │
│                                   │ webhook             │
│                                   ▼                     │
│                            ┌──────────────┐             │
│                            │GitHub Actions│             │
│                            │   CI/CD      │             │
│                            └──────┬───────┘             │
│                                   │                     │
│                    ┌──────────────┼──────────────┐      │
│                    ▼              ▼              ▼      │
│              ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│              │  Build   │  │  Test    │  │  Push    │  │
│              │  Docker  │  │  Smoke   │  │ DockerHub│  │
│              └──────────┘  └──────────┘  └────┬─────┘  │
│                                                │        │
│                                         kubectl apply   │
│                                                │        │
│                                                ▼        │
│  ┌──────────┐  HTTP   ┌──────────┐  ┌────────────────┐ │
│  │ Oyuncular│ ──────► │ LoadBal. │──│  Akamai LKE    │ │
│  │(Telefon) │ ◄────── │          │◄─│  K8s Cluster   │ │
│  └──────────┘ WebSocket└──────────┘  └────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

<a id="cicd-pipeline-akışı"></a>

## CI/CD Pipeline Akışı (GitHub Actions)

```
Checkout ──► Install ──► Test ──► Docker Build ──► Docker Push ──► Deploy (K8s) ──► Verify
```

| Aşama | Açıklama | Komut |
|-------|----------|-------|
| Checkout | GitHub'dan kodu çeker | `git clone` |
| Install | Bağımlılıkları yükler | `npm ci` |
| Test | Sunucu kontrolü | `curl localhost:3000` |
| Docker Build | Image oluşturur | `docker build -t huseyinkonak41/trivia-node:v10 .` |
| Docker Push | DockerHub'a gönderir | `docker push huseyinkonak41/trivia-node:v10` |
| Deploy | K8s'e uygular | `kubectl apply -f k8s/` |
| Verify | Pod kontrolü | `kubectl rollout status` |

---

<a id="deployment-service-pvpvc-ve-networkpolicy"></a>

## Deployment, Service, PV/PVC ve NetworkPolicy

### Deployment (`k8s/deployment.yaml`)

```yaml
spec:
  replicas: 1
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1           # +1 fazla Pod açılabilir
      maxUnavailable: 0     # Güncelleme sırasında sıfır kesinti
  revisionHistoryLimit: 5   # Rollback için son 5 sürüm saklanır
```

- **Liveness Probe:** Pod yanıt vermezse otomatik yeniden başlatılır
- **Readiness Probe:** Pod hazır olana kadar trafik yönlendirilmez

### Service (`k8s/service.yaml`)

```yaml
spec:
  type: LoadBalancer
  ports:
    - port: 80              # Dışarıdan :80
      targetPort: 3000      # Container :3000
  sessionAffinity: ClientIP  # WebSocket için aynı Pod'a yönlendir
```

### PersistentVolumeClaim (`k8s/pv-pvc.yaml`)

```yaml
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: linode-block-storage-retain
  resources:
    requests:
      storage: 10Gi
```

### NetworkPolicy (`k8s/networkpolicy.yaml`)

| Kural | Açıklama |
|-------|----------|
| Default Deny | Tüm gelen trafik engellenir |
| Allow :3000 | Sadece uygulama portuna izin |
| Allow DNS | Kube-dns erişimi (port 53) |
| Allow Egress | Dış internet erişimi (443, 80) |

### HPA (`k8s/hpa.yaml`)

```yaml
spec:
  minReplicas: 1
  maxReplicas: 10
  metrics:
    - resource:
        name: cpu
        target:
          averageUtilization: 70
```

---

<a id="rolling-update-rollback-ve-ölçekleme"></a>

## Rolling Update, Rollback ve Ölçekleme

### Rolling Update
```bash
docker build -t huseyinkonak41/trivia-node:v10 .
docker push huseyinkonak41/trivia-node:v10
# Not: Windows PowerShell kullananlar tek satırda yazmalıdır:
kubectl set image deployment/trivia-node trivia-node=huseyinkonak41/trivia-node:v10 -n trivia-node
kubectl rollout status deployment/trivia-node -n trivia-node
```

### Rollback
```bash
kubectl rollout undo deployment/trivia-node -n trivia-node
kubectl rollout history deployment/trivia-node -n trivia-node
```

### Ölçekleme (Scaling)
```bash
kubectl scale deployment trivia-node --replicas=5 -n trivia-node
kubectl get hpa -n trivia-node
```

---

<a id="proje-yapısı"></a>

## Proje Yapısı

```
ClusterQuiz/
├── server.js                 # Ana sunucu + oyun mantığı (68 soru)
├── public/
│   └── index.html            # Oyun arayüzü (Indigo/Purple tema)
├── package.json              # Node.js bağımlılıkları
├── Dockerfile                # Docker image tanımı
├── .github/workflows/ci-cd.yml  # GitHub Actions CI/CD pipeline tanımı
├── k8s/                      # Kubernetes manifest dosyaları
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── pv-pvc.yaml
│   ├── networkpolicy.yaml
│   └── hpa.yaml
└── README.md
```

---

<a id="test-ve-doğrulama"></a>

## Test ve Doğrulama

Kubernetes özelliklerinin düzgün çalıştığını doğrulamak için aşağıdaki senaryolar uygulanabilir:

### Self-Healing Testi
Bir Pod silindiğinde Kubernetes'in otomatik olarak yeni bir Pod oluşturduğu gözlemlenir:
```bash
kubectl delete pod <pod-adı> -n trivia-node
kubectl get pods -n trivia-node -w
```

### Rolling Update Testi
Yeni bir image ile güncelleme yapıldığında, eski Pod'lar kademeli olarak yenileriyle değiştirilir:
```bash
# Not: Windows PowerShell kullananlar komutu tek satırda yazmalıdır:
kubectl set image deployment/trivia-node trivia-node=huseyinkonak41/trivia-node:v10 -n trivia-node
kubectl rollout status deployment/trivia-node -n trivia-node
```

### Rollback Testi
Güncelleme sonrası sorun oluşursa önceki sürüme geri dönülebilir:
```bash
kubectl rollout undo deployment/trivia-node -n trivia-node
```

### Scaling Testi
Pod sayısı manuel olarak artırılıp HPA davranışı gözlemlenir:
```bash
kubectl scale deployment trivia-node --replicas=5 -n trivia-node
kubectl get pods -n trivia-node -w
```

---

<a id="kaynak-yönetimi"></a>

## Kaynak Yönetimi

Proje kullanılmadığı zamanlarda gereksiz maliyet oluşmaması için bulut kaynakları [cloud.linode.com](https://cloud.linode.com) panelinden kapatılabilir:

- **Kubernetes** → Cluster → Delete Cluster
- **Volumes** → Kullanılmayan diskleri sil
- **NodeBalancers** → Kullanılmayan yönlendiricileri sil

Kaynak silme işlemi veri kaybına yol açmaz; kodlar GitHub'da, Docker image'ları DockerHub'da saklanmaya devam eder. İhtiyaç halinde aynı manifest dosyaları ile cluster tekrar kurulabilir.

---

## 📄 Lisans

Bu proje eğitim amaçlıdır. BSM Bulut Bilişim Final Projesi — 2026.
