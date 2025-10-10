import { Component, viewChild } from '@angular/core';
import { PhaserGame } from './phaser-game.component';
import { CommonModule } from '@angular/common';
import { EventBus } from '../game/EventBus';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, PhaserGame],
    templateUrl: './app.component.html'
})
export class AppComponent
{
    public spritePosition = { x: 0, y: 0 };
    public canMoveSprite = false;

    // New way to get the component instance
    phaserRef = viewChild.required(PhaserGame);

    constructor()
    {
        // You can now safely set up your EventBus subscriptions here
        EventBus.on('current-scene-ready', (scene: Phaser.Scene) => {
            this.canMoveSprite = scene.scene.key !== 'MainMenu';
        });
    }

    public changeScene()
    {

    }

    public moveSprite()
    {

    }

    public addSprite()
    {

    }
}
