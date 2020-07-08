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

    // start () {}

    // update (dt) {}

    Status: CellStatus = CellStatus.Nothing;

    SetStatus(status: CellStatus, delay: number) {
        this.Status = status
        const sprite = this.node.getComponent(cc.Sprite);
        const animation = this.node.getComponent(cc.Animation);

        switch (status) {
            case CellStatus.Black:
                setTimeout(() => {
                    sprite.spriteFrame = this.Black;
                    animation.play();
                }, delay * 100);
                break;
        
            case CellStatus.White:
                setTimeout(() => {
                    sprite.spriteFrame = this.White;
                    animation.play();
                }, delay * 100);
                break;
            
            default:
                sprite.spriteFrame = null;
                break;
        }
    }
}
