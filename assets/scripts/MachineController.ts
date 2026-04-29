import {_decorator, Component, Label, Node, tween, v3, Vec3} from 'cc';
import {SlotRes} from './Api';
import {SYMBOL_MAP, SYMBOL_SIZE} from "db://assets/scripts/Data";
import {EffectController} from "db://assets/scripts/EffectController";

const {ccclass, property} = _decorator;

@ccclass('MachineController')
export class MachineController extends Component {

    isSpinning: boolean = false;

    initSymbols(idles:number, effectNode: Node): number[] {
        const idleSymbols:number[] = [];
        effectNode.getComponent(EffectController).removeLines();
        this.node.children.forEach((reel, i) => {
            const contentNode = reel.getChildByName("Content");
            const size = Object.keys(SYMBOL_MAP).length;
            contentNode.children.forEach((symbol, j) => {
                if (j<idles) {
                    const key = Object.keys(SYMBOL_MAP)[Math.floor(Math.random() * size)];
                    idleSymbols.push(Number(key));
                    symbol.getChildByName("Label").getComponent(Label).string = SYMBOL_MAP[key];
                }
            });
        });
        return idleSymbols;
    }

    spin(duration:number, idles: number, slotRes: SlotRes, effectNode: Node, finish: ()=>void ) {
        this.node.children.forEach((reel, i) => {
            const contentNode = reel.getChildByName("Content");
            contentNode.children.forEach((symbol, j) => {
                if (j>=idles) {
                    symbol.getChildByName("Label").getComponent(Label).string = SYMBOL_MAP[slotRes.symbols[i*slotRes.rows+j-idles]];
                }
            });
        });
        const distance = SYMBOL_SIZE * idles;
        console.info("distance", distance);
        const easing = 'cubicBezier(0.25, 0.46, 0.5, 0.94)';
        const initPos = new Vec3(0, idles/2*SYMBOL_SIZE, 0);
        const lastPos = new Vec3(0, initPos.y-distance, 0);
        console.info("initPos", initPos);
        console.info("lastPos", lastPos);
        const reels = this.node.children;
        const promises = reels.map((reel, i) => {
            const contentNode = reel.getChildByName("Content");
            contentNode.setPosition(initPos);
            return new Promise<void>(resolve => {
                tween(contentNode)
                    .by(duration, { position: v3(0, -distance, 0) }, {
                        easing: 'backOut' // 使用 backOut 增加 Slot 常见的“回弹”感
                        // easing: 'cubicBezier(0.25, 0.46, 0.5, 0.94)'
                    })
                    .call(() => {
                        contentNode.setPosition(lastPos);
                        resolve();
                    })
                    .start();
            });
        });
        Promise.all(promises).then(() => {

            // slotRes.multiples
            let multipleNode = this.node.children[1].getChildByName("Content").children[13];
            let fontSize = multipleNode.getChildByName('Label').getComponent(Label).fontSize;
            let obj = { value: 0.5 };
            tween(obj)
                .to(duration, { value: 1.5 }, {
                    // 每帧更新回调
                    onUpdate: () => {
                        multipleNode.getChildByName('Label').getComponent(Label).fontSize=Math.round(obj.value*fontSize);
                    },
                    // 设置缓动效果（可选），例如 SineOut 让动画结束时变慢
                    easing: 'sineOut',
                }).call(() => {
                    multipleNode.getChildByName('Label').getComponent(Label).fontSize=fontSize;
                })
                .start();
            // slotRes.scatters
            let scatterNode = this.node.children[2].getChildByName("Content").children[13];
            let string = scatterNode.getChildByName('Label').getComponent(Label).string;
            tween(obj)
                .to(duration, { value: 2 }, {
                    // 每帧更新回调
                    onUpdate: () => {
                        scatterNode.getChildByName('Label').getComponent(Label).string=Math.round((2-obj.value)*10)%2==0?string:'';
                    },
                    // 设置缓动效果（可选），例如 SineOut 让动画结束时变慢
                    easing: 'sineOut',
                }).call(() => {
                    scatterNode.getChildByName('Label').getComponent(Label).string=string;
                })
                .start();
            effectNode.getComponent(EffectController).setLines(duration, slotRes, finish);
        });

        // reels.forEach((reel, i) => {
        //     const contentNode = reel.getChildByName("Content");
        //     contentNode.setPosition(initPos);
        //     tween(contentNode)
        //         .by(duration, { position: v3(0, -distance, 0) }, {
        //             easing: 'backOut' // 使用 backOut 增加 Slot 常见的“回弹”感
        //             // easing: 'cubicBezier(0.25, 0.46, 0.5, 0.94)'
        //         })
        //         .call(() => {
        //             contentNode.setPosition(lastPos);
        //             const finish = ()=> {
        //                 this.isSpinning = false;
        //                 console.info('finished!');
        //             }
        //             effectNode.getComponent(EffectController).setLines(duration, slotRes, finish);
        //             // const g = this.getComponent(Graphics);
        //             // // 1. 基础样式设置
        //             // g.lineWidth = 10;
        //             // g.strokeColor.fromHEX('#00FBFF'); // 高亮青色
        //             // const startPos = new Vec3(0, 0, 0);   // 起点
        //             // const endPos = new Vec3(200, 200, 0); // 终点
        //             //
        //             // // 2. 使用一个对象来记录动画进度 (0 到 1)
        //             // let ratio = { value: 0 };
        //             //
        //             // tween(ratio)
        //             //     .to(1.5, { value: 1 }, {
        //             //         onUpdate: () => {
        //             //             // 每次更新都重新绘制
        //             //             g.clear();
        //             //             g.moveTo(startPos.x, startPos.y);
        //             //
        //             //             // 根据进度计算当前的终点坐标
        //             //             let curX = startPos.x + (endPos.x - startPos.x) * ratio.value;
        //             //             let curY = startPos.y + (endPos.y - startPos.y) * ratio.value;
        //             //
        //             //             g.lineTo(curX, curY);
        //             //             g.stroke(); // 必须调用 stroke 才会显示
        //             //         }
        //             //     })
        //             //     .start();
        //             // if (slotRes.lines) {
        //             //     slotRes.lines.forEach(line=>{
        //             //         tween(progress)
        //             //             .to(1, { value: 1 }, {
        //             //                 onUpdate: () => {
        //             //                     g.clear();
        //             //                     g.moveTo(-200, 0);
        //             //                     // 计算当前进度的终点
        //             //                     let currentX = 200 * progress.value;
        //             //                     let currentY = 0;
        //             //                     g.lineTo(currentX, currentY);
        //             //                     g.stroke();
        //             //                 }
        //             //             })
        //             //             .start();
        //             //     });
        //             // }
        //         })
        //         .start();
        // });
    }
}
