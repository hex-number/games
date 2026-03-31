import {_decorator, Component, Event, Node} from 'cc';
import {ReelController} from "db://assets/scripts/ReelController";

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(Node)
    machineNode: Node;

    @property(Node)
    operationNode: Node;

    private onClick(event: Event) {
        const node = event.getCurrentTarget();
        for (let i = 0; i < 5; i++) {
            const index = Math.floor(Math.random() * 10);
            const reelName = "Reel" + (i+1);
            const reelController: ReelController = this.machineNode.getChildByName(reelName).getComponent(ReelController);
            reelController.spin(index);
        }
    }

}
