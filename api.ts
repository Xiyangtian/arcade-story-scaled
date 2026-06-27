//% block="故事" color="#b36634" icon="\uf02d"
//% groups='["文本","移动","过场动画","菜单"]'
namespace story {
    export interface Task {
        isDone(): boolean;
        key?: string;
        cancel?: () => void;
    }

    export let UI_SCALE = Math.max(1, Math.floor(screen.width / 160));
    export let soundEnabled = true;
    export const TEXT_Z = scene.HUD_Z - 1;

    /**
     * 设置所有故事元素的UI缩放比例
     * @param scale 缩放比例
     */
    //% blockId=story_set_ui_scale
    //% block="设置故事UI缩放比例为 $scale"
    //% scale.defl=1
    //% weight=0
    export function setScale(scale: number) {
        UI_SCALE = Math.max(1, scale);
    }

    /**
     * 设置打字时是否播放音效
     *
     * @param enabled 是否开启音效
     */
    //% blockId=story_set_sound_enabled
    //% block="设置文字音效 $enabled"
    //% inlineInputMode=inline
    //% blockGap=8
    //% weight=30
    //% group="文本"
    export function setSoundEnabled(enabled: boolean) {
        soundEnabled = enabled;
    }
}