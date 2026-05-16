# Bulut Bilişim Final Projesi: Trivia Web Uygulaması

Bu proje, Node.js ile geliştirilmiş dinamik bir Trivia (Bilgi Yarışması) web uygulamasının Dockerize edilerek **Akamai (Linode) Kubernetes Engine (LKE)** üzerinde yüksek erişilebilir, ölçeklenebilir ve güvenli bir bulut mimarisiyle canlıya alınmasını kapsamaktadır.

Proje, modern bulut bilişim standartlarına (High Availability, Auto-scaling, Self-healing, Network Isolation, Persistent Storage) tam uyumlu olarak tasarlanmıştır.

## 👤 Proje Sahipleri
* **Ad, Soyad ve Numara:**
* Kerem Yağmur 22010310076
* Hüseyin Konak 22010310051
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
```

### 2. Kubernetes Kümesinin Bağlantısı
Akamai üzerinden 3 node'lu LKE kümesi oluşturulduktan sonra indirilen `Kubeconfig` dosyası PowerShell üzerinde tanımlanır:
```powershell
cd Desktop\Bulut-Bilisim-OrtakDepo-H-seyin
$env:KUBECONFIG="indirilen-kubeconfig-dosyasi.yaml"
```

### 3. Altyapının Yayına Alınması
Hazırlanan deklaratif manifest dosyası tek komutla kümeye uygulanır:
```powershell
kubectl apply -f k8s-deployment.yaml
```

### 4. Sistemin Doğrulanması
Podların durumu ve atanan dış IP adresi kontrol edilir:
```powershell
kubectl get pods
kubectl get services
```
`trivia-node-service` satırındaki **EXTERNAL-IP** adresi tarayıcıya yazılarak uygulamaya erişim sağlanır.

---

## 🔬 Sistemin Test Edilmesi (Kanıtlar)

* **Kendi Kendini İyileştirme (Self-Healing):** `kubectl delete pod <pod-adi>` komutu ile manuel olarak bir pod silindiğinde, Kubernetes anında yeni bir pod oluşturarak sistemi 3 replikaya tamamlar.
* **Kalıcı Depolama (Storage):** `kubectl describe pvc trivia-pvc` komutu ile diskin başarıyla `Bound` (bağlı) durumunda olduğu teyit edilebilir.

---

## 🧹 Maliyet Yönetimi ve Kapanış

Kullanım sonrasında gereksiz bütçe harcamasını engellemek için Akamai paneli üzerinden sırasıyla şu bileşenler tamamen silinmelidir:
1. **Kubernetes Clusters:** 3 sanal sunucunun kapatılması.
2. **Volumes:** PVC tarafından otomatik oluşturulan 1GB diskin silinmesi.
3. **NodeBalancers:** Trafik yönlendiricinin ve tahsis edilen dış IP'nin serbest bırakılması.
