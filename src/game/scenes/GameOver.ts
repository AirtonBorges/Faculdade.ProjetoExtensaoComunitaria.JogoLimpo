import { Scene } from "phaser";

import { EventBus } from "../EventBus";

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText: Phaser.GameObjects.Text;
    urlForm: string = "https://forms.office.com/r/6RXFuNMRED";

    constructor() {
        super("GameOver");
    }

    preload() {
        this.camera = this.cameras.main;

        this.load.setPath("assets/fim-jogo");
        this.load.image("background", "background.png");

        this.load.image("qrcode", "qrcode.png");
    }

    create() {
        const centerX = this.camera.width / 2;
        const centerY = this.camera.height / 2;
        this.camera.setBackgroundColor("#7f8a41");

        this.background = this.add.image(centerX, centerY, "background");
        let width = this.camera.width;
        if (width > 600) {
            width = 600;
        }

        this.background.setDisplaySize(width, this.camera.height);
        this.background.setDisplayOrigin(
            this.background.width / 2,
            this.background.height / 2,
        );
        this.background.setDepth(-1);

        this.gameOverText = this.add.text(
            centerX,
            centerY - 60,
            "Fim de jogo!",
            {
                fontFamily: "Arial",
                fontSize: "64px",
                color: "#ffffff",
                shadow: {
                    offsetX: 5,
                    offsetY: 5,
                    color: "#000000",
                    blur: 10,
                },
            },
        ).setOrigin(0.5);

        this.add.text(
            centerX,
            centerY + 50,
            "Agradecemos por jogar!\nPor favor, preencha o formulário abaixo:",
            {
                fontFamily: "Arial",
                fontSize: "24px",
                color: "#ffffff",
                align: "center",
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: "#000000",
                    blur: 5,
                },
            },
        ).setOrigin(0.5);

        const qrCode = this.add.image(centerX, centerY + 170, "qrcode");
        qrCode.setDisplaySize(150, 150);
        qrCode.setOrigin(0.5);
        qrCode.setInteractive({ useHandCursor: true });
        qrCode.on("pointerdown", () => {
            window.open(this.urlForm, "_blank");
        });

        EventBus.emit("game-over");
    }

    changeScene() {
        this.scene.start("MainMenu");
    }
}
