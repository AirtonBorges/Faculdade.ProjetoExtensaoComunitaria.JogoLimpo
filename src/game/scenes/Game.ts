import { Scene } from "phaser";

import { EventBus } from "../EventBus";
import { Coracao } from "../gameObjects/Coracao";
import { Lixeira, lixeiras } from "../gameObjects/Lixeira";
import { Lixo, lixos } from "../gameObjects/Lixo";

export const sons = {
    lixoCerto: "acerto",
    lixoErrado: "erro",
} as const;

export const coracao = "coracao";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    pontuacao: Phaser.GameObjects.Text;
    images: Phaser.GameObjects.Image[] = [];
    timeElapsed: number = 0;

    ground: Phaser.GameObjects.Rectangle;
    screenWidth: number;
    screenHeight: number;
    areaLixeiras: number;
    vidas: number = 5;
    pontos: number = 0;

    defaultWidth = 800;
    defaultHeight = 800;
    spawnInterval = 3000;
    maxLixos = 20;
    dragStartTime = 0;
    dragStartX = 0;
    dragStartY = 0;
    throwFactor = 0.5;
    maxThrowVelocity = 3000;

    lixeiraObjetos: Lixeira[] = [];
    coracoes: Coracao[] = [];

    constructor() {
        super("Game");
    }

    preload() {
        const parentNode = this.sys.game.canvas.parentNode;
        if (parentNode != null && parentNode instanceof HTMLElement) {
            this.screenWidth = parentNode.clientWidth;
            this.screenHeight = parentNode.clientHeight;
        }

        this.areaLixeiras = this.screenWidth > this.defaultWidth
            ? this.defaultWidth
            : this.screenWidth;

        this.load.setPath("assets/lixo");
        lixos.forEach((p) => {
            this.load.image(p.nome, `${p.nome}.png`);
        });

        this.load.setPath("assets/lixeiras");
        lixeiras.forEach((p) => {
            this.load.image(p, `${p}.png`);
        });
        this.load.setPath("assets");
        this.load.image(coracao, "coracao.png");

        this.load.setPath("assets/sons");
        const arquivoAcerto = "476178__unadamlar__correct-choice.wav";
        const arquivoErro = "131657__bertrof__game-sound-wrong.wav";

        this.load.audio(sons.lixoCerto, arquivoAcerto);
        this.load.audio(sons.lixoErrado, arquivoErro);
    }

    create() {
        this.camera = this.cameras.main;
        const groundY = this.scale.height;

        this.adicionaChao(groundY);
        this.adicionaLixeiras(groundY);
        this.configuraEventos();
        this.configuraCoracoes();

        this.configuraPontuacao();

        EventBus.emit("current-scene-ready", this);
    }

    private configuraCoracoes() {
        let escalaCoracao = this.escalarX(0.04, this.screenWidth);
        escalaCoracao = escalaCoracao < 0.04 ? escalaCoracao : 0.04;
        const coracoesX = ((this.camera.width - this.areaLixeiras) / 2) + 10;

        for (let i = 0; i < this.vidas; i++) {
            const x = coracoesX + i * (2000 * escalaCoracao + 5);
            const y = 10;
            const item = new Coracao(this, x, y, coracao);
            item.scale = escalaCoracao;
            this.coracoes.push(item);
        }
    }

    private configuraEventos() {
        this.input.on(
            "dragstart",
            (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Image,
            ) => {
                const body = (gameObject as any).body as
                    | Phaser.Physics.Arcade.Body
                    | undefined;
                if (body) {
                    body.allowGravity = false;
                    body.setVelocity(0, 0);
                }

                this.dragStartTime = this.time.now;
                this.dragStartX = pointer.x;
                this.dragStartY = pointer.y;
            },
        );

        this.input.on(
            "drag",
            (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Image,
                dragX: number,
                dragY: number,
            ) => {
                gameObject.x = dragX;
                gameObject.y = dragY;
                const body = (gameObject as any).body as
                    | Phaser.Physics.Arcade.Body
                    | undefined;
                if (body) {
                    body.reset(dragX, dragY);
                }
            },
        );

        this.input.on(
            "dragend",
            (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Image,
            ) => {
                const body = (gameObject as any).body as
                    | Phaser.Physics.Arcade.Body
                    | undefined;
                if (body) {
                    body.allowGravity = true;

                    const dragTime = this.time.now - this.dragStartTime;
                    const dragDistanceX = pointer.x - this.dragStartX;
                    const dragDistanceY = pointer.y - this.dragStartY;

                    const velocityX = (dragDistanceX / Math.max(dragTime, 1)) *
                        this.throwFactor * 1000;
                    const velocityY = (dragDistanceY / Math.max(dragTime, 1)) *
                        this.throwFactor * 1000;

                    const clampedVelocityX = Phaser.Math.Clamp(
                        velocityX,
                        -this.maxThrowVelocity,
                        this.maxThrowVelocity,
                    );
                    const clampedVelocityY = Phaser.Math.Clamp(
                        velocityY,
                        -this.maxThrowVelocity,
                        this.maxThrowVelocity,
                    );

                    body.setVelocity(clampedVelocityX, clampedVelocityY);
                }
            },
        );
    }

    private adicionaChao(groundY: number) {
        this.ground = this.add.rectangle(
            0,
            groundY,
            this.scale.width * 2,
            100,
            0x228B22,
        ).setOrigin(0, 0);
    }

    private adicionaLixeiras(groundY: number) {
        const escalaLixeiras = 0.2;

        const inicio = (this.sys.canvas.width / 2) - (this.areaLixeiras / 2);

        lixeiras.forEach((lixeira, index) => {
            const areaDeUmaLixeira = this.areaLixeiras / lixeiras.length;
            const posicaoX = inicio + (areaDeUmaLixeira * (index + 0.5));

            const img = new Lixeira(this, posicaoX, groundY - 10, lixeira);
            img.tipo = lixeira;

            const escala = this.escalarX(escalaLixeiras, this.areaLixeiras);
            img.setScale(escala);
            this.lixeiraObjetos.push(img);
        });
    }

    override update(time: number, delta: number): void {
        this.timeElapsed += delta;
        if (this.timeElapsed >= this.spawnInterval) {
            this.timeElapsed = 0;
            this.criarLixo();
        }
    }

    private criarLixo() {
        const minX = this.scale.width / 2 - this.areaLixeiras / 2;
        const maxX = minX + this.areaLixeiras;
        const randomX = Phaser.Math.Between(minX, maxX);
        const randomIndex = Phaser.Math.Between(0, lixos.length - 1);

        const image = new Lixo(
            this,
            randomX,
            50,
            lixos[randomIndex].nome,
            lixos[randomIndex].lixeiraTipo,
        );

        const escalaInicial = 0.1;
        const escala = this.escalarX(escalaInicial, this.screenWidth);
        const escalaFinal = escala > escalaInicial ? escalaInicial : escala;

        image.setScale(escalaFinal);

        this.images.push(image as unknown as Phaser.GameObjects.Image);
        if (this.images.length > this.maxLixos) {
            const img = this.images.shift();
            img?.destroy();
        }

        this.physics.world.on(
            "worldbounds",
            (body: Phaser.Physics.Arcade.Body) => {
                if (body.blocked.down && body.gameObject === image) {
                    image.destroy();
                }
            },
        );

        this.lixeiraObjetos.forEach((lixeira) => {
            this.physics.add.collider(image, lixeira, (p, pS) => {
                const tipo = image.lixeiraTipo;
                image.destroy();

                if (tipo === lixeira.tipo) {
                    this.acerto(lixeira);
                } else {
                    this.erro(lixeira);
                }
            });
        });
    }

    private acerto(lixeira: Lixeira) {
        lixeira.setTint(0x00ff00);
        lixeira.setScale(lixeira.scale * 1.05);
        this.sound.play(sons.lixoCerto);

        this.time.delayedCall(200, () => {
            lixeira.clearTint();
            lixeira.setScale(lixeira.scale / 1.05);
        });

        this.spawnInterval = this.spawnInterval * 0.95;
        if (this.spawnInterval < 500) {
            this.spawnInterval = 500;
        }

        this.pontos += 10;
        this.atualizaGameText();
    }

    private erro(lixeira: Lixeira) {
        lixeira.setTint(0xff0000);
        lixeira.setScale(lixeira.scale * 0.95);
        this.sound.play(sons.lixoErrado);
        this.vidas -= 1;
        const coracaoParaRemover = this.coracoes.pop();
        coracaoParaRemover?.apagar();

        this.time.delayedCall(200, () => {
            lixeira.clearTint();
            lixeira.setScale(lixeira.scale / 0.95);
        });

        this.spawnInterval = this.spawnInterval * 1.1;
        if (this.spawnInterval > 3000) {
            this.spawnInterval = 3000;
        }

        if (this.vidas <= 0) {
            this.time.delayedCall(1000, () => {
                this.changeScene();
            });
        }
    }

    changeScene() {
        this.scene.start("GameOver", { score: this.pontos });
    }

    private configuraPontuacao() {
        const tamanhoTexto = this.escalarX(100, this.screenWidth, 30);

        const style: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: "Arial",
            fontSize: `${tamanhoTexto}px`,
            color: "#ffffff",
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: "#000000",
                blur: 5,
            },
        };

        const x = 10;
        this.pontuacao = this.add.text(x, 10, `Pontos: ${this.pontos}`, style)
            .setOrigin(0, 0);
        const alturaCoracao = this.coracoes[0].displayHeight;

        this.pontuacao.y = alturaCoracao + alturaCoracao / 2;
        this.pontuacao.x = ((this.camera.width - this.areaLixeiras) / 2) + 10;
        this.pontuacao.setDepth(0);
    }

    private atualizaGameText() {
        if (this.pontuacao) {
            this.pontuacao.setText(`Pontos: ${this.pontos}`);
        }
    }

    private escalarX(x: number, tamanhoTela: number, max?: number): number {
        const escala = (x * tamanhoTela) / this.defaultWidth;
        if (max) {
            const retorno = escala < max ? escala : max;
            return retorno;
        }

        const retorno = escala;
        return retorno;
    }
}
