import {_decorator, AudioSource, Button, Component, Event, Label, Node, Sprite, SpriteFrame, tween} from 'cc';
import {Action, play, SlotCode, SlotRes} from "db://assets/scripts/Api";
import {MachineController} from "db://assets/scripts/MachineController";

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(Node)
    headerNode: Node;
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

    private duration:number=1;
    private auto: boolean = false;
    private betAmount = 20;

    private amounts = [1,2,5,10,20,50,100,200,500,1000];

    // Play music
    onLoad() {
    }

    private onClickFlash(event: Event) {
        const flashNode = this.operationNode.getChildByName('Settings').getChildByName('Flash');
        if (this.duration === 1) {
            flashNode.getComponent(Sprite).spriteFrame = this.flashOffFile;
            this.duration = 2;
        } else {
            flashNode.getComponent(Sprite).spriteFrame = this.flashOnFile;
            this.duration = 1;
        }
    }

    private onClickAuto(event: Event) {
        const autoNode = this.operationNode.getChildByName('Functions').getChildByName('Auto');
        if (this.auto) {
            autoNode.getComponent(Sprite).spriteFrame = this.autoOffFile;
            this.auto = false;
            this.operationNode.getChildByName('Functions').getChildByName('Decrease').getComponent(Button).interactable=true;
            this.operationNode.getChildByName('Functions').getChildByName('Increase').getComponent(Button).interactable=true;
        } else {
            autoNode.getComponent(Sprite).spriteFrame = this.autoOnFile;
            this.auto = true;
            this.operationNode.getChildByName('Functions').getChildByName('Decrease').getComponent(Button).interactable=false;
            this.operationNode.getChildByName('Functions').getChildByName('Increase').getComponent(Button).interactable=false;
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
        const musicNode = this.operationNode.getChildByName('Settings').getChildByName('Music');
        if (this.operationNode.getComponent(AudioSource).playing) {
            this.operationNode.getComponent(AudioSource).pause();
            musicNode.getComponent(Sprite).spriteFrame = this.musicOffFile;
        } else {
            this.operationNode.getComponent(AudioSource).play();
            musicNode.getComponent(Sprite).spriteFrame = this.musicOnFile;
        }
    }

    private onMenuOpen(event: Event) {
        this.operationNode.getChildByName('Functions').active=false;
        this.operationNode.getChildByName('Settings').active=true;
    }

    private onMenuClose(event: Event) {
        this.operationNode.getChildByName('Functions').active=true;
        this.operationNode.getChildByName('Settings').active=false;
    }

    private onIntroOpen(event: Event) {
        this.operationNode.getChildByName('Intro').active=true;
    }

    private onIntroClose(event: Event) {
        this.operationNode.getChildByName('Intro').active=false;
    }

    private onClickSpin(event: Event) {
        const machine = this.machineNode.getComponent(MachineController);
        if (machine.isSpinning) {
            return;
        }
        machine.isSpinning=true;
        // init
        this.headerNode.getChildByName('Status').getComponent(Label).string=`Spinning`;
        this.operationNode.getChildByName('Amounts').getChildByName('Win').getChildByName('Label').getComponent(Label).string='0';
        const idles = 12;
        const idleSymbols = machine.initSymbols(idles, this.effectNode);

        const spinNode = this.operationNode.getChildByName('Functions').getChildByName('Spin');
        tween(spinNode)
            .by(this.duration, { angle: -1440 })
            .start();
        spinNode.getComponent(AudioSource).play();

        play({slotCode:SlotCode.S001, action: Action.SPIN, player: 'test', bet: 20, idleSymbols})
            .then(response=>{
                this.headerNode.getChildByName('Error').active=false;
                console.info('response=', response);
                const slotRes = response.data as SlotRes;
                console.info('slotRes=', slotRes);
                const finish = ()=> {
                    machine.isSpinning = false;
                    console.info('finished!');
                    if (slotRes.freeCount!==100) {
                        this.headerNode.getChildByName('Status').getComponent(Label).string=`Free X10`;
                    } else {
                        this.headerNode.getChildByName('Status').getComponent(Label).string=`Ready`;
                    }
                    if (slotRes.win!==1) {
                        let obj = { value: 0 };
                        tween(obj)
                            .to(this.duration, { value: 30 }, {
                                // 每帧更新回调
                                onUpdate: () => {
                                    this.operationNode.getChildByName('Amounts').getChildByName('Win').getChildByName('Label').getComponent(Label).string=Math.floor(obj.value).toString();
                                },
                                // 设置缓动效果（可选），例如 SineOut 让动画结束时变慢
                                easing: 'sineOut',
                            })
                            .start();
                    }
                    if (this.auto) {
                        setTimeout(() => {
                            this.onClickSpin(null);
                        }, this.duration*1000);
                    }
                }
                machine.spin(this.duration, idles, slotRes, this.effectNode, finish);
            }).catch(error=>{
                this.headerNode.getChildByName('Error').active=true;
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
