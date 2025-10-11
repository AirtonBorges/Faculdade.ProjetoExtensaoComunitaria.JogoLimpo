import { ThisReceiver } from '@angular/compiler';
import { Scene } from "phaser";

import { EventBus } from "../EventBus";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    images: Phaser.GameObjects.Image[] = [];
    timeElapsed: number = 0;
    lixo = [
        "copo",
        "garrafa",
        "garrafa3",
        "latinha",
        "latinha2",
        "latinha3",
        "papel2",
        "papel3",
    ];

    lixeiras = [
        "lixeira-azul",
        "lixeira-verde",
        "lixeira-amarela",
        "lixeira-vermelha",
    ];

    ground: Phaser.GameObjects.Rectangle;
    screenWidth: number;
    screenHeight: number;
    areaLixeiras: number;
    defaultWidth = 800;
    defaultHeight = 800;
    spawnInterval = 1000;
    maxLixos = 20;
    dragStartTime = 0;
    dragStartX = 0;
    dragStartY = 0;
    throwFactor = 0.5;
    maxThrowVelocity = 800;

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
            this.load.image(p, `${p}.png`);
        });

        this.load.setPath("assets/lixeiras");
        this.lixeiras.forEach((p) => {
            this.load.image(p, `${p}.png`);
        });
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x87ceeb);
        const groundY = this.scale.height >= this.defaultHeight
            ? this.scale.height
            : this.scale.height + (((this.scale.height / 10) * 3));

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

        this.lixeiras.forEach((lixeira, index) => {
            const areaDeUmaLixeira = this.areaLixeiras / this.lixeiras.length;
            const posicaoX = inicio + (areaDeUmaLixeira * (index + 0.5));
            const posicaoY = groundY;

            const img = this.add
                .image(posicaoX, groundY, lixeira)
                .setOrigin(0.51, 0.52);

            const escala = this.escalarX(escalaLixeiras, this.areaLixeiras);
            img.setScale(escala);
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
            .image(randomX, 2, this.lixo[randomIndex])
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
    }

    changeScene() {
        this.scene.start("GameOver");
    }

    private escalarX(x: number, tamanhoTela: number): number {
        const retorno = (x * tamanhoTela) / this.defaultWidth;
        return retorno;
    }
}
