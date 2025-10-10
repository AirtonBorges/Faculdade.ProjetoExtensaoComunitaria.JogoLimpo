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

    lixeiras = ["lixeira-azul", "lixeira-verde", "lixeira-amarela", "lixeira-vermelha"];

    ground: Phaser.GameObjects.Rectangle;

    constructor() {
        super("Game");
    }

    preload() {
        this.load.setPath("assets/lixo");
        this.lixo.forEach(p => {
            this.load.image(p, `${p}.png`);
        });

        this.load.setPath("assets/lixeiras");
        this.lixeiras.forEach(p => {
            this.load.image(p, `${p}.png`);
        });
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x87ceeb);

        const groundY = this.scale.height - 50;
        this.ground = this.add.rectangle(0, groundY, this.scale.width * 2, 100, 0x228B22).setOrigin(0, 0);

        this.lixeiras.forEach((lixeira, index) => {
            const img = this.add.image(0, 0, lixeira).setOrigin(0.5);
            img.setScale(0.2);
            img.x = (index + 1) * (this.scale.width / (this.lixeiras.length + 1));
            img.y = groundY;
        });

        this.gameText = this.add
            .text(512, 100, "Pode arrastar!", {
                font: "48px Arial",
                color: "#000000",
            })
            .setOrigin(0.5);

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
                    body.setVelocity(0, 0);
                }
            },
        );

        EventBus.emit("current-scene-ready", this);
    }

    override update(time: number, delta: number): void {
        this.timeElapsed += delta;
        if (this.timeElapsed >= 500) {
            this.timeElapsed = 0;
            this.createImage();
        }
    }

    createImage() {
        const maxX = this.scale.width - 100;
        const randomX = Phaser.Math.Between(0, maxX);
        const randomIndex = Phaser.Math.Between(0, this.lixo.length - 1);
        const image = this.physics
            .add
            .image(randomX, 2, this.lixo[randomIndex])
            .setOrigin(0.5)
        ;

        image.setScale(0.5);
        image.setInteractive();
        this.input.setDraggable(image);

        image.setBounce(0.2);
        image.setCollideWorldBounds(true);

        image.body.onWorldBounds = true;
        image.body.world.on
        this.images.push(image as unknown as Phaser.GameObjects.Image);
        if (this.images.length > 20) {
            const img = this.images.shift();
            img?.destroy();
        }

        this.physics.world.on(
            "worldbounds",
            (body: Phaser.Physics.Arcade.Body) => {
                if (body.blocked.down && body.gameObject === image) {

                    image.destroy();
                }
            }
        );


    }

    changeScene() {
        this.scene.start("GameOver");
    }
}
