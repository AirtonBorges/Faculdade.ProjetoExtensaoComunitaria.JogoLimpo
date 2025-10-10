import { Scene } from "phaser";

import { EventBus } from "../EventBus";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    images: Phaser.GameObjects.Image[] = [];
    timeElapsed: number = 0;
    imagens = [
        "copo",
        "garrafa",
        "garrafa3",
        "latinha",
        "latinha2",
        "latinha3",
        "papel2",
        "papel3",
    ];

    constructor() {
        super("Game");
    }

    preload() {
        this.load.setPath("assets/lixo");
        this.imagens.forEach(p => {
            this.load.image(p, `${p}.png`);
        });
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x87ceeb);

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
        const randomIndex = Phaser.Math.Between(0, this.imagens.length - 1);
        const image = this.physics
            .add
            .image(randomX, 0, this.imagens[randomIndex])
            .setOrigin(0.5)
        ;

        image.setScale(0.5);
        image.setInteractive();
        this.input.setDraggable(image);

        if (typeof (image as any).setBounce === "function") {
            (image as any).setBounce(0.2);
        }
        if (typeof (image as any).setCollideWorldBounds === "function") {
            (image as any).setCollideWorldBounds(true);
        }

        this.images.push(image as unknown as Phaser.GameObjects.Image);
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}
