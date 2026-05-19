const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// ─── ZORLUK → SÜRE (saniye) ──────────────────────────────────────────────────
const TIMERS = { 'Kolay': 15, 'Orta': 25, 'Orta Üstü': 35, 'Zor': 45 };

// ─── SORU BANKASI ────────────────────────────────────────────────────────────
// type: 'multi' (4 şık) | 'truefalse' (Doğru/Yanlış)
const QUESTIONS = [
  // ─── C++ Programlama ───
  { category: "C++ Programlama", difficulty: "Kolay", type: "multi", question: "C++'da bir değişkeni sabit yapmak için hangi anahtar kelime kullanılır?", options: ["static", "const", "final", "readonly"], answer: 1 },
  { category: "C++ Programlama", difficulty: "Orta", type: "multi", question: "C++'da 'virtual' anahtar kelimesi ne için kullanılır?", options: ["Bellek yönetimi", "Polimorfizm için", "Şablon oluşturmak için", "İstisna yakalamak için"], answer: 1 },
  { category: "C++ Programlama", difficulty: "Zor", type: "multi", question: "C++'da 'Rule of Three' hangi üç özel fonksiyonu kapsar?", options: ["Constructor, Destructor, Copy Constructor", "Destructor, Copy Constructor, Copy Assignment", "Constructor, Copy Constructor, Move Constructor", "Destructor, Move, Move Assignment"], answer: 1 },
  { category: "C++ Programlama", difficulty: "Kolay", type: "truefalse", question: "C++'da 'new' operatörü dinamik bellek ayırır.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "C++ Programlama", difficulty: "Orta Üstü", type: "multi", question: "C++'da smart pointer'lardan hangisi paylaşımlı sahiplik sağlar?", options: ["unique_ptr", "shared_ptr", "weak_ptr", "auto_ptr"], answer: 1 },
  { category: "C++ Programlama", difficulty: "Kolay", type: "truefalse", question: "STL'deki 'stack' veri yapısı FIFO prensibini kullanır.", options: ["Doğru", "Yanlış"], answer: 1 },

  // ─── Algoritmalar ───
  { category: "Algoritmalar", difficulty: "Kolay", type: "multi", question: "En hızlı sıralama algoritmasının ortalama karmaşıklığı nedir?", options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], answer: 1 },
  { category: "Algoritmalar", difficulty: "Orta", type: "multi", question: "BST'de arama en kötü durum karmaşıklığı nedir?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 2 },
  { category: "Algoritmalar", difficulty: "Zor", type: "multi", question: "Dijkstra algoritması hangi problem için kullanılır?", options: ["En kısa yol bulma", "Maksimum akış", "Minimum spanning tree", "Graf renklendirme"], answer: 0 },
  { category: "Algoritmalar", difficulty: "Kolay", type: "truefalse", question: "Bubble Sort'un zaman karmaşıklığı O(n²)'dir.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "Algoritmalar", difficulty: "Orta Üstü", type: "multi", question: "Hangi veri yapısı Dijkstra'da öncelik kuyruğu olarak kullanılır?", options: ["Stack", "Queue", "Min-Heap", "Hash Table"], answer: 2 },

  // ─── Şampiyonlar Ligi ───
  { category: "Şampiyonlar Ligi", difficulty: "Kolay", type: "multi", question: "Şampiyonlar Ligi'ni en çok kazanan kulüp hangisidir?", options: ["Barcelona", "Bayern Münih", "Real Madrid", "Liverpool"], answer: 2 },
  { category: "Şampiyonlar Ligi", difficulty: "Orta", type: "multi", question: "2005 İstanbul finalinde Liverpool kaç golle geri dönüş yaptı?", options: ["1", "2", "3", "4"], answer: 2 },
  { category: "Şampiyonlar Ligi", difficulty: "Kolay", type: "truefalse", question: "Cristiano Ronaldo, Şampiyonlar Ligi tarihinin en golcü oyuncusudur.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "Şampiyonlar Ligi", difficulty: "Kolay", type: "truefalse", question: "UEFA Şampiyonlar Ligi formatı 1992 yılında değişti.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "Şampiyonlar Ligi", difficulty: "Orta Üstü", type: "multi", question: "Hangi takım art arda 3 ŞL kazanmıştır (2016-2018)?", options: ["Barcelona", "Bayern Münih", "Real Madrid", "Juventus"], answer: 2 },

  // ─── Makyaj & Güzellik ───
  { category: "Makyaj & Güzellik", difficulty: "Kolay", type: "multi", question: "Charlotte Tilbury'nin en ünlü fondöten serisi hangisidir?", options: ["Airbrush", "Flawless Filter", "Hollywood Flawless", "Skin Illusion"], answer: 2 },
  { category: "Makyaj & Güzellik", difficulty: "Kolay", type: "truefalse", question: "MAC Cosmetics Kanada'da kurulmuştur.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "Makyaj & Güzellik", difficulty: "Orta", type: "multi", question: "Fenty Beauty'yi kuran sanatçı kimdir?", options: ["Beyoncé", "Rihanna", "Kim Kardashian", "Kylie Jenner"], answer: 1 },
  { category: "Makyaj & Güzellik", difficulty: "Kolay", type: "truefalse", question: "NARS'ın en ünlü allık rengi 'Orgasm' adını taşır.", options: ["Doğru", "Yanlış"], answer: 0 },

  // ─── Türkçe Pop ───
  { category: "Türkçe Pop", difficulty: "Kolay", type: "multi", question: "Tarkan'ın uluslararası hit şarkısı hangisidir?", options: ["Hepsi Yalan", "Şımarık (Kiss Kiss)", "Dudu", "Adını Kalbime Yazdım"], answer: 1 },
  { category: "Türkçe Pop", difficulty: "Orta", type: "multi", question: "Sezen Aksu'nun 'Hüp' albümü hangi yıl çıktı?", options: ["1998", "2000", "2003", "2006"], answer: 1 },
  { category: "Türkçe Pop", difficulty: "Kolay", type: "truefalse", question: "Ajda Pekkan'ın sahne lakabı 'Süperstar'dır.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "Türkçe Pop", difficulty: "Orta Üstü", type: "multi", question: "Sertab Erener Eurovision'u hangi yıl kazandı?", options: ["2001", "2003", "2005", "2007"], answer: 1 },

  // ─── İşletim Sistemleri ───
  { category: "İşletim Sistemleri", difficulty: "Kolay", type: "multi", question: "Linux'ta dosya izinlerini değiştiren komut nedir?", options: ["chown", "chmod", "chgrp", "chperm"], answer: 1 },
  { category: "İşletim Sistemleri", difficulty: "Orta", type: "multi", question: "Deadlock koşullarından biri hangisi DEĞİLDİR?", options: ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"], answer: 2 },
  { category: "İşletim Sistemleri", difficulty: "Kolay", type: "truefalse", question: "UNIX'te fork() ebeveyne PID, çocuğa 0 döndürür.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "İşletim Sistemleri", difficulty: "Kolay", type: "truefalse", question: "RAM'in açılımı 'Random Access Memory' dir.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "İşletim Sistemleri", difficulty: "Orta Üstü", type: "multi", question: "Hangi scheduling algoritması 'convoy effect' sorununa yol açar?", options: ["SJF", "FCFS", "Round Robin", "Priority"], answer: 1 },

  // ─── Genel Kültür ───
  { category: "Genel Kültür", difficulty: "Kolay", type: "truefalse", question: "Dünyanın en büyük okyanusu Pasifik Okyanusu'dur.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "Genel Kültür", difficulty: "Kolay", type: "truefalse", question: "Türkiye'nin başkenti İstanbul'dur.", options: ["Doğru", "Yanlış"], answer: 1 },
  { category: "Genel Kültür", difficulty: "Orta", type: "multi", question: "Leonardo da Vinci hangi yüzyılda yaşamıştır?", options: ["13. yy", "14. yy", "15-16. yy", "17. yy"], answer: 2 },
  { category: "Genel Kültür", difficulty: "Kolay", type: "truefalse", question: "Güneş sistemindeki en büyük gezegen Jüpiter'dir.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "Genel Kültür", difficulty: "Zor", type: "multi", question: "Periyodik tabloda 'Au' hangi elementin simgesidir?", options: ["Gümüş", "Altın", "Alüminyum", "Argon"], answer: 1 },

  // ─── Bilim & Teknoloji ───
  { category: "Bilim & Teknoloji", difficulty: "Kolay", type: "multi", question: "HTTP'nin açılımı nedir?", options: ["HyperText Transfer Protocol", "High Tech Transfer Protocol", "HyperText Transmission Process", "High Transfer Text Protocol"], answer: 0 },
  { category: "Bilim & Teknoloji", difficulty: "Orta", type: "multi", question: "İlk web tarayıcı hangisidir?", options: ["Mosaic", "Netscape", "WorldWideWeb", "Internet Explorer"], answer: 2 },
  { category: "Bilim & Teknoloji", difficulty: "Orta Üstü", type: "multi", question: "TCP/IP modelinde kaç katman vardır?", options: ["3", "4", "5", "7"], answer: 1 },
  { category: "Bilim & Teknoloji", difficulty: "Kolay", type: "truefalse", question: "Turing Testi, Alan Turing tarafından önerilmiştir.", options: ["Doğru", "Yanlış"], answer: 0 },

  // ─── ☁️ BULUT BİLİŞİM (YENİ!) ───
  { category: "Bulut Bilişim", difficulty: "Kolay", type: "truefalse", question: "Docker, bir konteyner teknolojisidir.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "Bulut Bilişim", difficulty: "Kolay", type: "multi", question: "Kubernetes'in kısa adı nedir?", options: ["K7s", "K8s", "K9s", "K6s"], answer: 1 },
  { category: "Bulut Bilişim", difficulty: "Orta", type: "multi", question: "Kubernetes'te otomatik yatay ölçeklendirme yapan bileşen hangisidir?", options: ["Ingress", "HPA", "ConfigMap", "DaemonSet"], answer: 1 },
  { category: "Bulut Bilişim", difficulty: "Kolay", type: "truefalse", question: "Dockerfile, bir Docker imajının nasıl oluşturulacağını tanımlar.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "Bulut Bilişim", difficulty: "Orta", type: "multi", question: "Hangi bulut modeli, altyapıyı servis olarak sunar?", options: ["SaaS", "PaaS", "IaaS", "FaaS"], answer: 2 },
  { category: "Bulut Bilişim", difficulty: "Zor", type: "multi", question: "Kubernetes'te Pod'lar arası iletişim için hangi ağ modeli kullanılır?", options: ["Bridge", "Host", "Overlay (CNI)", "NAT"], answer: 2 },
  { category: "Bulut Bilişim", difficulty: "Kolay", type: "truefalse", question: "AWS, Amazon'un bulut bilişim platformudur.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "Bulut Bilişim", difficulty: "Orta Üstü", type: "multi", question: "Docker Compose ne için kullanılır?", options: ["Tek konteyner çalıştırma", "Çoklu konteyner orkestrasyon", "İmaj optimize etme", "Ağ güvenliği"], answer: 1 },
  { category: "Bulut Bilişim", difficulty: "Kolay", type: "multi", question: "'docker ps' komutu ne gösterir?", options: ["Tüm imajlar", "Çalışan konteynerler", "Ağ ayarları", "Disk kullanımı"], answer: 1 },
  { category: "Bulut Bilişim", difficulty: "Orta", type: "multi", question: "Kubernetes'te dışarıdan gelen HTTP trafiğini yönlendiren kaynak hangisidir?", options: ["Service", "Ingress", "ConfigMap", "Volume"], answer: 1 },
  { category: "Bulut Bilişim", difficulty: "Zor", type: "multi", question: "Bir Pod çökerse Kubernetes ne yapar?", options: ["Hiçbir şey", "Tüm cluster'ı durdurur", "Otomatik yeniden başlatır (Self-Healing)", "Kullanıcıya mail atar"], answer: 2 },
  { category: "Bulut Bilişim", difficulty: "Kolay", type: "truefalse", question: "Mikroservis mimarisinde her servis bağımsız olarak deploy edilebilir.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "Bulut Bilişim", difficulty: "Orta", type: "multi", question: "Load Balancer'ın görevi nedir?", options: ["Veriyi şifrelemek", "Trafiği sunucular arasında dağıtmak", "DNS çözümlemek", "Log tutmak"], answer: 1 },
  { category: "Bulut Bilişim", difficulty: "Kolay", type: "truefalse", question: "Google Cloud Platform'un kısa adı GCP'dir.", options: ["Doğru", "Yanlış"], answer: 0 },
  { category: "Bulut Bilişim", difficulty: "Orta Üstü", type: "multi", question: "Kubernetes'te kalıcı veri depolamak için ne kullanılır?", options: ["ConfigMap", "Secret", "PersistentVolume", "ReplicaSet"], answer: 2 },
  { category: "Bulut Bilişim", difficulty: "Kolay", type: "truefalse", question: "Redis bir ilişkisel veritabanıdır.", options: ["Doğru", "Yanlış"], answer: 1 },
  { category: "Bulut Bilişim", difficulty: "Orta", type: "multi", question: "CI/CD ne anlama gelir?", options: ["Code Integration / Code Delivery", "Continuous Integration / Continuous Delivery", "Container Init / Container Deploy", "Cloud Instance / Cloud Data"], answer: 1 },
  { category: "Bulut Bilişim", difficulty: "Zor", type: "multi", question: "Monolitik ile Mikroservis arasındaki temel fark nedir?", options: ["Dil farkı", "Bağımsız deploy ve ölçeklendirme", "Veritabanı türü", "Sunucu markası"], answer: 1 },

  // ─── ♟️ SATRANÇ BULMACALARI ───
  { category: "Satranç", difficulty: "Kolay", type: "chess",
    question: "Beyaz oynar. 1 hamlede mat! En iyi hamle nedir?",
    fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    options: ["Re7 (Açmaz)", "Rg1 (Tehdit)", "Re8# (Mat!)", "Rf1 (Savunma)"], answer: 2 },
  { category: "Satranç", difficulty: "Orta", type: "chess",
    question: "Beyaz oynar. En iyi hamle hangisidir?",
    fen: "r1bqkbnr/pppppppp/2n5/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 1",
    options: ["d4 (Gelişim)", "Nxc6 (Çatal!)", "Nf3 (Açmaz!)", "Bc4 (Tehdit!)"], answer: 1 },
  { category: "Satranç", difficulty: "Kolay", type: "chess",
    question: "Beyaz oynar. Aşağıdaki hamlelerden hangisi Şah Çeker?",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 0 1",
    options: ["Bc4+", "Nf3+", "d3+", "Qh5+"], answer: 3 },
  { category: "Satranç", difficulty: "Orta", type: "chess",
    question: "Beyaz oynar. En güçlü hamle nedir?",
    fen: "rnbqkb1r/pppp1ppp/5n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    options: ["Qf3 (Baskı!)", "Qxf7# (Mat!)", "Nc3 (Gelişim!)", "d3 (Savunma!)"], answer: 1 },
  { category: "Satranç", difficulty: "Zor", type: "chess",
    question: "Beyaz oynar. Hangi hamle hem Kaleyi hem Şahı tehdit eder?",
    fen: "r3k2r/ppp2ppp/2n1bn2/3pp3/2B1P3/3P1N2/PPP2PPP/R1BQK2R w KQkq - 0 1",
    options: ["Bg5+ (Çatal!)", "a3+ (Çatal!)", "O-O+ (Çatal!)", "Bxf7+ (Çatal!)"], answer: 3 },
  { category: "Satranç", difficulty: "Kolay", type: "chess",
    question: "Beyaz oynar. 1 hamlede mat! Hangi hamle mat eder?",
    fen: "k7/8/1K6/8/8/8/8/7R w - - 0 1",
    options: ["Rh7 (Şah!)", "Kb6 (Hamle!)", "Rh8# (Mat!)", "Ka6 (Savunma!)"], answer: 2 },

  // ─── 🔍 FARK BUL ───
  { category: "Fark Bul", difficulty: "Kolay", type: "spotdiff",
    question: "İki tablo arasındaki farklı emojiyi bulun!",
    grid1: ["🍎","🍊","🍋","🍇","🍉","🍓","🍑","🍒","🫐"],
    grid2: ["🍎","🍊","🍋","🍇","🍉","🍓","🍑","🍌","🫐"],
    options: ["Satır 1 Sütun 3 (🍋→🍍)", "Satır 3 Sütun 2 (🍒→🍌)", "Satır 2 Sütun 1 (🍇→🍉)", "Satır 3 Sütun 3 (🫐→🍇)"], answer: 1 },
  { category: "Fark Bul", difficulty: "Kolay", type: "spotdiff",
    question: "Hangi emoji değişmiş?",
    grid1: ["⭐","🌙","☀️","🌈","⚡","❄️","🔥","💧","🌊"],
    grid2: ["⭐","🌙","☀️","🌈","🌟","❄️","🔥","💧","🌊"],
    options: ["Satır 1 Sütun 1 (⭐→✨)", "Satır 3 Sütun 1 (🔥→🌋)", "Satır 2 Sütun 2 (⚡→🌟)", "Satır 1 Sütun 3 (☀️→🌞)"], answer: 2 },
  { category: "Fark Bul", difficulty: "Orta", type: "spotdiff",
    question: "Dikkatli bakın! Hangi hücre farklı?",
    grid1: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈"],
    grid2: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐲","🐵","🙈"],
    options: ["Satır 2 Sütun 3 (🐻→🐼)", "Satır 3 Sütun 1 (🐨→🐻)", "Satır 1 Sütun 4 (🐹→🐭)", "Satır 4 Sütun 2 (🐸→🐲)"], answer: 3 },
  { category: "Fark Bul", difficulty: "Orta", type: "spotdiff",
    question: "Bir şey değişti! Hangisi?",
    grid1: ["🏠","🏢","🏥","🏫","🏪","🏭","🏗️","🏛️","🏟️"],
    grid2: ["🏠","🏢","🏥","🏫","🏪","🏭","🏗️","⛪","🏟️"],
    options: ["Satır 3 Sütun 2 (🏛️→⛪)", "Satır 1 Sütun 2 (🏢→🏨)", "Satır 2 Sütun 3 (🏭→🏪)", "Satır 3 Sütun 3 (🏟️→🏰)"], answer: 0 },
  { category: "Fark Bul", difficulty: "Zor", type: "spotdiff",
    question: "25 emojide TEK fark! Bulabilir misiniz?",
    grid1: ["🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔴","🟠","🟡","🟢","🔵","🟣","⚫"],
    grid2: ["🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔴","🟠","🟡","🟢","🟤","🟣","⚫"],
    options: ["Satır 2 Sütun 4 (🔵→🟣)", "Satır 5 Sütun 3 (🔵→🟤)", "Satır 3 Sütun 1 (⚫→⚪)", "Satır 4 Sütun 5 (⚫→🔴)"], answer: 1 },
  { category: "Fark Bul", difficulty: "Kolay", type: "spotdiff",
    question: "İki tablo arasındaki farklı olan yiyeceği bulun!",
    grid1: ["🍕","🍔","🍟","🌭","🍿","🥓","🥚","🍞","🥐"],
    grid2: ["🍕","🍔","🍟","🌭","🍿","🥓","🥚","🥖","🥐"],
    options: ["Satır 1 Sütun 2 (🍔→🍟)", "Satır 2 Sütun 1 (🌭→🥓)", "Satır 3 Sütun 2 (🍞→🥖)", "Satır 1 Sütun 1 (🍕→🍔)"], answer: 2 },
];

// ─── OYUN DURUMU ─────────────────────────────────────────────────────────────
const game = {
  roomCode: null,
  host: null,
  players: {},
  teams: {},
  phase: 'idle',
  usedQuestions: new Set(),
  totalPlayers: 0,
  maxQuestions: 10,
  currentQuestionIndex: 0,
  selectedIndices: [],
  currentSelectionIndex: 0,
  activeRound: null,
};

function initActiveRound(question, timerSec) {
  game.activeRound = {
    question: question,
    timer: null,
    timerValue: timerSec,
    timerMax: timerSec,
    assignedPlayers: {},
    answers: {},
  };
}

// ─── YARDIMCI FONKSİYONLAR ──────────────────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clearTimer() {
  if (game.activeRound && game.activeRound.timer) {
    clearInterval(game.activeRound.timer);
    game.activeRound.timer = null;
  }
}

function generateRoomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function resetGame() {
  clearTimer();
  game.roomCode = null;
  game.host = null;
  game.players = {};
  game.teams = {};
  game.phase = 'idle';
  game.usedQuestions = new Set();
  game.totalPlayers = 0;
  game.maxQuestions = 10;
  game.currentQuestionIndex = 0;
  game.selectedIndices = [];
  game.currentSelectionIndex = 0;
  game.activeRound = null;
}

function getPlayerCount() {
  return Object.keys(game.players).filter(id => id !== game.host).length;
}

function formTeams() {
  const playerIds = Object.keys(game.players).filter(id => id !== game.host);
  const count = playerIds.length;
  game.teams = {};
  game.totalPlayers = count;
  shuffle(playerIds);

  if (count % 2 === 0 && count >= 2) {
    for (let i = 0; i < count; i += 2) {
      const teamNum = Math.floor(i / 2) + 1;
      const teamId = `Takım ${teamNum}`;
      const members = [playerIds[i], playerIds[i + 1]];
      const captainId = members[0];
      game.teams[teamId] = { members, captain: captainId, score: 0 };
      members.forEach(pid => {
        game.players[pid].teamId = teamId;
        game.players[pid].isCaptain = (pid === captainId);
      });
    }
  } else {
    playerIds.forEach(pid => {
      const playerName = game.players[pid].name;
      const teamId = playerName;
      game.teams[teamId] = { members: [pid], captain: pid, score: 0 };
      game.players[pid].teamId = teamId;
      game.players[pid].isCaptain = true;
    });
  }
}

// Aynı kategori arka arkaya gelmesin + gerçek rastgelelik
let lastCategory = null;
function getRandomQuestion() {
  // Eğer özel soru seçimi yapılmışsa, o listeden sırayla getir
  if (game.selectedIndices && game.selectedIndices.length > 0) {
    if (game.currentSelectionIndex >= game.selectedIndices.length) {
      game.currentSelectionIndex = 0; // Başa dön (hata olmaması için)
    }
    const idx = game.selectedIndices[game.currentSelectionIndex];
    game.currentSelectionIndex++;
    return QUESTIONS[idx];
  }

  // Özel seçim yoksa, rastgele havuzdan çek:
  let available = QUESTIONS.filter((_, i) => !game.usedQuestions.has(i));
  if (available.length === 0) {
    game.usedQuestions = new Set();
    available = [...QUESTIONS];
    lastCategory = null;
  }
  
  // Aynı kategoriden arka arkaya gelmesin
  if (lastCategory && available.length > 1) {
    const diffCat = available.filter(q => q.category !== lastCategory);
    if (diffCat.length > 0) available = diffCat;
  }
  
  // Fisher-Yates ile gerçek rastgele seç
  const idx = Math.floor(Math.random() * available.length);
  const q = available[idx];
  game.usedQuestions.add(QUESTIONS.indexOf(q));
  lastCategory = q.category;
  return q;
}

function getPublicState() {
  const teams = {};
  Object.entries(game.teams).forEach(([tid, t]) => {
    teams[tid] = {
      score: t.score,
      captainName: game.players[t.captain]?.name || '?',
      captainId: t.captain,
      members: t.members.map(pid => ({
        id: pid,
        name: game.players[pid]?.name || '?',
        isCaptain: pid === t.captain,
        answeredCount: game.players[pid]?.answeredCount || 0
      })),
      totalMembers: t.members.length,
      hasAssigned: game.activeRound ? !!game.activeRound.assignedPlayers[tid] : false
    };
  });

  const lobbyPlayers = Object.entries(game.players).map(([id, p]) => ({
    id, name: p.name, isHost: p.isHost,
  }));

  const round = game.activeRound;
  return {
    phase: game.phase,
    roomCode: game.roomCode,
    teams,
    playerCount: getPlayerCount(),
    hostId: game.host,
    hostName: game.players[game.host]?.name || null,
    lobbyPlayers,
    answeredTeams: round ? Object.keys(round.answers).length : 0,
    totalTeams: Object.keys(game.teams).length,
    assignedTeamsCount: round ? Object.keys(round.assignedPlayers).length : 0,
    totalPlayers: game.totalPlayers,
    maxQuestions: game.maxQuestions,
    currentQuestionIndex: game.currentQuestionIndex,
    currentQuestion: round && round.question ? {
      category: round.question.category,
      difficulty: round.question.difficulty,
      type: round.question.type || 'multi',
    } : null,
    timerValue: round ? round.timerValue : 0,
    timerMax: round ? round.timerMax : 0,
  };
}

function assignPlayerForTeam(teamId, targetSocketId) {
  if (game.phase !== 'captain_pick') return;
  const round = game.activeRound;
  if (round.assignedPlayers[teamId]) return;

  round.assignedPlayers[teamId] = targetSocketId;
  game.players[targetSocketId].answeredCount++;

  if (Object.keys(round.assignedPlayers).length >= Object.keys(game.teams).length) {
    startAnsweringPhase();
  } else {
    io.emit('gameState', getPublicState());
  }
}

function startCaptainPickTimer() {
  clearTimer();
  const round = game.activeRound;
  round.timerValue = 15;
  round.timerMax = 15;
  io.emit('timerTick', { value: 15, max: 15 });

  round.timer = setInterval(() => {
    round.timerValue--;
    io.emit('timerTick', { value: round.timerValue, max: round.timerMax });

    if (round.timerValue <= 0) {
      clearTimer();
      Object.entries(game.teams).forEach(([teamId, team]) => {
        if (!round.assignedPlayers[teamId]) {
          const eligible = getEligibleMembers(team);
          const randomMember = eligible[Math.floor(Math.random() * eligible.length)];
          if (randomMember) {
            round.assignedPlayers[teamId] = randomMember.id;
            game.players[randomMember.id].answeredCount++;
          }
        }
      });
      startAnsweringPhase();
    }
  }, 1000);
}

function startAnsweringPhase() {
  clearTimer();
  game.phase = 'active_round';
  const round = game.activeRound;
  round.timerValue = round.timerMax = TIMERS[round.question.difficulty] || 25;

  // Aktif olmayan/tüm üyeleri koptu olan takımlara anında timeout ver
  Object.entries(game.teams).forEach(([teamId, team]) => {
    const activeMembers = team.members.filter(pid => game.players[pid] && !game.players[pid].disconnected);
    if (activeMembers.length === 0) {
      if (!round.answers[teamId]) {
        const assignedPid = round.assignedPlayers[teamId] || team.members[0];
        const playerName = game.players[assignedPid]?.name || 'Oyuncu';
        round.answers[teamId] = {
          isCorrect: false, points: -5, playerName: playerName,
          teamScore: team.score, answerIndex: -1, status: 'timeout', timeTaken: round.timerMax
        };
        team.score = Math.max(0, team.score - 5);
        console.log(`⚠️ ${teamId} takımı çevrimdışı olduğu için otomatik timeout kaydedildi.`);
      }
    }
  });

  // Eğer tüm takımlar çevrimdışıysa (veya hepsi timeout olduysa) doğrudan raundu değerlendir
  if (Object.keys(round.answers).length >= Object.keys(game.teams).length) {
    evaluateRound();
    return;
  }

  Object.entries(game.teams).forEach(([teamId, team]) => {
    if (round.answers[teamId]) return;

    const assignedPid = round.assignedPlayers[teamId];
    const qData = {
      question: round.question.question, options: round.question.options,
      category: round.question.category, difficulty: round.question.difficulty,
      timer: round.timerValue, type: round.question.type || 'multi',
    };
    // Satranç sorusu ise FEN gönder
    if (round.question.fen) qData.fen = round.question.fen;
    // Fark Bul sorusu ise gridleri gönder
    if (round.question.grid1) { qData.grid1 = round.question.grid1; qData.grid2 = round.question.grid2; }
    io.to(assignedPid).emit('yourQuestion', qData);

    team.members.forEach(pid => {
      if (pid !== assignedPid) {
        io.to(pid).emit('waitingFor', {
          playerName: game.players[assignedPid]?.name || 'Takım Arkadaşın',
          teamId, category: round.question.category, difficulty: round.question.difficulty,
        });
      }
    });
  });

  io.emit('gameState', getPublicState());
  io.emit('timerTick', { value: round.timerValue, max: round.timerMax });
  round.timer = setInterval(() => {
    round.timerValue--;
    io.emit('timerTick', { value: round.timerValue, max: round.timerMax });
    if (round.timerValue <= 0) evaluateRound();
  }, 1000);
}

function evaluateRound() {
  if (game.phase !== 'active_round') return;
  game.phase = 'result';
  clearTimer();

  const round = game.activeRound;
  const q = round.question;
  const results = {};

  // En hızlı doğru cevabı bulanı belirle
  let fastestTeamId = null;
  let minTime = Infinity;

  Object.keys(game.teams).forEach(teamId => {
    const team = game.teams[teamId];
    if (!round.answers[teamId]) {
      team.score = Math.max(0, team.score - 5);
      const assignedPid = round.assignedPlayers[teamId];
      const assignedName = assignedPid ? (game.players[assignedPid]?.name || 'Oyuncu') : 'Kimse';
      results[teamId] = {
        isCorrect: false, points: -5, playerName: assignedName,
        teamScore: team.score, answerIndex: -1, status: 'timeout', timeTaken: round.timerMax
      };
    } else {
      results[teamId] = round.answers[teamId];
      if (results[teamId].isCorrect && results[teamId].timeTaken < minTime) {
        minTime = results[teamId].timeTaken;
        fastestTeamId = teamId;
      }
    }
  });

  if (fastestTeamId) {
    results[fastestTeamId].isFastest = true;
  }

  io.emit('roundResult', {
    correctAnswerText: q.options ? q.options[q.answer] : (q.answer === 0 ? 'Doğru' : 'Yanlış'),
    correctAnswerIndex: q.answer,
    question: q.question,
    results: results,
  });
  io.emit('gameState', getPublicState());
}

function buildScoreboard() {
  const scores = Object.entries(game.teams).map(([tid, t]) => ({
    teamId: tid, score: t.score,
    members: t.members.map(pid => ({
      name: game.players[pid]?.name || '?',
      score: game.players[pid]?.score || 0,
    })),
  }));
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

function getEligibleMembers(team) {
  let activeMembers = team.members.filter(pid => game.players[pid] && !game.players[pid].disconnected);
  if (activeMembers.length === 0) {
    activeMembers = team.members;
  }
  const membersData = activeMembers.map(pid => ({ id: pid, count: game.players[pid]?.answeredCount || 0 }));
  const minCount = Math.min(...membersData.map(m => m.count));
  return membersData.filter(m => m.count === minCount).map(m => ({
    id: m.id, name: game.players[m.id]?.name || 'Oyuncu'
  }));
}

// ─── SOCKET.IO OLAYLARI ──────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Bağlandı: ${socket.id}`);
  socket.emit('gameState', getPublicState());

  socket.on('createGame', ({ name, questionCount }) => {
    if (!name || !name.trim()) return;
    
    // Eğer önceden yarım kalmış veya takılmış bir oyun varsa, hata vermek yerine oyunu sıfırla ve yeni oyun kur.
    if (game.phase !== 'idle') {
      console.log('⚠️ Önceki aktif oyun zorla sıfırlandı. Yeni oyun kuruluyor...');
      resetGame();
    }

    game.roomCode = generateRoomCode();
    game.host = socket.id;
    game.phase = 'lobby';
    game.maxQuestions = questionCount || 10;
    game.currentQuestionIndex = 0;
    game.players[socket.id] = { name: name.trim(), teamId: null, isCaptain: false, isHost: true, score: 0, answeredCount: 0 };

    socket.emit('joined', { name: name.trim(), isHost: true, roomCode: game.roomCode });
    io.emit('gameState', getPublicState());
  });

  socket.on('joinGame', ({ name, roomCode }) => {
    if (!name || !name.trim() || !roomCode) return;
    if (game.roomCode !== roomCode.trim()) return socket.emit('error', { message: '❌ Yanlış oda kodu!' });

    // Geri bağlanmaya çalışan koptu durumundaki oyuncuyu kontrol et
    const normalizedName = name.trim().toLowerCase();
    const oldSocketId = Object.keys(game.players).find(id => {
      const p = game.players[id];
      return p.disconnected && p.name.trim().toLowerCase() === normalizedName;
    });

    if (oldSocketId) {
      const player = game.players[oldSocketId];
      player.disconnected = false;
      
      game.players[socket.id] = player;
      delete game.players[oldSocketId];

      if (player.teamId && game.teams[player.teamId]) {
        const team = game.teams[player.teamId];
        team.members = team.members.map(id => id === oldSocketId ? socket.id : id);
        if (team.captain === oldSocketId) {
          team.captain = socket.id;
        }
      }

      if (game.host === oldSocketId) {
        game.host = socket.id;
      }

      if (game.activeRound) {
        const round = game.activeRound;
        if (round.assignedPlayers[player.teamId] === oldSocketId) {
          round.assignedPlayers[player.teamId] = socket.id;
        }
      }

      socket.emit('joined', { name: player.name, isHost: player.isHost, roomCode: game.roomCode });
      console.log(`🔌 Oyuncu/Host geri bağlandı: ${player.name} (${socket.id})`);

      if (game.phase === 'active_round' && game.activeRound) {
        const round = game.activeRound;
        if (round.assignedPlayers[player.teamId] === socket.id) {
          if (!round.answers[player.teamId]) {
            const qData = {
              question: round.question.question, options: round.question.options,
              category: round.question.category, difficulty: round.question.difficulty,
              timer: round.timerValue, type: round.question.type || 'multi',
            };
            if (round.question.fen) qData.fen = round.question.fen;
            if (round.question.grid1) { qData.grid1 = round.question.grid1; qData.grid2 = round.question.grid2; }
            socket.emit('yourQuestion', qData);
          }
        } else {
          const assignedPid = round.assignedPlayers[player.teamId];
          socket.emit('waitingFor', {
            playerName: game.players[assignedPid]?.name || 'Takım Arkadaşın',
            teamId: player.teamId, category: round.question.category, difficulty: round.question.difficulty,
          });
        }
      }

      io.emit('gameState', getPublicState());
      return;
    }

    if (game.phase !== 'lobby') return socket.emit('error', { message: 'Lobi aktif değil.' });

    game.players[socket.id] = { name: name.trim(), teamId: null, isCaptain: false, isHost: false, score: 0, answeredCount: 0 };
    socket.emit('joined', { name: name.trim(), isHost: false, roomCode: game.roomCode });
    io.emit('gameState', getPublicState());
  });

  socket.on('startGame', () => {
    if (socket.id !== game.host || game.phase !== 'lobby') return;
    if (getPlayerCount() < 2) return socket.emit('error', { message: 'En az 2 oyuncu gerekli!' });
    formTeams();
    game.phase = 'teams';
    io.emit('gameState', getPublicState());
  });

  socket.on('backToLobby', () => {
    if (socket.id !== game.host || game.phase !== 'teams') return;
    game.phase = 'lobby';
    io.emit('gameState', getPublicState());
    console.log(`🔙 Host lobiye geri döndü.`);
  });

  socket.on('setCaptain', ({ teamId, playerId }) => {
    if (socket.id !== game.host || game.phase !== 'teams') return;
    const team = game.teams[teamId];
    if (!team || !team.members.includes(playerId)) return;
    team.members.forEach(pid => game.players[pid].isCaptain = false);
    team.captain = playerId;
    game.players[playerId].isCaptain = true;
    io.emit('gameState', getPublicState());
  });

  // ── SORU EKLE ──
  socket.on('addQuestion', (data) => {
    if (socket.id !== game.host) return;
    if (!data || !data.question || !data.options || !data.category || !data.difficulty || data.answer === undefined) {
      return socket.emit('error', { message: 'Eksik soru bilgisi!' });
    }
    
    const newQ = {
      category: data.category.trim(),
      difficulty: data.difficulty,
      type: data.type || 'multi',
      question: data.question.trim(),
      options: data.options.map(o => o.trim()),
      answer: parseInt(data.answer),
    };
    
    // Satranç sorusu ise FEN ekle
    if (data.type === 'chess' && data.fen) {
      newQ.fen = data.fen.trim();
    }
    // Fark Bul sorusu ise gridleri ekle
    if (data.type === 'spotdiff' && data.grid1 && data.grid2) {
      newQ.grid1 = data.grid1;
      newQ.grid2 = data.grid2;
    }
    
    QUESTIONS.push(newQ);
    socket.emit('questionAdded', { total: QUESTIONS.length, question: newQ.question.substring(0, 50) });
    console.log(`📝 Yeni soru eklendi! Toplam: ${QUESTIONS.length} | Kategori: ${newQ.category}`);
  });

  // ── TÜM SORULARI GETİR ──
  socket.on('getQuestions', () => {
    if (socket.id !== game.host) return;
    const list = QUESTIONS.map((q, i) => ({
      index: i,
      category: q.category,
      difficulty: q.difficulty,
      type: q.type || 'multi',
      question: q.question,
    }));
    socket.emit('questionsList', list);
  });

  // ── SEÇİLEN ÖZEL SORULARI AYARLA ──
  socket.on('setGameQuestions', (indices) => {
    if (socket.id !== game.host) return;
    game.selectedIndices = indices || [];
    game.currentSelectionIndex = 0;
    console.log(`📌 Host özel ${game.selectedIndices.length} soru seçti.`);
  });

  // ── SORU SİL ──
  socket.on('deleteQuestion', ({ index }) => {
    if (socket.id !== game.host) return;
    if (index < 0 || index >= QUESTIONS.length) return;
    const removed = QUESTIONS.splice(index, 1)[0];
    console.log(`🗑️ Soru silindi: "${removed.question.substring(0, 40)}..." | Kalan: ${QUESTIONS.length}`);
    // Güncel listeyi geri gönder
    const list = QUESTIONS.map((q, i) => ({
      index: i, category: q.category, difficulty: q.difficulty,
      type: q.type || 'multi', question: q.question,
    }));
    socket.emit('questionsList', list);
    socket.emit('questionDeleted', { total: QUESTIONS.length });
  });

  // ── SORU DETAYINI GETİR (düzenleme için) ──
  socket.on('getQuestionFull', ({ index }) => {
    if (socket.id !== game.host) return;
    if (index < 0 || index >= QUESTIONS.length) return;
    const q = QUESTIONS[index];
    socket.emit('questionFull', { index, ...q });
  });

  // ── SORU GÜNCELLE ──
  socket.on('updateQuestion', ({ index, data }) => {
    if (socket.id !== game.host) return;
    if (index < 0 || index >= QUESTIONS.length) return;
    if (!data || !data.question || !data.options || !data.category || !data.difficulty || data.answer === undefined) {
      return socket.emit('error', { message: 'Eksik soru bilgisi!' });
    }
    
    QUESTIONS[index] = {
      category: data.category.trim(),
      difficulty: data.difficulty,
      type: data.type || 'multi',
      question: data.question.trim(),
      options: data.options.map(o => o.trim()),
      answer: parseInt(data.answer),
    };
    if (data.fen) QUESTIONS[index].fen = data.fen.trim();
    if (data.grid1) { QUESTIONS[index].grid1 = data.grid1; QUESTIONS[index].grid2 = data.grid2; }
    
    socket.emit('questionUpdated', { index, question: data.question.substring(0, 50) });
    console.log(`✏️ Soru güncellendi [${index}]: "${data.question.substring(0, 40)}..."`);
    // Güncel listeyi gönder
    const list = QUESTIONS.map((q, i) => ({
      index: i, category: q.category, difficulty: q.difficulty,
      type: q.type || 'multi', question: q.question,
    }));
    socket.emit('questionsList', list);
  });

  // ── TOPLU SORU YÜKLE (JSON dosyasından) ──
  socket.on('uploadQuestions', (questionsArr) => {
    if (socket.id !== game.host) return;
    if (!Array.isArray(questionsArr) || questionsArr.length === 0) {
      return socket.emit('error', { message: 'Geçersiz soru dosyası!' });
    }
    let added = 0;
    questionsArr.forEach(q => {
      if (q.question && q.options && q.category && q.difficulty && q.answer !== undefined) {
        const newQ = {
          category: q.category, difficulty: q.difficulty,
          type: q.type || 'multi', question: q.question,
          options: q.options, answer: parseInt(q.answer),
        };
        if (q.fen) newQ.fen = q.fen;
        if (q.grid1) { newQ.grid1 = q.grid1; newQ.grid2 = q.grid2; }
        QUESTIONS.push(newQ);
        added++;
      }
    });
    socket.emit('questionsUploaded', { added, total: QUESTIONS.length });
    console.log(`📦 ${added} soru toplu yüklendi! Toplam: ${QUESTIONS.length}`);
  });

  // ── OYUNCU TAŞI (bir takımdan diğerine) ──
  socket.on('swapPlayer', ({ playerId, fromTeamId, toTeamId }) => {
    if (socket.id !== game.host || game.phase !== 'teams') return;
    const fromTeam = game.teams[fromTeamId];
    const toTeam = game.teams[toTeamId];
    if (!fromTeam || !toTeam || !fromTeam.members.includes(playerId)) return;

    // Host istediği oyuncuyu istediği takıma taşıyabilir, kapasite sınırı kaldırıldı.

    // Kaynak takımdan çıkar
    fromTeam.members = fromTeam.members.filter(id => id !== playerId);
    if (fromTeam.captain === playerId && fromTeam.members.length > 0) {
      fromTeam.captain = fromTeam.members[0];
      game.players[fromTeam.members[0]].isCaptain = true;
    }
    // Serbest modda boş takımı silme (host el ile siler); diğer modlarda otomatik sil
    if (fromTeam.members.length === 0 && game.teamMode !== 'free') {
      delete game.teams[fromTeamId];
    } else if (fromTeam.members.length === 0) {
      fromTeam.captain = null;
    }

    // Hedef takıma ekle
    toTeam.members.push(playerId);
    game.players[playerId].teamId = toTeamId;
    // Takım daha önce boşsa bu oyuncuyu kaptan yap
    if (toTeam.members.length === 1) {
      toTeam.captain = playerId;
      game.players[playerId].isCaptain = true;
    } else {
      game.players[playerId].isCaptain = false;
    }

    io.emit('gameState', getPublicState());
    console.log(`🔄 ${game.players[playerId].name}: ${fromTeamId} → ${toTeamId}`);
  });

  // ── OYUNCU TAŞI (Çoklu Seçim İle) ──
  socket.on('movePlayersBulk', ({ playerIds, toTeamId }) => {
    if (socket.id !== game.host || game.phase !== 'teams') return;
    if (!Array.isArray(playerIds) || playerIds.length === 0) return;
    const toTeam = game.teams[toTeamId];
    if (!toTeam) return;

    // Host istediği oyuncuları istediği takıma taşıyabilir, kapasite sınırı kaldırıldı.

    playerIds.forEach(playerId => {
      const player = game.players[playerId];
      if (!player) return;
      const fromTeamId = player.teamId;
      if (fromTeamId === toTeamId) return;
      
      const fromTeam = game.teams[fromTeamId];
      if (!fromTeam) return;

      fromTeam.members = fromTeam.members.filter(id => id !== playerId);
      if (fromTeam.captain === playerId && fromTeam.members.length > 0) {
        fromTeam.captain = fromTeam.members[0];
        game.players[fromTeam.members[0]].isCaptain = true;
      }
      if (fromTeam.members.length === 0 && game.teamMode !== 'free') {
        delete game.teams[fromTeamId];
      } else if (fromTeam.members.length === 0) {
        fromTeam.captain = null;
      }

      toTeam.members.push(playerId);
      game.players[playerId].teamId = toTeamId;
    });

    // Yeni gelenlerden veya eskilerden kaptan ayarlaması
    if (toTeam.members.length === playerIds.length && playerIds.length > 0) {
        toTeam.captain = playerIds[0];
        playerIds.forEach(pid => game.players[pid].isCaptain = (pid === playerIds[0]));
    } else {
        playerIds.forEach(pid => game.players[pid].isCaptain = false);
    }

    io.emit('gameState', getPublicState());
    console.log(`🔄 (Çoklu Taşıma) ${playerIds.length} oyuncu ${toTeamId} takımına taşındı.`);
  });

  // ── OYUNCU TAKAS (Sürükleyerek iki oyuncunun yerini değiştir) ──
  socket.on('exchangePlayers', ({ playerA, playerB }) => {
    if (socket.id !== game.host || game.phase !== 'teams') return;
    const teamAId = game.players[playerA]?.teamId;
    const teamBId = game.players[playerB]?.teamId;
    if (!teamAId || !teamBId || teamAId === teamBId) return;

    const teamA = game.teams[teamAId];
    const teamB = game.teams[teamBId];

    // Kaynak takımlardan çıkar
    teamA.members = teamA.members.filter(id => id !== playerA);
    teamB.members = teamB.members.filter(id => id !== playerB);

    // Kaptan değişikliklerini yönet
    if (teamA.captain === playerA && teamA.members.length > 0) { teamA.captain = teamA.members[0]; game.players[teamA.members[0]].isCaptain = true; }
    if (teamB.captain === playerB && teamB.members.length > 0) { teamB.captain = teamB.members[0]; game.players[teamB.members[0]].isCaptain = true; }

    // Takas et
    teamB.members.push(playerA);
    game.players[playerA].teamId = teamBId;
    game.players[playerA].isCaptain = false;

    teamA.members.push(playerB);
    game.players[playerB].teamId = teamAId;
    game.players[playerB].isCaptain = false;

    io.emit('gameState', getPublicState());
    console.log(`🔄 Takas yapıldı: ${game.players[playerA].name} <-> ${game.players[playerB].name}`);
  });

  // ── TAKIMLARI YENİDEN OLUŞTUR ──
  socket.on('reformTeams', ({ mode }) => {
    if (socket.id !== game.host || game.phase !== 'teams') return;
    const playerIds = Object.keys(game.players).filter(id => id !== game.host);
    const count = playerIds.length;
    game.teams = {};
    game.teamMode = mode;
    game.totalPlayers = count;
    shuffle(playerIds);

    if (mode === 'solo') {
      // Herkes solo
      playerIds.forEach(pid => {
        const name = game.players[pid].name;
        game.teams[name] = { members: [pid], captain: pid, score: 0 };
        game.players[pid].teamId = name;
        game.players[pid].isCaptain = true;
      });
    } else if (mode === 'pairs') {
      // İkili takımlar
      for (let i = 0; i < count; i += 2) {
        const teamNum = Math.floor(i / 2) + 1;
        const teamId = `Takım ${teamNum}`;
        const members = i + 1 < count ? [playerIds[i], playerIds[i + 1]] : [playerIds[i]];
        game.teams[teamId] = { members, captain: members[0], score: 0 };
        members.forEach(pid => {
          game.players[pid].teamId = teamId;
          game.players[pid].isCaptain = (pid === members[0]);
        });
      }
    } else if (mode === 'trio') {
      // Üçlü takımlar
      for (let i = 0; i < count; i += 3) {
        const teamNum = Math.floor(i / 3) + 1;
        const teamId = `Takım ${teamNum}`;
        const members = playerIds.slice(i, Math.min(i + 3, count));
        game.teams[teamId] = { members, captain: members[0], score: 0 };
        members.forEach(pid => {
          game.players[pid].teamId = teamId;
          game.players[pid].isCaptain = (pid === members[0]);
        });
      }
    } else if (mode === 'quad') {
      // Dörtlü takımlar
      for (let i = 0; i < count; i += 4) {
        const teamNum = Math.floor(i / 4) + 1;
        const teamId = `Takım ${teamNum}`;
        const members = playerIds.slice(i, Math.min(i + 4, count));
        game.teams[teamId] = { members, captain: members[0], score: 0 };
        members.forEach(pid => {
          game.players[pid].teamId = teamId;
          game.players[pid].isCaptain = (pid === members[0]);
        });
      }
    }

    io.emit('gameState', getPublicState());
    console.log(`🔄 Takımlar yeniden oluşturuldu: ${mode} modu, ${Object.keys(game.teams).length} takım`);
  });

  // ── YENİ BOŞ TAKIM OLUŞTUR (Serbest Mod) ──
  socket.on('createTeam', () => {
    if (socket.id !== game.host || game.phase !== 'teams') return;
    game.teamMode = 'free';
    let teamNum = Object.keys(game.teams).length + 1;
    let teamId = `Takım ${teamNum}`;
    while (game.teams[teamId]) { teamNum++; teamId = `Takım ${teamNum}`; }
    game.teams[teamId] = { members: [], captain: null, score: 0 };
    io.emit('gameState', getPublicState());
    console.log(`➕ Boş takım oluşturuldu: ${teamId}`);
  });

  // ── BOŞ TAKIM SİL ──
  socket.on('deleteTeam', ({ teamId }) => {
    if (socket.id !== game.host || game.phase !== 'teams') return;
    const team = game.teams[teamId];
    if (!team || team.members.length > 0) return socket.emit('error', { message: 'Sadece boş takımlar silinebilir!' });
    delete game.teams[teamId];
    io.emit('gameState', getPublicState());
    console.log(`🗑️ Boş takım silindi: ${teamId}`);
  });



  // ── SORU GÖNDER (Buzzer modu yok, her soru normal akışta) ──
  socket.on('sendQuestion', () => {
    if (socket.id !== game.host) return;
    if (!['teams', 'result'].includes(game.phase)) return;

    // Boş takım kontrolü
    const hasEmptyTeam = Object.values(game.teams).some(t => t.members.length === 0);
    if (hasEmptyTeam) {
      return socket.emit('error', { message: 'Boş takımlar var! Oyunu başlatmadan önce boş takımları silin veya oyuncu ekleyin.' });
    }

    game.currentQuestionIndex++;
    const q = getRandomQuestion();
    const timerSec = TIMERS[q.difficulty] || 25;
    initActiveRound(q, timerSec);

    // Kaptan seçimi akışı (çoklu takımlar varsa)
    const hasMultis = Object.values(game.teams).some(t => t.members.length > 1);

    if (hasMultis) {
      game.phase = 'captain_pick';
      Object.entries(game.teams).forEach(([teamId, team]) => {
        const isSolo = team.members.length === 1;
        if (isSolo) {
          const pid = team.members[0];
          game.activeRound.assignedPlayers[teamId] = pid;
          game.players[pid].answeredCount++;
          io.to(pid).emit('waitingForCaptain', {
            captainName: "Rakip Kaptanlar", teamId, category: q.category, difficulty: q.difficulty,
          });
        } else {
          const eligibleMembers = getEligibleMembers(team);
          io.to(team.captain).emit('captainPick', {
            category: q.category, difficulty: q.difficulty, timer: 15,
            unansweredMembers: eligibleMembers
          });
          team.members.forEach(pid => {
            if (pid !== team.captain) {
              io.to(pid).emit('waitingForCaptain', {
                captainName: game.players[team.captain]?.name, teamId, category: q.category, difficulty: q.difficulty,
              });
            }
          });
        }
      });
      startCaptainPickTimer();
      io.emit('gameState', getPublicState());
    } else {
      game.phase = 'captain_pick';
      Object.entries(game.teams).forEach(([teamId, team]) => {
        const pid = team.members[0];
        game.activeRound.assignedPlayers[teamId] = pid;
        game.players[pid].answeredCount++;
      });
      
      io.emit('getReady', { category: q.category, difficulty: q.difficulty, timer: 5 });
      io.emit('gameState', getPublicState());
      
      clearTimer();
      const round = game.activeRound;
      round.timerValue = 5;
      round.timerMax = 5;
      io.emit('timerTick', { value: 5, max: 5 });

      round.timer = setInterval(() => {
        round.timerValue--;
        io.emit('timerTick', { value: round.timerValue, max: round.timerMax });

        if (round.timerValue <= 0) {
          startAnsweringPhase();
        }
      }, 1000);
    }
  });

  // ── KAPTAN SEÇİMİ ──
  socket.on('assignPlayer', ({ targetSocketId }) => {
    const player = game.players[socket.id];
    if (game.phase !== 'captain_pick' || !player || !player.isCaptain) return;
    const teamId = player.teamId;
    const team = game.teams[teamId];
    if (game.activeRound.assignedPlayers[teamId]) return;
    if (!team.members.includes(targetSocketId)) return;
    const eligibleIds = getEligibleMembers(team).map(m => m.id);
    if (!eligibleIds.includes(targetSocketId)) return;
    assignPlayerForTeam(teamId, targetSocketId);
  });

  // ── CEVAP GÖNDER ──
  socket.on('submitAnswer', ({ answerIndex }) => {
    const player = game.players[socket.id];
    if (game.phase !== 'active_round' || !player) return;

    const teamId = player.teamId;
    const round = game.activeRound;

    if (round.answers[teamId]) return;
    if (round.assignedPlayers[teamId] !== socket.id) return;

    const q = round.question;
    const isCorrect = answerIndex === q.answer;
    const timeTaken = round.timerMax - round.timerValue;

    let points = 0;
    if (isCorrect) {
      points = 10;
      points += Math.round((round.timerValue / round.timerMax) * 5);
    } else {
      points = -5;
    }

    game.teams[teamId].score = Math.max(0, game.teams[teamId].score + points);
    player.score += points;
    round.answers[teamId] = {
      isCorrect, points, playerName: player.name,
      teamScore: game.teams[teamId].score, answerIndex, status: 'answered', timeTaken
    };

    // Oyuncuya anında geri bildirim gönder (doğru/yanlış)
    socket.emit('answerAck', {
      isCorrect,
      points,
      correctAnswerIndex: q.answer,
      timeTaken
    });

    // Bekleyen takım arkadaşlarına anlık bildirim gönder
    const team = game.teams[teamId];
    team.members.forEach(pid => {
      if (pid !== socket.id) {
        io.to(pid).emit('teammateAnswered', {
          isCorrect,
          points,
          playerName: player.name,
          timeTaken
        });
      }
    });

    // Önce gameState güncelle (host 2/2 görsün), sonra evaluate et
    io.emit('gameState', getPublicState());

    if (Object.keys(round.answers).length >= Object.keys(game.teams).length) {
      evaluateRound();
    }
  });

  socket.on('endGame', () => {
    if (socket.id !== game.host) return;
    game.phase = 'scoreboard';
    clearTimer();
    io.emit('gameOver', buildScoreboard());
    io.emit('gameState', getPublicState());
  });

  socket.on('restartGame', () => {
    if (socket.id !== game.host) return;
    resetGame();
    io.emit('gameRestarted');
    io.emit('gameState', getPublicState());
  });

  // ── HOST DEVRET ──
  socket.on('transferHost', ({ targetId }) => {
    if (socket.id !== game.host) return;
    if (!game.players[targetId]) return;
    
    game.players[socket.id].isHost = false;
    game.host = targetId;
    game.players[targetId].isHost = true;
    
    socket.emit('hostTransferred');
    io.to(targetId).emit('youAreHost');
    io.emit('gameState', getPublicState());
    console.log(`👑 Host devredildi: ${game.players[targetId].name}`);
  });

function handleActiveGameDisconnect(socketId, player) {
  const teamId = player.teamId;
  if (!teamId || !game.teams[teamId]) return;

  const team = game.teams[teamId];
  const activeMembers = team.members.filter(pid => game.players[pid] && !game.players[pid].disconnected);

  if (game.phase === 'captain_pick') {
    if (team.captain === socketId) {
      if (activeMembers.length > 0) {
        team.captain = activeMembers[0];
        game.players[activeMembers[0]].isCaptain = true;
        console.log(`👑 Yeni kaptan atandı: ${game.players[activeMembers[0]].name}`);
        
        const round = game.activeRound;
        if (round) {
          const eligibleMembers = getEligibleMembers(team);
          io.to(team.captain).emit('captainPick', {
            category: round.question.category, difficulty: round.question.difficulty, timer: round.timerValue,
            unansweredMembers: eligibleMembers
          });
        }
      } else {
        const round = game.activeRound;
        if (round && !round.assignedPlayers[teamId]) {
          const firstMember = team.members[0];
          round.assignedPlayers[teamId] = firstMember;
          game.players[firstMember].answeredCount++;
        }
      }
    }
  } else if (game.phase === 'active_round') {
    const round = game.activeRound;
    if (round && round.assignedPlayers[teamId] === socketId && !round.answers[teamId]) {
      if (activeMembers.length > 0) {
        const nextPlayerId = activeMembers[0];
        round.assignedPlayers[teamId] = nextPlayerId;
        
        const qData = {
          question: round.question.question, options: round.question.options,
          category: round.question.category, difficulty: round.question.difficulty,
          timer: round.timerValue, type: round.question.type || 'multi',
        };
        if (round.question.fen) qData.fen = round.question.fen;
        if (round.question.grid1) { qData.grid1 = round.question.grid1; qData.grid2 = round.question.grid2; }
        
        io.to(nextPlayerId).emit('yourQuestion', qData);
        console.log(`🎯 Cevaplama yetkisi ${player.name} koptuğu için ${game.players[nextPlayerId].name} oyuncusuna devredildi.`);
        
        team.members.forEach(pid => {
          if (pid !== nextPlayerId) {
            io.to(pid).emit('waitingFor', {
              playerName: game.players[nextPlayerId]?.name || 'Takım Arkadaşın',
              teamId, category: round.question.category, difficulty: round.question.difficulty,
            });
          }
        });
      } else {
        console.log(`⚠️ ${teamId} takımında aktif oyuncu kalmadığı için otomatik timeout cevabı girildi.`);
        round.answers[teamId] = {
          isCorrect: false, points: -5, playerName: player.name,
          teamScore: team.score, answerIndex: -1, status: 'timeout', timeTaken: round.timerMax
        };
        team.score = Math.max(0, team.score - 5);
        
        if (Object.keys(round.answers).length >= Object.keys(game.teams).length) {
          evaluateRound();
        }
      }
    }
  }
}

  socket.on('disconnect', () => {
    const player = game.players[socket.id];
    if (!player) return;

    if (game.phase === 'lobby' || game.phase === 'idle') {
      if (player.teamId && game.teams[player.teamId]) {
        const team = game.teams[player.teamId];
        team.members = team.members.filter(id => id !== socket.id);
        if (team.captain === socket.id && team.members.length > 0) {
          team.captain = team.members[0];
          game.players[team.members[0]].isCaptain = true;
        }
        if (team.members.length === 0) delete game.teams[player.teamId];
      }
      if (game.host === socket.id) {
        const others = Object.keys(game.players).filter(id => id !== socket.id);
        if (others.length > 0) {
          game.host = others[0];
          game.players[others[0]].isHost = true;
          io.to(others[0]).emit('youAreHost');
          console.log(`👑 Host otomatik devredildi: ${game.players[others[0]].name}`);
        }
      }
      delete game.players[socket.id];
    } else {
      player.disconnected = true;
      console.log(`🔌 Oyuncu/Host koptu (Geri bağlanabilir): ${player.name} (${socket.id})`);
      handleActiveGameDisconnect(socket.id, player);
    }
    io.emit('gameState', getPublicState());
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🎮 ClusterQuiz Sunucusu çalışıyor!`);
  console.log(`📡 http://localhost:${PORT}`);
  console.log(`📋 Toplam ${QUESTIONS.length} soru yüklendi.\n`);
});
