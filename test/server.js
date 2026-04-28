const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const QUESTIONS_DB = [
    { c: "Kubernetes", text: "Cluster içindeki verilerin (state) tutulduğu ana bileşen hangisidir?", opts: ["Etcd", "Scheduler", "Kubelet", "CoreDNS"], ans: "Etcd" },
    { c: "Docker", text: "Birden fazla container'ı tek dosyadan yönetmeye yarayan araç hangisidir?", opts: ["Docker Compose", "Docker Swarm", "Docker Image", "Dockerfile"], ans: "Docker Compose" },
    { c: "Azure", text: "Azure'da şifre ve anahtarların güvenli tutulduğu servis hangisidir?", opts: ["Key Vault", "Blob Storage", "Active Directory", "Sentinel"], ans: "Key Vault" },
    { c: "Network", text: "L7 (Application) seviyesinde yük dengeleme yapan K8s objesi hangisidir?", opts: ["Ingress", "ClusterIP", "NodePort", "ConfigMap"], ans: "Ingress" },
    { c: "DevOps", text: "Kodun sürekli olarak test edilip yayına alınması sürecine ne ad verilir?", opts: ["CI/CD", "Waterfall", "Binary Search", "Encryption"], ans: "CI/CD" }
];

// Fisher-Yates Karıştırma Algoritması
function robustShuffle(array) {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

function getInitialState() {
    return {
        turn: 'red', stage: 'picking', activePlayer: null, timer: 60,
        scores: { red: 0, blue: 0 }, playerPoints: {},
        teamNames: { red: 'RED CLUSTER', blue: 'BLUE CLUSTER' },
        currentQuestion: null,
        nextCategory: QUESTIONS_DB[Math.floor(Math.random() * QUESTIONS_DB.length)].c,
        winThreshold: 500 
    };
}

let players = [];
let gameState = getInitialState();
let timerInterval = null;

io.on('connection', (socket) => {
    socket.emit('syncState', gameState);

    socket.on('join', (data) => {
        const newPlayer = { id: socket.id, name: data.name, role: data.role, team: data.team };
        players.push(newPlayer);
        if (!gameState.playerPoints[data.name]) gameState.playerPoints[data.name] = 0;
        io.emit('updatePlayerList', players);
        io.emit('syncState', gameState);
    });

    socket.on('pickPlayer', (playerName) => {
        const sender = players.find(p => p.id === socket.id);
        if (sender && sender.role === 'ingress' && sender.team === gameState.turn) {
            const rawQ = QUESTIONS_DB.find(q => q.c === gameState.nextCategory);
            gameState.currentQuestion = { 
                text: rawQ.text, 
                shuffledOpts: robustShuffle([...rawQ.opts]),
                ans: rawQ.ans 
            };
            gameState.activePlayer = playerName;
            gameState.stage = 'showing';
            io.emit('syncState', gameState);
        }
    });

    socket.on('startTimer', () => {
        gameState.stage = 'answering';
        io.emit('syncState', gameState);
        if(timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            gameState.timer--;
            if(gameState.timer <= 0) { clearInterval(timerInterval); finishTurn(false); }
            io.emit('timerTick', gameState.timer);
        }, 1000);
    });

    socket.on('submitAnswer', (isCorrect) => {
        clearInterval(timerInterval);
        finishTurn(isCorrect, gameState.activePlayer);
    });

    function finishTurn(isCorrect, playerName) {
        if (isCorrect) {
            gameState.scores[gameState.turn] += 100;
            if(playerName) gameState.playerPoints[playerName] = (gameState.playerPoints[playerName] || 0) + 100;
        } else {
            gameState.scores[gameState.turn] = Math.max(0, gameState.scores[gameState.turn] - 25);
        }
        
        if (gameState.scores[gameState.turn] >= gameState.winThreshold) {
            gameState.stage = 'finished';
        } else {
            gameState.turn = (gameState.turn === 'red') ? 'blue' : 'red';
            gameState.stage = 'picking';
            gameState.activePlayer = null;
            gameState.timer = 60;
            gameState.nextCategory = QUESTIONS_DB[Math.floor(Math.random() * QUESTIONS_DB.length)].c;
        }
        io.emit('syncState', gameState);
    }

    socket.on('resetSystem', () => {
        gameState = getInitialState();
        players = []; 
        io.emit('fullReset');
    });

    socket.on('disconnect', () => {
        players = players.filter(p => p.id !== socket.id);
        io.emit('updatePlayerList', players);
    });
});

server.listen(3000, () => console.log('🚀 v1.9.1 Tactical Master Ready!'));