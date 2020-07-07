const {ccclass, property} = cc._decorator;
import Cell from './Cell';
import { CellStatus } from './CellStatus';

@ccclass
export default class ReverseGrid extends cc.Component  {

    @property(cc.Prefab)
    Cell: cc.Prefab = null;

    static CellSize: number = 48; // セルのサイズ
    static XCount: number  = 8; // 盤の横方向のセル数
    static YCount: number  = 8; // 盤の縦方向のセル数

    m_Cells: Cell[][] = new Array();
    
    start () {
        // 全セルを初期化します。
        for (let x = 0; x < ReverseGrid.XCount; x++) {
            this.m_Cells[x] = new Array();
            for (let y = 0; y < ReverseGrid.YCount; y++) {
                const cell = cc.instantiate(this.Cell);
                this.m_Cells[x][y] = new Cell(this, cc.v2(x, y), cell);
                this.node.addChild(cell);
            }
        }

        // 描画位置調整
        const graphics = this.getComponent(cc.Graphics);
        graphics.node.setPosition(-((ReverseGrid.XCount * ReverseGrid.CellSize) / 2), -((ReverseGrid.YCount * ReverseGrid.CellSize) / 2));
        this.node.setContentSize(ReverseGrid.XCount * ReverseGrid.CellSize, ReverseGrid.YCount * ReverseGrid.CellSize);

        this.Draw(graphics);

        this.node.on(cc.Node.EventType.TOUCH_START, (event: any) => {
            const point = this.node.convertToNodeSpaceAR(event.getLocation());
            const cell = this.CellFromPoint(point.x, point.y);
            cell.Node.emit('SetStatus', CellStatus.Black);
        });
    }

    CellFromPoint(x: number, y: number): Cell {
        
        if (x < 0 || x >= ReverseGrid.XCount * ReverseGrid.CellSize) {
            return null;
        }

        if (y < 0 || y >= ReverseGrid.YCount * ReverseGrid.CellSize) {
            return null;
        }

        return this.Cells(Math.floor(x / ReverseGrid.CellSize), Math.floor(y / ReverseGrid.CellSize))
    }

    Cells(x: number, y: number): Cell {
        return this.m_Cells[x][y];
    }

    Draw(g: cc.Graphics) {
        g.clear();

        g.strokeColor = cc.Color.BLACK;
        g.fillColor = cc.color().fromHEX('#006400');
                     
        // 深緑の四角形
        g.fillRect(0, 0, ReverseGrid.XCount * ReverseGrid.CellSize, ReverseGrid.YCount * ReverseGrid.CellSize);

        // 縦の9本の線
        for (let x = 0; x < ReverseGrid.XCount + 1; x++) {
            g.moveTo(x * ReverseGrid.CellSize, 0);
            g.lineTo(x * ReverseGrid.CellSize, ReverseGrid.YCount * ReverseGrid.CellSize)
            g.stroke();
        }

        // 横の9本の線
        for (let y = 0; y < ReverseGrid.XCount + 1; y++) {
            g.moveTo(0, y * ReverseGrid.CellSize);
            g.lineTo(ReverseGrid.XCount * ReverseGrid.CellSize, y * ReverseGrid.CellSize)
            g.stroke();
        }
    }
}
