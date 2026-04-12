import {_decorator, AudioSource, Component, Event, Label, Node, Sprite, SpriteFrame, tween} from 'cc';
import {Action, play, SlotCode, SlotRes} from "db://assets/scripts/Api";
import {MachineController} from "db://assets/scripts/MachineController";

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(Node)
    statusNode: Node;
    @property(Node)
    machineNode: Node;
    @property(Node)
    operationNode: Node;

    @property(Node)
    effectNode: Node;

    @property(SpriteFrame)
    public musicOnFile: SpriteFrame = null;
    @property(SpriteFrame)
    public musicOffFile: SpriteFrame = null;
    @property(SpriteFrame)
    public flashOnFile: SpriteFrame = null;
    @property(SpriteFrame)
    public flashOffFile: SpriteFrame = null;
    @property(SpriteFrame)
    public autoOnFile: SpriteFrame = null;
    @property(SpriteFrame)
    public autoOffFile: SpriteFrame = null;

    private duration:number=2;
    private auto: boolean = false;
    private betAmount = 20;

    private amounts = [1,2,5,10,20,50,100,200,500,1000];

    // Play music
    onLoad() {
    }

    private onClickFlash(event: Event) {
        const flashNode = this.operationNode.getChildByName('Options').getChildByName('Flash');
        if (this.duration === 1) {
            flashNode.getComponent(Sprite).spriteFrame = this.flashOffFile;
            this.duration = 2;
        } else {
            flashNode.getComponent(Sprite).spriteFrame = this.flashOnFile;
            this.duration = 1;
        }
    }

    private onClickAuto(event: Event) {
        const autoNode = this.operationNode.getChildByName('Options').getChildByName('Auto');
        if (this.auto) {
            autoNode.getComponent(Sprite).spriteFrame = this.autoOffFile;
            this.auto = false;
        } else {
            autoNode.getComponent(Sprite).spriteFrame = this.autoOnFile;
            this.auto = true;
        }
    }

    private onClickDecrease(event: Event) {
        const betNode = this.operationNode.getChildByName('Amounts').getChildByName('Bet');
        const betAmount:number = betNode.getChildByName('Label').getComponent(Label).string as unknown as number;
        if (this.betAmount > this.amounts[0]) {
            this.betAmount = this.amounts[this.amounts.findIndex(value => value===this.betAmount)-1];
            betNode.getChildByName('Label').getComponent(Label).string = this.betAmount + '';
        }
    }

    private onClickIncrease(event: Event) {
        const betNode = this.operationNode.getChildByName('Amounts').getChildByName('Bet');
        const betAmount:number = betNode.getChildByName('Label').getComponent(Label).string as unknown as number;
        if (this.betAmount < this.amounts[this.amounts.length-1]) {
            this.betAmount = this.amounts[this.amounts.findIndex(value => value===this.betAmount)+1];
            betNode.getChildByName('Label').getComponent(Label).string = this.betAmount + '';
        }
    }

    private onClickMusic(event: Event) {
        const musicNode = this.operationNode.getChildByName('Functions').getChildByName('Music');
        if (musicNode.getComponent(AudioSource).playing) {
            musicNode.getComponent(AudioSource).pause();
            musicNode.getComponent(Sprite).spriteFrame = this.musicOffFile;
        } else {
            musicNode.getComponent(AudioSource).play();
            musicNode.getComponent(Sprite).spriteFrame = this.musicOnFile;
        }
    }

    private onClickSpin(event: Event) {
        const machine = this.machineNode.getComponent(MachineController);
        if (machine.isSpinning) {
            return;
        }
        machine.isSpinning=true;
        const spinNode = this.operationNode.getChildByName('Options').getChildByName('Spin');
        tween(spinNode)
            .by(this.duration, { angle: -1440 })
            .start();
        const idles = 12;
        machine.initSymbols(idles, this.effectNode);
        play({slotCode:SlotCode.S001, action: Action.SPIN, player: 'test', bet: 20})
            .then(response=>{
                this.statusNode.getChildByName('Error').active=false;
                console.info('response=', response);
                const slotRes = response.data as SlotRes;
                console.info('slotRes=', slotRes);
                machine.spin(this.duration, idles, slotRes, this.effectNode);
            // }).catch(error=>{
            //     this.statusNode.getChildByName('Error').active=true;
            });
        // const node = event.getCurrentTarget();
        // for (let i = 0; i < 5; i++) {
        //     const index = Math.floor(Math.random() * 10);
        //     const reelName = "Reel" + (i+1);
        //     const reelController: ReelController = this.machineNode.getChildByName(reelName).getComponent(ReelController);
        //     reelController.spin(i, );
        // }
    }

}
