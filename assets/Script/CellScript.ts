const {ccclass, property} = cc._decorator;
import {CellStatus} from './CellStatus';

@ccclass
export default class CellScript extends cc.Component {

    @property(cc.SpriteFrame)
    Black: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    White: cc.SpriteFrame = null;

    // @property
    // text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.node.on('SetStatus', (status: CellStatus) => this.SetStatus(status));
        // this.node.emit('SetStatus', CellStatus.Black);
    }

    // update (dt) {}

    Status: CellStatus = CellStatus.Nothing;

    SetStatus(status: CellStatus) {
        this.Status = status
        const sprite = this.node.getComponent(cc.Sprite);

        switch (status) {
            case CellStatus.Black:
                sprite.spriteFrame = this.Black;
                break;
        
            case CellStatus.White:
                sprite.spriteFrame = this.Black;
                break;
            
            default:
                sprite.spriteFrame = null;
                break;
        }
    }
}
