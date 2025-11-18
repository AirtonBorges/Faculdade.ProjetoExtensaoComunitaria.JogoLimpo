import { AUTO, Game } from "phaser";

import { Game as GameScene } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: "game-container",
    backgroundColor: "#7f8a41",
    scale: {
        mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        expandParent: true,
        height: "100%",
        width: "100%",
        resizeInterval: 100,
    },
    physics: { default: "arcade", arcade: { gravity: { y: 300, x: 0 } } },
    scene: [GameScene, GameOver],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
