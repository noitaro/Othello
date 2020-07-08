import {CellStatus} from './CellStatus';
import ReverseGrid from './ReverseGrid';

export default class Cell {

    // Grid: ReverseGrid = null;
    Position: cc.Vec2 = null; // 論理位置
    Rectangle: cc.Rect = null; // '物理位置
    Node: cc.Node = null;

    // コンストラクタ
    constructor(grid: ReverseGrid, position: cc.Vec2, node: cc.Node) {
        // this.Grid = grid;
        this.Position = position;
        this.Node = node;

        const rect = new cc.Rect();

        // 論理位置から物理位置を求めます。
        rect.x = position.x * ReverseGrid.CellSize + (ReverseGrid.CellSize / 2);
        rect.y = position.y * ReverseGrid.CellSize + (ReverseGrid.CellSize / 2);
        rect.width = ReverseGrid.CellSize;
        rect.height = ReverseGrid.CellSize;

        this.Rectangle = rect;
        this.Node.setPosition(rect.x, rect.y);
    }

    GetStatus(): CellStatus {
        const cellScript = this.Node.getComponent('CellScript');
        return cellScript.Status;
    }
    SetStatus(status: CellStatus, delay: number = 0) {
        const cellScript = this.Node.getComponent('CellScript');
        cellScript.SetStatus(status, delay);
    }
}
