//% block="Story" color="#b36634" icon="\uf02d"
//% groups='["Text","Movement","Cutscene","Menu"]'
namespace story {
    export interface Task {
        isDone(): boolean;
        key?: string;
        cancel?: () => void;
    }

    export let UI_SCALE = Math.max(1, Math.floor(screen.width / 160));

    /**
     * Sets the UI scale factor for all story elements.
     * @param scale The scale factor to apply
     */
    //% blockId=story_set_ui_scale
    //% block="set story UI scale to $scale"
    //% scale.defl=1
    //% weight=0
    export function setScale(scale: number) {
        UI_SCALE = Math.max(1, scale | 0);
    }
}
