const {ccclass, property} = cc._decorator;
import Cell from './Cell';
import { CellStatus } from './CellStatus';
import { ScanDirection } from './ScanDirection';

@ccclass
export default class ReverseGrid extends cc.Component  {

    @property(cc.Prefab)
    Cell: cc.Prefab = null;

    @property(cc.Node)
    Focused: cc.Node = null;

    @property(cc.Label)
    LblBlackCount: cc.Label = null;

    @property(cc.Label)
    LblWhiteCount: cc.Label = null;

    static CellSize: number = 48; // セルのサイズ
    static XCount: number  = 8; // 盤の横方向のセル数
    static YCount: number  = 8; // 盤の縦方向のセル数

    m_Cells: Cell[][] = new Array();
    Turn: CellStatus = CellStatus.Black; // 今どっちの順番か
    PlayerColor: CellStatus = CellStatus.Black; // プレイヤーの色
    
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
        const ReverseGridGraphics = this.getComponent(cc.Graphics);
        ReverseGridGraphics.node.setPosition(-((ReverseGrid.XCount * ReverseGrid.CellSize) / 2), -((ReverseGrid.YCount * ReverseGrid.CellSize) / 4));
        this.node.setContentSize(ReverseGrid.XCount * ReverseGrid.CellSize, ReverseGrid.YCount * ReverseGrid.CellSize);

        this.ReverseGridDraw(ReverseGridGraphics);

        this.node.on(cc.Node.EventType.TOUCH_START, (event: any) => {
            const point = this.node.convertToNodeSpaceAR(event.getLocation());
            const thisCell = this.CellFromPoint(point.x, point.y);

            if (this.Put(this.Turn, thisCell.Position.x, thisCell.Position.y)) {
                this.ChangeTurn();
            }

        });

        // アクティブ枠の描画設定
        this.Focused.setContentSize(ReverseGrid.CellSize, ReverseGrid.CellSize);
        const FocusedGraphics = this.Focused.getComponent(cc.Graphics);
        FocusedGraphics.enabled = false;
        this.FocusedDraw(FocusedGraphics);

        // マウスの移動に伴ってセルにアクティブを示す枠を描画する
        this.node.on(cc.Node.EventType.MOUSE_MOVE, (event: any) => {
            const point = this.node.convertToNodeSpaceAR(event.getLocation());
            const thisCell = this.CellFromPoint(point.x, point.y);
            this.Focused.setPosition(thisCell.Rectangle.x - (thisCell.Rectangle.width / 2), thisCell.Rectangle.y - (thisCell.Rectangle.height / 2));
        });
        this.node.on(cc.Node.EventType.MOUSE_ENTER, (event: any) => {
            FocusedGraphics.enabled = true;
        });
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, (event: any) => {
            FocusedGraphics.enabled = false;
        });

        this.Initialize();
        this.LblBlackCount.string = "" + this.Count(CellStatus.Black);
        this.LblWhiteCount.string = "" + this.Count(CellStatus.White);
        this.LblBlackCount.node.parent.opacity = 255;
        this.LblWhiteCount.node.parent.opacity = 100;
    }

    // ゲームを最初の状態にします
    Initialize() {

        // すべてのセルの状態を初期状態にする
        for (let x = 0; x < ReverseGrid.XCount; x++) {
            for (let y = 0; y < ReverseGrid.YCount; y++) {
                this.Cells(x, y).SetStatus(CellStatus.Nothing);
            }
        }

        // 初期配置
        this.Cells(3, 3).SetStatus(CellStatus.Black);
        this.Cells(3, 4).SetStatus(CellStatus.White);
        this.Cells(4, 3).SetStatus(CellStatus.White);
        this.Cells(4, 4).SetStatus(CellStatus.Black);
    }

    // ターン交代
    ChangeTurn() {

        // 勝敗判定
        if (this.Count(CellStatus.Nothing) == 0) {
            // 全セルへの配置が終了した場合は勝敗判定して終了
            if (this.Count(CellStatus.Black) > this.Count(CellStatus.White)) {
                setTimeout(() => alert("黒の勝ちです！"), 100);
            } else if (this.Count(CellStatus.Black) < this.Count(CellStatus.White)) {
                setTimeout(() => alert("白の勝ちです！"), 100);
            } 　else {
                setTimeout(() => alert("引き分けです！！"), 100);
            }
            return;
        } else if (this.PuttableCount(CellStatus.Black) == 0 && this.PuttableCount(CellStatus.White) == 0) {
            // 空いているセルがあるのに黒も白も置けない場合
            if (this.Count(CellStatus.Black) > this.Count(CellStatus.White)) {
                setTimeout(() => alert("黒の勝ちです！"), 100);
            } else if (this.Count(CellStatus.Black) < this.Count(CellStatus.White)) {
                setTimeout(() => alert("白の勝ちです！"), 100);
            } 　else {
                setTimeout(() => alert("引き分けです！！"), 100);
            }
            return;
        } else if (this.Count(CellStatus.Black) == 0) {
            // すべての石が白になった場合(=黒の石が0個の場合)
            setTimeout(() => alert("白の勝ちです！"), 100);
            return;
        } else if (this.Count(CellStatus.White) == 0) {
            // すべての石が黒になった場合(=白の石が0個の場合)
            setTimeout(() => alert("黒の勝ちです！"), 100);
            return;
        }

        // 次のターンの決定
        if (this.Turn == CellStatus.Black) {
            this.Turn = CellStatus.White;
            this.LblBlackCount.node.parent.opacity = 100;
            this.LblWhiteCount.node.parent.opacity = 255;
        } else {
            this.Turn = CellStatus.Black;
            this.LblBlackCount.node.parent.opacity = 255;
            this.LblWhiteCount.node.parent.opacity = 100;
        }

        // 置ける場所があるか判定
        if (this.PuttableCount(this.Turn) == 0) {
            // 置く場所がなければパスして次のターン
            this.ChangeTurn();
        }
    }

    // セルに石を置きます
    Put(status: CellStatus, x: number, y: number): boolean {

        // この位置に石が置けるか確認する
        if (!this.CanPut(status, x, y)) {
            return false;
        }

        // 石を置く
        this.Cells(x, y).SetStatus(this.Turn);

        // 周辺８方向の石をひっくり返す
        this.Reverse(status, ScanDirection.Left, x, y);
        this.Reverse(status, ScanDirection.Right, x, y);
        this.Reverse(status, ScanDirection.Up, x, y);
        this.Reverse(status, ScanDirection.Down, x, y);
        this.Reverse(status, ScanDirection.LeftUp, x, y);
        this.Reverse(status, ScanDirection.LeftDown, x, y);
        this.Reverse(status, ScanDirection.RightUp, x, y);
        this.Reverse(status, ScanDirection.RightDown, x, y);

        // 現在の黒と白の石の数を表示する
        this.LblBlackCount.string = "" + this.Count(CellStatus.Black);
        this.LblWhiteCount.string = "" + this.Count(CellStatus.White);

        return true;
    }

    // セルに石を置くことができるか調べます
    CanPut(status: CellStatus, x: number, y: number): boolean {

        // 既に目的のセルに石が置かれているかチェック
        if (this.Cells(x, y).GetStatus() != CellStatus.Nothing) {
            return false;
        }

        // このセルに石を置いた場合ひっくり返せる石があるかチェック
        if (this.ReversibleCount(status, x, y) == 0) {
            return false;
        }

        return true;
    }

    // 石をおいた場合にひっくり返せる石の数を調べます
    ReversibleCount(status: CellStatus, x: number, y: number): number {
        let count: number = 0;

        count += this.ReversibleCountDirection(status, ScanDirection.Left, x, y);
        count += this.ReversibleCountDirection(status, ScanDirection.Right, x, y);
        count += this.ReversibleCountDirection(status, ScanDirection.Up, x, y);
        count += this.ReversibleCountDirection(status, ScanDirection.Down, x, y);
        count += this.ReversibleCountDirection(status, ScanDirection.RightUp, x, y);
        count += this.ReversibleCountDirection(status, ScanDirection.RightDown, x, y);
        count += this.ReversibleCountDirection(status, ScanDirection.LeftUp, x, y);
        count += this.ReversibleCountDirection(status, ScanDirection.LeftDown, x, y);

        return count;
    }

    // 石をおいた場合に特定の方向にひっくり返せる石の数を調べます
    ReversibleCountDirection(status: CellStatus, direction: ScanDirection, x: number, y: number): number {

        let anotherStatus: CellStatus = null;
        let xDirection: number = 0; // 左のとき-1, 右のとき1
        let yDirection: number = 0; // 上のとき-1, 下のとき1

        // 相手の色を取得(自分が黒ならば相手は白、白ならば黒)
        if (status == CellStatus.Black) {
            anotherStatus = CellStatus.White;
        } else {
            anotherStatus = CellStatus.Black;
        }

        switch (direction) {
            case ScanDirection.Left:
                xDirection = -1;
                yDirection = 0;
                break;
            case ScanDirection.Right:
                xDirection = 1;
                yDirection = 0;
                break;
            case ScanDirection.Up:
                xDirection = 0;
                yDirection = -1;
                break;
            case ScanDirection.Down:
                xDirection = 0;
                yDirection = 1;
                break;
            case ScanDirection.RightUp:
                xDirection = 1;
                yDirection = -1;
                break;
            case ScanDirection.RightDown:
                xDirection = 1;
                yDirection = 1;
                break;
            case ScanDirection.LeftUp:
                xDirection = -1;
                yDirection = -1;
                break;
            case ScanDirection.LeftDown:
                xDirection = -1;
                yDirection = 1;
                break;
            default:
                break;
        }

        // 一番端に置こうとしているときはその方向にひっくり返せるわけがない
        if (x + xDirection < 0 || x + xDirection >= ReverseGrid.XCount || y + yDirection < 0 || y + yDirection >= ReverseGrid.YCount) {
            return 0;
        }

        // 隣のセルを取得
        const thisCell = this.Cells(x + xDirection, y + yDirection);

        let count: number = 0;

        // 隣のセルの色が相手の色ならばひっくり返せる可能性がある
        if (this.Cells(x + xDirection, y + yDirection).GetStatus() == anotherStatus) {

            for (let i = 0; i < ReverseGrid.XCount; i++) {

                // もう１個隣の座標
                const testX = x + (xDirection * (i + 1));
                const testY = y + (yDirection * (i + 1));
                
                // もう１個隣がグリッドからはみ出るなら、結局１個もひっくり返せないと言うこと
                if (testX < 0 || testX > ReverseGrid.XCount - 1) {
                    return 0;
                }
                if (testY < 0 || testY > ReverseGrid.YCount - 1) {
                    return 0;
                }

                // もう１個隣の色が
                switch (this.Cells(testX, testY).GetStatus()) {
                    case status:
                        // 自分と同じ色ならばひっくり返せる
                        return count;

                    case CellStatus.Nothing:
                        // 何もなければひっくり返せない
                        return 0;
                
                    default:
                        // 相手の色ならばひっくり返せる可能性がある数が1増える
                        count += 1;
                        break;
                }
            }
        }

        return 0;
    }

    // 石をひっくり返します
    Reverse(status: CellStatus, direction: ScanDirection, x: number, y: number) {

        let anotherStatus: CellStatus = null;
        let xDirection: number = 0; // 左のとき-1, 右のとき1
        let yDirection: number = 0; // 上のとき-1, 下のとき1

        if (status == CellStatus.Black) {
            anotherStatus = CellStatus.White;
        } else {
            anotherStatus = CellStatus.Black;
        }

        switch (direction) {
            case ScanDirection.Left:
                xDirection = -1;
                yDirection = 0;
                break;
            case ScanDirection.Right:
                xDirection = 1;
                yDirection = 0;
                break;
            case ScanDirection.Up:
                xDirection = 0;
                yDirection = -1;
                break;
            case ScanDirection.Down:
                xDirection = 0;
                yDirection = 1;
                break;
            case ScanDirection.RightUp:
                xDirection = 1;
                yDirection = -1;
                break;
            case ScanDirection.RightDown:
                xDirection = 1;
                yDirection = 1;
                break;
            case ScanDirection.LeftUp:
                xDirection = -1;
                yDirection = -1;
                break;
            case ScanDirection.LeftDown:
                xDirection = -1;
                yDirection = 1;
                break;
            default:
                break;
        }

        // ひっくりかえす
        if (this.ReversibleCountDirection(status, direction, x, y) > 0) {

            let delay: number = 1;

            for (let i = 1; i < ReverseGrid.XCount; i++) {
                
                const testX = x + (xDirection * i);
                const testY = y + (yDirection * i);

                if (testX < 0 || testX > ReverseGrid.XCount - 1) {
                    break;
                }
                if (testY < 0 || testY > ReverseGrid.YCount - 1) {
                    break;
                }

                if (this.Cells(testX, testY).GetStatus() == anotherStatus) {
                    this.Cells(testX, testY).SetStatus(status, delay);
                    delay += 1;
                } else {
                    break;
                }
            }
        }
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

    ReverseGridDraw(g: cc.Graphics) {
        g.clear();
 
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
 
    FocusedDraw(g: cc.Graphics) {
        g.clear();

        // セルいっぱいに描画するとぎちぎちになるので範囲を-2する
        g.rect(0 + 2, 0 + 2, ReverseGrid.CellSize - 4, ReverseGrid.CellSize - 4);
        g.fill();
        g.stroke();
    }

    // 状態を指定してセルの数を取得します
    Count(status: CellStatus): number {

        let count: number = 0;

        for (let x = 0; x < ReverseGrid.XCount; x++) {
            for (let y = 0; y < ReverseGrid.YCount; y++) {
                if (this.Cells(x, y).GetStatus() == status) {
                    count += 1;
                }
            }
        }

        return count;
    }

    // 置くことができる場所の数を調べます
    PuttableCount(status: CellStatus): number {

        let count: number = 0;

        for (let x = 0; x < ReverseGrid.XCount; x++) {
            for (let y = 0; y < ReverseGrid.YCount; y++) {
                if (this.CanPut(status, x, y)) {
                    count += 1;
                }
            }
        }

        return count;
    }
}
