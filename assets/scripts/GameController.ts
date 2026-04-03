import {_decorator, Component, Event, Node} from 'cc';
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

    private onClick(event: Event) {

        play({slotCode:SlotCode.S001, action: Action.SPIN, player: 'test', bet: 20})
            .then(response=>{
                this.statusNode.getChildByName('Error').active=false;
                console.info('response=', response);
                const slotRes = response.data as SlotRes;
                console.info('slotRes=', slotRes);
                this.machineNode.getComponent(MachineController).spin(slotRes);
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
