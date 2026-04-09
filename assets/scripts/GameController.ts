import {_decorator, AudioSource, Component, Event, Label, Node} from 'cc';
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

    private duration:number=2;

    // Play music
    onLoad() {
    }

    private onClickMusic(event: Event) {
        let musicNode = this.operationNode.getChildByName('Functions').getChildByName('Music');
        if (musicNode.getComponent(AudioSource).playing) {
            musicNode.getComponent(AudioSource).pause();
            musicNode.getChildByName('Label').getComponent(Label).string = '🔇';
        } else {
            musicNode.getComponent(AudioSource).play();
            musicNode.getChildByName('Label').getComponent(Label).string = '🔊';
        }
    }

    private onClickFlash(event: Event) {
        let flashNode = this.operationNode.getChildByName('Functions').getChildByName('Flash');
        if (flashNode.getChildByName('Label').getComponent(Label).isUnderline) {
            flashNode.getChildByName('Label').getComponent(Label).isUnderline=false;
            this.duration = 1;
        } else {
            flashNode.getChildByName('Label').getComponent(Label).isUnderline=true;
            this.duration = 2;
        }
    }

    private onClickPlay(event: Event) {
        const machine = this.machineNode.getComponent(MachineController);
        if (machine.isSpinning) {
            return;
        }
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
