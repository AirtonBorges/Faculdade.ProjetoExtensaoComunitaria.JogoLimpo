export const lixeiras = [
    "lixeira-azul",
    "lixeira-verde",
    "lixeira-amarela",
    "lixeira-vermelha",
] as const;

export type LixeiraTipo = typeof lixeiras[number];

export class Lixeira extends Phaser.Physics.Arcade.Image {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.setOrigin(0.51, 0.52);
        this.setInteractive();
        scene.physics.world.enable(this);
        this.myBody = this.body as Phaser.Physics.Arcade.Body;

        this.setImmovable(true);
        this.myBody.allowGravity = false;
    }

    myBody: Phaser.Physics.Arcade.Body;
    tipo: LixeiraTipo;
}
