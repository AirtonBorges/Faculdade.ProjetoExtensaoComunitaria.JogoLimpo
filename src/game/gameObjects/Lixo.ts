import { LixeiraTipo } from "./Lixeira";

export class LixoComTipoLixeira {
    lixeiraTipo: LixeiraTipo;
    nome: string;
}

export const lixos: LixoComTipoLixeira[] = [
    { nome: "GarrafaDeVidro1SemFundo", lixeiraTipo: "lixeira-verde" },
    { nome: "GarrafaDeVidro2SemFundo", lixeiraTipo: "lixeira-verde" },
    { nome: "GarrafaDeVidro3SemFundo", lixeiraTipo: "lixeira-verde" },
    { nome: "Lata1SemFundo", lixeiraTipo: "lixeira-amarela" },
    { nome: "Lata2SemFundo", lixeiraTipo: "lixeira-amarela" },
    { nome: "Lata3SemFundo", lixeiraTipo: "lixeira-amarela" },
    { nome: "Papel2SemFundo", lixeiraTipo: "lixeira-azul" },
    { nome: "Papel3SemFundo", lixeiraTipo: "lixeira-azul" },
    { nome: "SacolaPlasticaSemFundo", lixeiraTipo: "lixeira-vermelha" },
    { nome: "TampaDeGarrafaSemFundoPlastico", lixeiraTipo: "lixeira-vermelha" },
    { nome: "CopoPlasticoSemFundo", lixeiraTipo: "lixeira-vermelha" },
];

export class Lixo extends Phaser.Physics.Arcade.Image {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        tipo: LixeiraTipo,
    ) {
        super(scene, x, y, texture);
        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.myBody = this.body as Phaser.Physics.Arcade.Body;

        this.setInteractive();
        scene.input.setDraggable(this);

        this.setBounce(0.2);
        this.setCollideWorldBounds(true);

        this.myBody.onWorldBounds = true;
        this.lixeiraTipo = tipo;
    }

    lixeiraTipo: LixeiraTipo;
    myBody: Phaser.Physics.Arcade.Body;
}
