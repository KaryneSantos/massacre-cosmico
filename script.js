const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 720;
canvas.height = 720;

const containerJogo = document.querySelector('.container');
const novoJogo = document.getElementById("novoJogo");


novoJogo.addEventListener('click', (e) => {
    e.preventDefault();
    canvas.style.display = "block";
    containerJogo.style.display = "none";
});

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        atualizarJogo();
    }
});

const navePlayer = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 100,
    height: 100,
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
                width: 80,
                height: 80,
                dy: -5,
                tempoVida: 0
            },
            {
                x: navePlayer.x + (2 * navePlayer.width) / 5.5 - 13,
                y: navePlayer.y - 20,
                width: 80,
                height: 80,
                dy: -5,
                tempoVida: 0
            }
        );
    }
    
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") navePlayer.direcaoX = 0;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") navePlayer.direcaoY = 0;
});

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
                        width: 80,
                        height: 80,
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

function desenharJogo() {
    ctx.drawImage(cenarioImagem, 0, 0, canvas.width, canvas.height);

    tiros.forEach((tiro, index) => {
        tiro.y += tiro.dy;
        tiro.tempoVida++;

        if (tiroImagem.complete) {
            ctx.drawImage(tiroImagem, tiro.x, tiro.y, tiro.width, tiro.height);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(tiro.x, tiro.y, tiro.width, tiro.height);
        }
        
    });

    criarInimigo();
    // inimigosAtirando();

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
    desenharJogo();
    requestAnimationFrame(atualizarJogo);
}

atualizarJogo();