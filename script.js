const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 720;
canvas.height = 720;

const containerJogo = document.querySelector('.container');
const novoJogo = document.getElementById("novoJogo");

const menuPause = document.getElementById("menuPause");
const continuarBtn = document.getElementById('continuarJogo');
const configuracaoBtn = document.getElementById('configuracaoJogo');
const menuInicialBtn = document.getElementById('menuInicialJogo');

let pausado = false;

novoJogo.addEventListener('click', (e) => {
    e.preventDefault();
    canvas.style.display = "block";
    containerJogo.style.display = "none";
 carregarSom().then(() => {
        if (SomDeFundo) {
            const playPromise = SomDeFundo.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Reprodução automática prevenida:", error);
                    // Mostra um botão para o usuário iniciar o áudio manualmente
                });
            }
        }
    }).catch(error => {
        console.error("Erro ao iniciar áudio:", error);
    });
   
});

// Variáveis da interface
let pontuacao = 0;
let escudo = 3;
let vidas = 3;

const navePlayer = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50, // Reduzido para melhor colisão
    height: 50, // Reduzido para melhor colisão
    velocidade: 5,
    direcaoX: 0,
    direcaoY: 0
};

var cenarioImagem = new Image();
cenarioImagem.src = "/assets/img/cenario.png";

var naveImagem = new Image();
naveImagem.src = "/assets/img/valkyrie.png";

var tiroImagem = new Image();
tiroImagem.src = "/assets/img/bala.png";

var inimigo1Imagem = new Image();
inimigo1Imagem.src = "/assets/img/inimigo1.png";

var inimigo2Imagem = new Image();
inimigo2Imagem.src = "/assets/img/inimigo2.png";

var inimigo3Imagem = new Image();
inimigo3Imagem.src = "/assets/img/inimigo3.png";

var escudoImagem = new Image();
escudoImagem.src = "/assets/img/escudo.png";

var pauseImagem = new Image();
pauseImagem.src = "/assets/img/pause.png";

var vidaCheiaImagem = new Image();
vidaCheiaImagem.src = "/assets/img/vida_cheia.png";

var vidaVaziaImagem = new Image();
vidaVaziaImagem.src = "/assets/img/vida_vazia.png";

let somDoTiro;
let SomDeFundo;

let audioCarregado = false;

function carregarSom() {
    return new Promise((resolve, reject) => {
        try {
            SomDeFundo = new Audio('/assets/audio/SomDeFundo.mp3');
            SomDeFundo.loop = true;
            SomDeFundo.volume = 0.5;
            SomDeFundo.preload = 'auto';
            
            somDoTiro = new Audio('/assets/audio/tiroDojogador.mp3');
            somDoTiro.loop = false;
            somDoTiro.preload = 'auto';
            
            // Verifica se os áudios estão prontos para tocar
            const checkLoaded = () => {
                if (SomDeFundo.readyState > 2 && somDoTiro.readyState > 2) {
                    audioCarregado = true;
                    resolve();
                } else {
                    setTimeout(checkLoaded, 100);
                }
            };
            
            checkLoaded();
        } catch (e) {
            console.error("Erro ao carregar áudios:", e);
            reject(e);
        }
    });
}

let tiros = [];
let ultimoTiro = 0;
const tempoEntreTiros = 100;

let tirosInimigos = [];
let inimigos = [];
let ondaAtual = 1;
let ultimoInimigo = 0;
const numLinhas = 4;
const numColunas = 7;
const espacamento = 80;
const intervaloInimigo = 10000;

// Função para detectar colisão entre dois objetos
function detectarColisao(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// Função para o inimigo atirar
function inimigosAtirando() {
    inimigos.forEach((inimigo) => {
        if (Date.now() - inimigo.ultimoTiro > 2000) {
            inimigo.ultimoTiro = Date.now();
            tirosInimigos.push({
                x: inimigo.x + inimigo.width / 2 - 1,
                y: inimigo.y + inimigo.height,
                width: 2,
                height: 20,
                dy: 5,
                tempoVida: 0
            });
        }
    });
}

// Função de atirar com som
function atirarComSom(e) {
    if (e.key === " " && Date.now() - ultimoTiro > tempoEntreTiros) {
        ultimoTiro = Date.now();

        tiros.push(
            {
                x: navePlayer.x + navePlayer.width / 5 - 11,
                y: navePlayer.y - 20,
                width: 5,
                height: 20,
                dy: -5,
                tempoVida: 0
            },
            {
                x: navePlayer.x + (2 * navePlayer.width) / 5.5 - 13,
                y: navePlayer.y - 20,
                width: 5,
                height: 20,
                dy: -5,
                tempoVida: 0
            }
        );

        if (somDoTiro && audioCarregado) {
            try {
                // Criar nova instância para cada tiro
                const novoTiro = new Audio(somDoTiro.src);
                novoTiro.volume = somDoTiro.volume;
                novoTiro.play().catch(e => console.log("Erro ao tocar som do tiro:", e));
            } catch (e) {
                console.error("Erro ao criar som do tiro:", e);
            }
        }
    }
}

// Verificar colisões entre tiros e inimigos
function verificarColisoes() {
    tiros.forEach((tiro, indexTiro) => {
        inimigos.forEach((inimigo, indexInimigo) => {
            if (detectarColisao(tiro, inimigo)) {
                // Remover tiro e inimigo
                tiros.splice(indexTiro, 1);
                inimigos.splice(indexInimigo, 1);

                // Incrementar pontuação
                pontuacao += 100;

                // Explosão (simples exemplo de efeito visual)
                ctx.fillStyle = "orange";
                ctx.beginPath();
                ctx.arc(inimigo.x + inimigo.width / 2, inimigo.y + inimigo.height / 2, 30, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    });
}

// Verificar colisões entre tiros inimigos e nave do jogador
function verificarColisaoComNave() {
    tirosInimigos.forEach((tiro, indexTiro) => {
        if (detectarColisao(tiro, navePlayer)) {
            // Remover tiro
            tirosInimigos.splice(indexTiro, 1);

            // Reduzir vidas
            vidas--;

            // Verificar fim de jogo
            if (vidas <= 0) {
                fimDeJogo();
            }
        }
    });
}

// Função para exibir "Game Over" e reiniciar o jogo
function fimDeJogo() {
    pausado = true;
    ctx.fillStyle = "red";
    ctx.font = "40px 'Press Start 2P', cursive";
    ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2);

    setTimeout(() => {
        location.reload(); // Reinicia o jogo
    }, 3000);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") navePlayer.direcaoX = -navePlayer.velocidade;
    if (e.key === "ArrowRight") navePlayer.direcaoX = navePlayer.velocidade;
    if (e.key === "ArrowUp") navePlayer.direcaoY = -navePlayer.velocidade;
    if (e.key === "ArrowDown") navePlayer.direcaoY = navePlayer.velocidade;

    if (e.key === " " && Date.now() - ultimoTiro > tempoEntreTiros) {
        ultimoTiro = Date.now();

        tiros.push(
            {
                x: navePlayer.x + navePlayer.width / 5 - 11,
                y: navePlayer.y - 20,
                width: 5,  // Reduzido
                height: 20, // Reduzido
                dy: -5,
                tempoVida: 0
            },
            {
                x: navePlayer.x + (2 * navePlayer.width) / 5.5 - 13,
                y: navePlayer.y - 20,
                width: 5,  // Reduzido
                height: 20, // Reduzido
                dy: -5,
                tempoVida: 0
            }
        );

        if (somDoTiro) {
            let novoSom = somDoTiro.cloneNode();
            novoSom.play();
        }
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") navePlayer.direcaoX = 0;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") navePlayer.direcaoY = 0;
});

function pausarJogo() {
    pausado = !pausado;

    if (pausado) {
        menuPause.style.display = "block";
    } else {
        menuPause.style.display = "none";
    }
}

document.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 20 && x <= 50 && y >= 20 && y <= 50) {
        pausarJogo();
    }
});

function desenharUI() {
    ctx.fillStyle = "#43D61F";
    ctx.font = "16px 'Press Start 2P', cursive";

    const textoPontuacao = "PONTUAÇÃO";
    const larguraTextoPontuacao = ctx.measureText(textoPontuacao).width;
    ctx.fillText(textoPontuacao, canvas.width / 2 - larguraTextoPontuacao / 2, 30);

    const textoScore = pontuacao.toString().padStart(4, "0");
    const larguraTextoScore = ctx.measureText(textoScore).width;
    ctx.fillText(textoScore, canvas.width / 2 - larguraTextoScore / 2, 50);

    for (let i = 0; i < 3; i++) { // Mantido para 3 vidas máximas
        let imgVida = i < vidas ? vidaCheiaImagem : vidaVaziaImagem;
        ctx.drawImage(imgVida, canvas.width - 180 + i * 35, -6, 100, 100);
    }

    for (let i = 0; i < escudo; i++) {
        ctx.drawImage(escudoImagem, 80 + i * 45, -5, 85, 85);
    }

    ctx.drawImage(pauseImagem, 20, 20, 30, 30);
}

function moverNave() {
    navePlayer.x += navePlayer.direcaoX;
    navePlayer.y += navePlayer.direcaoY;

    if (navePlayer.x < 0) navePlayer.x = 0;
    if (navePlayer.x + navePlayer.width > canvas.width) navePlayer.x = canvas.width - navePlayer.width;
    if (navePlayer.y < 0) navePlayer.y = 0;
    if (navePlayer.y + navePlayer.height > canvas.height) navePlayer.y = canvas.height - navePlayer.height;
}

function criarInimigo() {
    if (Date.now() - ultimoInimigo > intervaloInimigo) {
        ultimoInimigo = Date.now();

        let novosInimigos = [];
        let tipoInimigo = ondaAtual;

        for (let linha = 0; linha < numLinhas; linha++) {
            for (let coluna = 0; coluna < numColunas; coluna++) {
                let alvoX = coluna * espacamento + 100;
                let alvoY = linha * espacamento + 50;

                let existente = inimigos.find(inimigo => inimigo.alvoX === alvoX && inimigo.alvoY === alvoY);

                if (!existente) {
                    let posX = Math.random() * (canvas.width - 40);

                    novosInimigos.push({
                        x: posX,
                        y: -40,
                        width: 40,  // Reduzido
                        height: 40, // Reduzido
                        dx: (alvoX - posX) / 50,
                        dy: 2,
                        alvoX: alvoX,
                        alvoY: alvoY,
                        alinhado: false,
                        tipo: tipoInimigo,
                        ultimoTiro: Date.now()
                    });
                }
            }
        }

        inimigos = inimigos.concat(novosInimigos);

        if (inimigos.length === 0) {
            ondaAtual++;
            if (ondaAtual > 2) ondaAtual = 3;
        }
    }
}

function desenharJogo() {
    ctx.drawImage(cenarioImagem, 0, 0, canvas.width, canvas.height);

    tiros.forEach((tiro, index) => {
        tiro.y += tiro.dy;
        tiro.tempoVida++;

        if (tiro.y < 0 || tiro.tempoVida > 100) { // Limpar tiros fora da tela
            tiros.splice(index, 1);
            return;
        }

        if (tiroImagem.complete) {
            ctx.drawImage(tiroImagem, tiro.x, tiro.y, tiro.width, tiro.height);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(tiro.x, tiro.y, tiro.width, tiro.height);
        }

    });

    criarInimigo();
    inimigosAtirando(); // Chamando a função aqui

    inimigos.forEach((inimigo) => {
        if (!inimigo.alinhado) {
            inimigo.y += inimigo.dy;
            inimigo.x += inimigo.dx;

            if (inimigo.y >= inimigo.alvoY) {
                inimigo.y = inimigo.alvoY;
                inimigo.x = inimigo.alvoX;
                inimigo.alinhado = true;
            }
        }

        let inimigoImagemEscolhida;
        if (inimigo.tipo === 1) {
            inimigoImagemEscolhida = inimigo1Imagem;
        } else if (inimigo.tipo === 2) {
            inimigoImagemEscolhida = inimigo2Imagem;
        } else {
            inimigoImagemEscolhida = inimigo3Imagem;
        }

        ctx.drawImage(inimigoImagemEscolhida, inimigo.x, inimigo.y, inimigo.width, inimigo.height);
    });

    tirosInimigos.forEach((tiro, index) => {
        tiro.y += tiro.dy;
        tiro.tempoVida++;

        if (tiro.y > canvas.height || tiro.tempoVida > 100) {
            tirosInimigos.splice(index, 1);
        } else {
            ctx.fillStyle = "green";
            ctx.fillRect(tiro.x, tiro.y, tiro.width, tiro.height);
        }
    });

    moverNave();

    ctx.drawImage(naveImagem, navePlayer.x, navePlayer.y, navePlayer.width, navePlayer.height);
}

function atualizarJogo() {
    if (!pausado) {
        desenharJogo();
        desenharUI();
        verificarColisoes();
        verificarColisaoComNave();
    }
    requestAnimationFrame(atualizarJogo);
}

// Carregar sons
carregarSom();

// Iniciar o loop do jogo
atualizarJogo();
