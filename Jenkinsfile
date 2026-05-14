// ============================================================
// Jenkinsfile — Trivia Node CI/CD Pipeline
// GitHub → Build → Test → Docker Push → K8s Deploy
// ============================================================

pipeline {
    agent any

    environment {
        // DockerHub credentials (Jenkins'te tanımlanmalı)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_IMAGE = 'DOCKERHUB_USER/trivia-node'
        K8S_NAMESPACE = 'trivia-node'
    }

    stages {
        // ── Aşama 1: Kaynak Kodu Çek ────────────────────────
        stage('Checkout') {
            steps {
                echo '📥 Kaynak kodu GitHub\'dan çekiliyor...'
                checkout scm
            }
        }

        // ── Aşama 2: Bağımlılıkları Yükle ──────────────────
        stage('Install Dependencies') {
            steps {
                echo '📦 npm bağımlılıkları yükleniyor...'
                sh 'npm ci --only=production'
            }
        }

        // ── Aşama 3: Test ───────────────────────────────────
        stage('Test') {
            steps {
                echo '🧪 Uygulama smoke testi yapılıyor...'
                sh '''
                    # Sunucuyu arka planda başlat
                    node server.js &
                    SERVER_PID=$!
                    
                    # Sunucunun hazır olmasını bekle
                    sleep 5
                    
                    # HTTP isteği gönder
                    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
                    
                    # Sunucuyu durdur
                    kill $SERVER_PID 2>/dev/null || true
                    
                    # Sonucu kontrol et
                    if [ "$STATUS" = "200" ]; then
                        echo "✅ Smoke test başarılı! (HTTP $STATUS)"
                    else
                        echo "❌ Smoke test başarısız! (HTTP $STATUS)"
                        exit 1
                    fi
                '''
            }
        }

        // ── Aşama 4: Docker Image Oluştur ───────────────────
        stage('Docker Build') {
            steps {
                echo '🐳 Docker image oluşturuluyor...'
                script {
                    def buildTag = "${env.BUILD_NUMBER}"
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${buildTag} .
                        docker tag ${DOCKER_IMAGE}:${buildTag} ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }

        // ── Aşama 5: DockerHub'a Gönder ─────────────────────
        stage('Docker Push') {
            steps {
                echo '📤 Docker image DockerHub\'a gönderiliyor...'
                script {
                    sh """
                        echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin
                        docker push ${DOCKER_IMAGE}:${env.BUILD_NUMBER}
                        docker push ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }

        // ── Aşama 6: Kubernetes'e Deploy Et ─────────────────
        stage('Deploy to Kubernetes') {
            steps {
                echo '☸️ Kubernetes cluster\'a deploy ediliyor...'
                script {
                    sh """
                        # Namespace oluştur (yoksa)
                        kubectl apply -f k8s/namespace.yaml
                        
                        # ConfigMap uygula
                        kubectl apply -f k8s/configmap.yaml
                        
                        # PersistentVolumeClaim uygula
                        kubectl apply -f k8s/pv-pvc.yaml
                        
                        # NetworkPolicy uygula
                        kubectl apply -f k8s/networkpolicy.yaml
                        
                        # Deployment uygula (yeni image ile)
                        kubectl set image deployment/trivia-node \
                            trivia-node=${DOCKER_IMAGE}:${env.BUILD_NUMBER} \
                            -n ${K8S_NAMESPACE} 2>/dev/null || \
                            kubectl apply -f k8s/deployment.yaml
                        
                        # Service uygula
                        kubectl apply -f k8s/service.yaml
                        
                        # HPA uygula
                        kubectl apply -f k8s/hpa.yaml
                    """
                }
            }
        }

        // ── Aşama 7: Deployment Doğrulama ───────────────────
        stage('Verify Deployment') {
            steps {
                echo '✅ Deployment doğrulanıyor...'
                script {
                    sh """
                        # Rolling update tamamlanmasını bekle
                        kubectl rollout status deployment/trivia-node \
                            -n ${K8S_NAMESPACE} --timeout=120s
                        
                        # Pod durumlarını göster
                        echo "=== Pod Durumları ==="
                        kubectl get pods -n ${K8S_NAMESPACE}
                        
                        # Service durumunu göster
                        echo "=== Service Durumu ==="
                        kubectl get svc -n ${K8S_NAMESPACE}
                        
                        # External IP göster
                        echo "=== External IP ==="
                        kubectl get svc trivia-node-service -n ${K8S_NAMESPACE} \
                            -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
                        echo ""
                    """
                }
            }
        }
    }

    post {
        success {
            echo '''
            ╔══════════════════════════════════════════╗
            ║  ✅ CI/CD Pipeline Başarıyla Tamamlandı! ║
            ║  🎮 Trivia Node çalışıyor!               ║
            ╚══════════════════════════════════════════╝
            '''
        }
        failure {
            echo '''
            ╔══════════════════════════════════════════╗
            ║  ❌ Pipeline Başarısız!                   ║
            ║  Logları kontrol edin.                    ║
            ╚══════════════════════════════════════════╝
            '''
        }
        always {
            // Docker login oturumunu kapat
            sh 'docker logout 2>/dev/null || true'
        }
    }
}
