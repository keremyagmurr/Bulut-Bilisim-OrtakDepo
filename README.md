# Bulut Bilişim Final Projesi: Trivia Web Uygulaması

Bu proje, Node.js ile geliştirilmiş dinamik bir Trivia (Bilgi Yarışması) web uygulamasının Dockerize edilerek **Akamai (Linode) Kubernetes Engine (LKE)** üzerinde yüksek erişilebilir, ölçeklenebilir ve güvenli bir bulut mimarisiyle canlıya alınmasını kapsamaktadır.

Proje, modern bulut bilişim standartlarına (High Availability, Auto-scaling, Self-healing, Network Isolation, Persistent Storage) tam uyumlu olarak tasarlanmıştır.

## 👤 Proje Sahibi
* **Adı Soyadı:** Kerem Yağmur, Hüseyin Konak
* **Bölüm:** Bilgisayar Mühendisliği

---

## 🏗️ Sistem Mimarisi ve Kullanılan Teknolojiler

Projenin genel mimarisi, uygulamanın bulut ortamında orkestre edilmesine dayanmaktadır:

* **Uygulama Katmanı:** Node.js (Trivia web servisi)
* **Konteynerlaştırma:** Docker
* **İmaj Deposu (Registry):** Docker Hub (`keremyagmur/trivia-node`)
* **Bulut Sağlayıcı (IaaS):** Akamai / Linode Cloud
* **Orkestrasyon:** Yönetilen Kubernetes Kümesi (LKE) - 3 Aktif Node

---

## 📋 Proje Gereksinim Karşılaştırma Matrisi

Ödev yönergesinde belirtilen tüm zorunlu teknik kriterler projeye başarıyla entegre edilmiştir:

| Yönerge Maddesi | Projedeki Karşılığı | İlgili Dosya / Konfigürasyon |
| :--- | :--- | :--- |
| **Dockerization** | Uygulamanın tüm bağımlılıklarıyla taşınabilir bir Docker imajına dönüştürülmesi. | `Dockerfile`, `server.js` |
| **K8s Üzerinde Çalıştırma** | Akamai LKE üzerinde 3 adet node içeren kümeleme. | `kubectl get nodes` |
| **Deployment Yapılandırması** | Kesintisiz çalışma için 3 replikalı dağıtım stratejisi. | `k8s-deployment.yaml` (Deployment) |
| **LoadBalancer Hizmeti** | Dışarıdan gelen trafiği karşılayan genel IP ataması. | `k8s-deployment.yaml` (Service) |
| **Scaling (Ölçekleme & HPA)** | CPU yüküne göre pod sayısını otomatik 5'e kadar çıkaran sistem. | `k8s-deployment.yaml` (HPA) |
| **Persistent Volume (PVC)** | Podlar silinse dahi veri kalıcılığı sağlayan 1GB ayrılmış disk. | `k8s-deployment.yaml` (PVC) |
| **NetworkPolicy** | Sadece izin verilen portları (80/3000) trafiğe açan ağ güvenliği. | `k8s-deployment.yaml` (NetworkPolicy) |
| **Rolling Update** | Yeni sürüm yayına alınırken eski podların sırayla kapatılması. | `k8s-deployment.yaml` (RollingUpdate) |

---

## 🚀 Canlıya Alma ve Çalıştırma Kılavuzu

Projeyi test amacıyla sıfırdan ayağa kaldırmak için aşağıdaki adımları sırasıyla uygulayınız:

### 1. Docker İmajının Hazırlanması (Manuel CI/CD)
Proje dizininde imaj build edilerek uzak depoya gönderilir:
```bash
docker login
docker build -t keremyagmur/trivia-node:latest .
docker push keremyagmur/trivia-node:latest
