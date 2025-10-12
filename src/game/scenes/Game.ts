import { Collision } from 'matter';
import { Scene } from "phaser";

import { EventBus } from "../EventBus";

const lixeiras = [
    "lixeira-azul",
    "lixeira-verde",
    "lixeira-amarela",
    "lixeira-vermelha",
] as const;

export const sons = {
    lixoCerto: "acerto",
    lixoErrado: "erro",
} as const;

export type lixeiraTipo = typeof lixeiras[number];
export class Lixo {
    tipo: lixeiraTipo;
    nome: string;
}

export type lixeiraComTipo = Phaser.GameObjects.Image & { tipo: lixeiraTipo };

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    images: Phaser.GameObjects.Image[] = [];
    timeElapsed: number = 0;

    lixo: Lixo[] = [
        { nome: "copo", tipo: "lixeira-vermelha" },
        { nome: "garrafa", tipo: "lixeira-verde" },
        { nome: "garrafa3", tipo: "lixeira-verde" },
        { nome: "latinha", tipo: "lixeira-amarela" },
        { nome: "latinha2", tipo: "lixeira-amarela" },
        { nome: "latinha3", tipo: "lixeira-amarela" },
        { nome: "papel2", tipo: "lixeira-azul" },
        { nome: "papel3", tipo: "lixeira-azul" },
    ];

    ground: Phaser.GameObjects.Rectangle;
    screenWidth: number;
    screenHeight: number;
    areaLixeiras: number;

    defaultWidth = 800;
    defaultHeight = 800;
    spawnInterval = 3000;
    maxLixos = 20;
    dragStartTime = 0;
    dragStartX = 0;
    dragStartY = 0;
    throwFactor = 0.5;
    maxThrowVelocity = 800;

    lixeiraObjetos: lixeiraComTipo[] = [];

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
        this.lixo.forEach((p) => {
            this.load.image(p.nome, `${p.nome}.png`);
        });

        this.load.setPath("assets/lixeiras");
        lixeiras.forEach((p) => {
            this.load.image(p, `${p}.png`);
        });

        this.load.setPath("assets/sons");
        const arquivoAcerto = "476178__unadamlar__correct-choice.wav";
        const arquivoErro = "131657__bertrof__game-sound-wrong.wav";

        this.load.audio(sons.lixoCerto, arquivoAcerto);
        this.load.audio(sons.lixoErrado, arquivoErro);
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x87ceeb);
        const groundY = this.scale.height;

        this.adicionaChao(groundY);
        this.adicionaLixeiras(groundY);
        this.configuraEventos();

        EventBus.emit("current-scene-ready", this);
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
                    if (typeof body.reset === "function") {
                        body.reset(dragX, dragY);
                    } else {
                        body.x = dragX;
                        body.y = dragY;
                    }
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

            const img = this.add
                .image(posicaoX, groundY, lixeira)
                .setOrigin(0.51, 0.52) as lixeiraComTipo;

            const escala = this.escalarX(escalaLixeiras, this.areaLixeiras);
            img.setScale(escala);
            img.tipo = lixeira;
            this.lixeiraObjetos.push(img);
            this.physics.add.existing(img, true);
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
        const randomIndex = Phaser.Math.Between(0, this.lixo.length - 1);

        const image = this.physics
            .add
            .image(randomX, 2, this.lixo[randomIndex].nome)
            .setOrigin(0.5);

        const escalaInicial = 0.3;
        const escala = this.escalarX(escalaInicial, this.screenWidth);
        const escalaFinal = escala > escalaInicial
            ? escalaInicial
            : escala
        ;

        image.setScale(escalaFinal);
        image.setInteractive();
        this.input.setDraggable(image);

        image.setBounce(0.2);
        image.setCollideWorldBounds(true);

        image.body.onWorldBounds = true;
        image.body.world.on;
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
                image.destroy();

                if (this.lixo[randomIndex].tipo === lixeira.tipo) {
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
                }
                else {
                    lixeira.setTint(0xff0000);
                    lixeira.setScale(lixeira.scale * 0.95);
                    this.sound.play(sons.lixoErrado);

                    this.time.delayedCall(200, () => {
                        lixeira.clearTint();
                        lixeira.setScale(lixeira.scale / 0.95);
                    });

                    this.spawnInterval = this.spawnInterval * 1.1;
                    if (this.spawnInterval > 3000) {
                        this.spawnInterval = 3000;
                    }
                }
            });
        });
    }

    changeScene() {
        this.scene.start("GameOver");
    }

    private escalarX(x: number, tamanhoTela: number): number {
        const retorno = (x * tamanhoTela) / this.defaultWidth;
        return retorno;
    }
}
