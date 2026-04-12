import {_decorator, Color, Component, Graphics, tween, Vec3} from 'cc';
import {Entry, SlotRes} from "db://assets/scripts/Api";
import {LINE_COLOR, SYMBOL_SIZE} from "db://assets/scripts/Data";

const { ccclass, property } = _decorator;

@ccclass('EffectController')
export class EffectController extends Component {
    start() {
    }

    removeLines() {

        const g = this.getComponent(Graphics);
        if (!g) return;
        g.clear();
    }

    setLines(duration:number, slotRes: SlotRes, finish: ()=>void) {

        const g = this.getComponent(Graphics);
        if (!g) return;

        // Force set a material if it's missing (usually builtin-graphics)
        g.lineWidth = 6;

        // let data = { progress: 0 };
        //
        // const startPos = new Vec3(-160, -80, 0);
        // const endPos = new Vec3(160, 80, 0);
        // tween(data)
        //     .to(2, { progress: 1 }, {
        //         onUpdate: () => {
        //             g.clear();
        //             // Draw
        //             g.moveTo(startPos.x, startPos.y);
        //             let curX = startPos.x + (endPos.x - startPos.x) * data.progress;
        //             let curY = startPos.y + (endPos.y - startPos.y) * data.progress;
        //             g.lineTo(curX, curY);
        //
        //             // Critical: Fill and Stroke
        //             g.stroke();
        //         }
        //     })
        //     .start();

        if (!slotRes.lines || slotRes.lines.length<=0) {
            finish();
            return;
        }

        let data = { progress: 0 };
        tween(data)
            .to(duration, { progress: 1 }, {
                onUpdate: () => {
                    g.clear();
                    const lines = slotRes.lines;
                    // const lines = [
                    //     {k:[0,1,2], v:2},
                    //     {k:[3,4,5], v:2},
                    //     {k:[6,7,8], v:2},
                    //     {k:[9,10,11], v:2},
                    //     {k:[12,13,14], v:2},
                    // ];
                    // Loop through every line and draw it
                    lines.forEach((value, index, array) => {
                        this.drawPolyline(g, value, slotRes.rows, slotRes.cols, data.progress);
                    });
                }
            })
            .call(() => finish())
            .start();


    }

    drawPolyline(g: Graphics, line:Entry<number[], number>, rows: number, cols: number, progress: number) {
        if (line.k.length < 2) return;

        // Total number of segments
        const segmentCount = line.k.length - 1;
        // Current progress scaled to segment count
        const totalProgress = progress * segmentCount;
        // Which segment are we currently drawing?
        const currentSegmentIndex = Math.floor(totalProgress);
        // Progress within that specific segment
        const segmentProgress = totalProgress - currentSegmentIndex;

        // 1. Draw all fully completed segments
        g.strokeColor = new Color().fromHEX(LINE_COLOR[line.v]);
        let sourcePos = this.getPosByIndex(line.k[0], rows, cols);
        g.moveTo(sourcePos.x, sourcePos.y);
        for (let i = 0; i < currentSegmentIndex; i++) {
            const targetPos = this.getPosByIndex(line.k[i + 1], rows, cols);
            g.lineTo(targetPos.x, targetPos.y);
        }

        // 2. Draw the partial "growing" segment
        if (currentSegmentIndex < segmentCount) {
            const start = this.getPosByIndex(line.k[currentSegmentIndex], rows, cols);
            const end = this.getPosByIndex(line.k[currentSegmentIndex + 1], rows, cols);
            const curX = start.x + (end.x - start.x) * segmentProgress;
            const curY = start.y + (end.y - start.y) * segmentProgress;
            g.lineTo(curX, curY);
        }

        g.stroke();
    }

    getPosByIndex(index: number, rows: number, cols: number): Vec3 {
        const col = Math.floor(index / rows);
        const row = index % rows;
        console.info(`index=${index},col=${col},row=${row},`);
        return new Vec3((col-(cols-1)/2) * SYMBOL_SIZE, (row-(rows-1)/2) * SYMBOL_SIZE, 0);
    }

    update(deltaTime: number) {

    }
}


