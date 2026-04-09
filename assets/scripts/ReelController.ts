import {_decorator, Component, Node, tween, v3} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ReelController')
export class ReelController extends Component {
    @property(Node)
    private contentNode: Node = null;

    private symbols: Node[] = [];
    private symbolSize: number = 80;
    private idleCount: number = 12;
    private displayCount: number = 3;  // 遮罩内显示的个数

    private isSpinning: boolean = false;
    private speed: number = 0; // 当前滚动速度
    private targetY: number = 0; // 目标停止位置
    private currentMoveDistance: number = 0; // 本次旋转已移动的距离

    onLoad() {
        // 1. 获取所有子节点并初始化位置
        this.symbols = this.contentNode.children;
        // this.initSymbols();
    }

    // initSymbols() {
    //     for (let i = 0; i < this.idleCount; i++) {
    //         const size = Object.keys(SYMBOL_MAP).length;
    //         const key = Object.keys(SYMBOL_MAP)[Math.floor(Math.random() * size)];
    //         const symbolNode = this.symbols[i];
    //         const label = symbolNode.getComponent(Label);
    //         label.string = SYMBOL_MAP[key];
    //     }
    // }

    resetSymbols() {
        for (let i = 0; i < this.symbols.length; i++) {
            // 初始排布：0在中间，1在0下面，以此类推
            this.symbols[i].setPosition(0, -i * this.symbolSize, 0);
        }
    }

    update(dt: number) {
        if (!this.isSpinning) return;

        // 2. 每一帧移动所有节点
        const moveStep = this.speed * dt;
        this.currentMoveDistance += moveStep;

        for (let symbol of this.symbols) {
            let pos = symbol.position;
            let newY = pos.y + moveStep; // 向上滚动

            // 3. 【核心】跑出顶部的节点 瞬移回 底部
            // 假设上方边界是 symbolSize * 2, 下方边界是 -symbolSize * (totalCount - 2)
            const topBoundary = this.symbolSize * 2;
            const bottomBoundary = - (this.symbols.length - 2) * this.symbolSize;

            if (newY > topBoundary) {
                newY = bottomBoundary + (newY - topBoundary);
            }

            symbol.setPosition(pos.x, newY, 0);
        }
    }

    /**
     * @param stopIndex 最终要停在中间的那个 symbol 的索引
     */
    spin(stopIndex: number) {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.speed = 1000; // 初始高速

        // 模拟滚动 3 秒后减速停止
        this.scheduleOnce(() => {
            this.stopAt(stopIndex);
        }, 2.0);
    }

    private stopAt(index: number) {
        // 这里的逻辑可以改为：慢慢降低 speed，
        // 并在某个 Symbol 刚好对齐中心线时，将 isSpinning 设为 false。
        // 为了简单演示，直接停：
        this.isSpinning = false;
        this.alignToIndex(index);
    }

    private alignToIndex(index: number) {
        // 1. 找到目标 Symbol 节点 (假设节点的 name 或者 siblingIndex 对应你的 index)
        const targetNode = this.symbols[index];
        if (!targetNode) return;

        // 2. 计算目标节点当前位置到 Y=0 的距离
        // 注意：因为我们在 update 里是向上滚(y增加)，所以这里计算相对偏移
        const currentY = targetNode.position.y;

        // 3. 为了让停止动作更自然（有一个回弹或平滑减速），我们对所有节点执行 tween
        // 我们不需要管每个节点具体在哪，只需要让它们整体移动同样的“距离差”
        const offset = -currentY; // 目标是让 targetNode.y 变成 0

        this.symbols.forEach(symbol => {
            const startPos = symbol.position.clone();
            tween(symbol)
                .by(0.5, { position: v3(0, offset, 0) }, {
                    easing: 'backOut' // 使用 backOut 增加 Slot 常见的“回弹”感
                })
                .call(() => {
                    this.isSpinning = false;
                    // 4. 【关键】由于发生了位移，停止后需要再次检查边界，防止节点停在遮罩外太远
                    this.checkBoundary(symbol);
                })
                .start();
        });

        console.log(`已对齐到索引: ${index}, 偏移量: ${offset}`);
    }

    /**
     * 辅助方法：确保对齐动画结束后，超出边界的节点依然能回到循环队列中
     */
    private checkBoundary(symbol: Node) {
        const topBoundary = this.symbolSize * 2;
        const bottomBoundary = - (this.symbols.length - 2) * this.symbolSize;
        let pos = symbol.position;
        let newY = pos.y;

        if (newY > topBoundary) {
            newY -= (this.symbols.length * this.symbolSize);
        } else if (newY < bottomBoundary) {
            newY += (this.symbols.length * this.symbolSize);
        }

        symbol.setPosition(pos.x, newY, 0);
    }

}
