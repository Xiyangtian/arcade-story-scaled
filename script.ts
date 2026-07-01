namespace story {
    export let _defaultPagePauseLength = 1000;
    export let _defaultFinalPagePauseLength = 1000;

    export class Script {
        pages: MessagePage[];
        foregroundColor: number;
        backgroundColor: number;
        pagePauseMillis: number;
        finalPagePauseLength: number;
        relativeToCamera: boolean;

        constructor(pages?: MessagePage[]) {
            this.pages = pages || [];
            this.foregroundColor = 0xf;
            this.backgroundColor = 0x1;
            this.pagePauseMillis = _defaultPagePauseLength;
            this.finalPagePauseLength = _defaultFinalPagePauseLength;
            this.relativeToCamera = false;
        }

        //% blockId=script_add_line
        //% block="$this(脚本) 添加行 $text 速度 $speed"
        //% weight=90
        //% blockGap=8
        //% group="脚本"
        //% deprecated=1
        addLineToCurrentPage(text: string, speed: TextSpeed) {
            if (!this.pages.length) {
                this.pages.push(new MessagePage([]));
            }
            this.pages[this.pages.length - 1].lines.push(line(text, speed));
        }

        //% blockId=script_new_page
        //% block="$this(脚本) 开始新页"
        //% weight=80
        //% blockGap=8
        //% group="脚本"
        //% deprecated=1
        newPage() {
            this.pages.push(new MessagePage([]));
        }

        //% blockId=script_set_colors
        //% block="$this(脚本) 设置文字颜色 $foreground 背景颜色 $background"
        //% foreground.shadow=colorindexpicker
        //% foreground.defl=15
        //% background.shadow=colorindexpicker
        //% background.defl=1
        //% weight=70
        //% blockGap=8
        //% group="脚本"
        //% deprecated=1
        setColors(foreground: number, background: number) {
            this.foregroundColor = foreground;
            this.backgroundColor = background;
        }

        //% blockId=script_set_pause_length
        //% block="$this(脚本) 在页面末尾暂停 $pauseMillis 毫秒"
        //% pauseMillis.shadow=timePicker
        //% pauseMillis.defl=1000
        //% weight=60
        //% group="脚本"
        //% deprecated=1
        setPagePauseLength(pauseMillis: number) {
            this.pagePauseMillis = pauseMillis;
        }

        //% blockId=script_set_relative_to_camera
        //% block="$this(脚本) 设置相对于相机 $relativeToCamera"
        //% weight=5
        //% blockGap=8
        //% group="脚本"
        //% deprecated=1
        setRelativeToCamera(relativeToCamera: boolean) {
            this.relativeToCamera = relativeToCamera;
        }
    }

    //% blockId=story_create_script
    //% block="创建空脚本"
    //% blockSetVariable=script
    //% weight=98
    //% group="脚本"
    //% deprecated=1
    export function createEmptyScript(): Script {
        const script = new Script();
        return script;
    }

    
    //% blockId=story_create_script_with_text
    //% block="创建脚本 $text 文字颜色 $foreground 背景颜色 $background"
    //% text.defl=":)"
    //% foreground.shadow=colorindexpicker
    //% foreground.defl=15
    //% background.shadow=colorindexpicker
    //% background.defl=1
    //% blockSetVariable=script
    //% weight=99
    //% group="脚本"
    //% deprecated=1
    export function createScript(text: string, foreground: number, background: number): Script {
        const script = new Script();
        
        if (text) {
            script.addLineToCurrentPage(text, TextSpeed.Normal);
        }

        script.setColors(foreground, background);
        return script;
    }

    //% blockId=story_print_script
    //% block="在 x $x y $y z $z 打印 $script"
    //% script.shadow=variables_get
    //% script.defl=script
    //% x.defl=80
    //% y.defl=60
    //% weight=50
    //% inlineInputMode=inline
    //% blockGap=8
    //% group="脚本"
    //% deprecated=1
    export function printScript(script: Script, x: number, y: number, z: number, align = false, relativeToCamera = false) {
        const b = new Bubble(z, relativeToCamera || script.relativeToCamera);

        if (align) {
            b.setAlign(x, y);
        }
        else {
            b.setAnchor(x, y);
        }

        startScript(script, b);
    }

    //% blockId=story_sprite_say_script
    //% block="$sprite 说 $script"
    //% sprite.shadow=variables_get
    //% sprite.defl=sprite
    //% script.shadow=variables_get
    //% script.defl=script
    //% weight=40
    //% group="脚本"
    //% deprecated=1
    export function spriteSayScript(sprite: Sprite, script: Script) {
        const b = new Bubble();
        b.setAnchorSprite(sprite);
        b.z = sprite.z;

        startScript(script, b);
    }

    function startScript(script: Script, bubble: Bubble) {
        bubble.foregroundColor = script.foregroundColor;
        bubble.backgroundColor = script.backgroundColor;
        bubble.pagePauseLength = script.pagePauseMillis;
        bubble.finalPagePauseLength = script.finalPagePauseLength;
        bubble.startMessage(script.pages);

        _trackTask(bubble);
        if (!_isInQueueStoryPart()) {
            _currentCutscene().currentTask = bubble;
            _pauseUntilTaskIsComplete(bubble);
        }
    }
}
