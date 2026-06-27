namespace story {
    let stateStack: ConversationState[];
    let _activeBubble: Bubble;

    interface SayInfo {
        sprite: Sprite;
        textSprite: Sprite;
        backdrop: Sprite;
        endTime: number;
    }

    let _activeSays: SayInfo[] = [];

    game.onUpdate(function () {
        const now = game.runtime();
        for (let i = _activeSays.length - 1; i >= 0; i--) {
            const info = _activeSays[i];
            const spriteDestroyed = !info.sprite || info.sprite.x === undefined;
            if (spriteDestroyed || now >= info.endTime) {
                info.textSprite.destroy();
                info.backdrop.destroy();
                _activeSays.splice(i, 1);
                continue;
            }

            info.backdrop.left = info.sprite.x - info.backdrop.width / 2;
            info.backdrop.top = info.sprite.top - info.backdrop.height - 4;
            info.textSprite.left = info.sprite.x - info.textSprite.width / 2;
            info.textSprite.top = info.backdrop.top + (info.backdrop.height - info.textSprite.height) / 2;
        }
    });

    enum State {
        Idle,
        Running,
        Cancelled
    }

    class ConversationState {
        state: State;
        lastAnswer: string;
        registeredMenuHandler: boolean;
        currentTask: story.Task;
        soundEnabled: boolean;
        cutsceneQueue: (() => void)[];

        constructor() {
            this.state = State.Idle;
            this.soundEnabled = true;
            this.cutsceneQueue = [];
        }

        showMenu(choices: string[]) {
            if (this.state === State.Cancelled) return;
            if (!this.registeredMenuHandler) {
                this.registeredMenuHandler = true;
                story.menu.onMenuOptionSelected((option: string, index: number) => {
                    this.lastAnswer = option;
                    story.menu.closeMenu();
                });
            }

            let arrows = img`
                1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
                1 1 1 1 1 1 1 1 1 6 6 6 6 6 6 6 1
                1 1 1 1 6 1 1 1 1 6 6 6 6 6 6 6 1
                1 1 1 1 6 1 1 1 1 1 6 6 6 6 6 1 1
                1 1 1 6 6 6 1 1 1 1 6 6 6 6 6 1 1
                1 1 1 6 6 6 1 1 1 1 1 6 6 6 1 1 1
                1 1 6 6 6 6 6 1 1 1 1 6 6 6 1 1 1
                1 1 6 6 6 6 6 1 1 1 1 1 6 1 1 1 1
                1 6 6 6 6 6 6 6 1 1 1 1 6 1 1 1 1
                1 6 6 6 6 6 6 6 1 1 1 1 1 1 1 1 1
                1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
            `
            let abutton = img`
                1 1 1 1 1 1 1 1 1 1 1
                1 1 1 6 6 6 6 6 1 1 1
                1 1 6 6 6 6 6 6 6 1 1
                1 6 6 6 6 1 6 6 6 6 1
                1 6 6 6 1 6 1 6 6 6 1
                1 6 6 6 1 1 1 6 6 6 1
                1 6 6 6 1 6 1 6 6 6 1
                1 6 6 6 1 6 1 6 6 6 1
                1 1 6 6 6 6 6 6 6 1 1
                1 1 1 6 6 6 6 6 1 1 1
                1 1 1 1 1 1 1 1 1 1 1
            `

            const arrowText = new story.TextSprite(story.TEXT_Z + 1);
            arrowText.setText("SELECT");
            arrowText.setColor(15);

            const buttonText = new story.TextSprite(story.TEXT_Z + 1);
            buttonText.setText("OK");
            buttonText.setColor(15);

            const arrowIcon = new story.IconSprite(story.TEXT_Z + 1);
            arrowIcon.setIcon(arrows);

            const buttonIcon = new story.IconSprite(story.TEXT_Z + 1);
            buttonIcon.setIcon(abutton);

            arrowIcon.top = screen.height - arrowIcon.height;
            buttonIcon.top = screen.height - buttonIcon.height;
            arrowText.top = screen.height - arrowIcon.height / 2 - arrowText.height / 2;
            buttonText.top = screen.height - buttonIcon.height / 2 - buttonText.height / 2;

            const totalWidth = arrowText.width + buttonText.width + arrowIcon.width + buttonIcon.width + 4;

            arrowIcon.left = (screen.width >> 1) - totalWidth / 2;
            arrowText.left = arrowIcon.left + arrowIcon.width + 1
            buttonIcon.left = arrowText.left + arrowText.width + 2;
            buttonText.left = buttonIcon.left + buttonIcon.width + 1;

            const backdrop = new story.RectangleSprite(story.TEXT_Z);
            backdrop.setDimensions(156, arrows.height);
            backdrop.top = screen.height - backdrop.height;
            backdrop.left = (screen.width >> 1) - backdrop.width / 2;

            story.menu.showMenu(choices, story.menu.MenuStyle.List, story.menu.MenuLocation.BottomHalf);
            pauseUntil(() => !story.menu.isMenuOpen());

            buttonText.destroy();
            arrowIcon.destroy();
            arrowText.destroy();
            buttonIcon.destroy();
            backdrop.destroy();
        }

        cancel() {
            if (story.menu.isMenuOpen()) {
                story.menu.closeMenu();
            }
            if (this.currentTask && this.currentTask.cancel) {
                this.currentTask.cancel();
                this.currentTask = null;
            }
            if (this.state === State.Running) {
                this.state = State.Cancelled;
            }
        }
    }

    /**
     * Starts a cutscene that runs in the background. There can only
     * be one cutscene active at a time, so calling this multiple times
     * will cause the cutscenes to queue up.
     *
     * @param callback The code to run inside the cutscene
     */
    //% blockId=arcade_story_start_cutscene
    //% block="开始过场动画"
    //% help=github:arcade-story/start-cutscene.md
    //% weight=100
    //% handlerStatement=1
    //% group="过场动画"
    export function startCutscene(callback: () => void) {
        _currentCutscene().cutsceneQueue.push(callback);
        if (_currentCutscene().state === State.Idle) {
            _currentCutscene().state = State.Running
            control.runInParallel(() => {
                while (_currentCutscene().cutsceneQueue.length) {
                    _currentCutscene().state = State.Running
                    _currentCutscene().cutsceneQueue.shift()();
                    pause(1)
                }
                _currentCutscene().state = State.Idle;
            });
        }
    }

    //% blockId=arcade_story_start_conversation
    //% block="开始对话"
    //% weight=100
    //% handlerStatement=1
    //% group="过场动画"
    //% deprecated=1
    export function startConveration(callback: () => void) {
        startCutscene(callback);
    }

    /**
     * 在屏幕下半部分逐字打印文本。
     * 文本显示在背景上，此积木会暂停直到打印完成。
     *
     * @param text 要打印的文本
     * @param label 显示在文本上方的可选标签
     */
    //% blockId=arcade_story_print_character_text
    //% block="打印角色对话 $text|| 标签 $label"
    //% weight=30
    //% group="文本"
    //% blockGap=8
    export function printCharacterText(text: string, label?: string) {
        if (_activeBubble) {
            _activeBubble.destroy();
            _activeBubble = null;
        }

        const width = Math.idiv(screen.width - 10, story.UI_SCALE);
        const height = Math.min(50, Math.idiv(screen.height >> 1, story.UI_SCALE));
        const x = Math.idiv(screen.width, story.UI_SCALE * 2);
        const y = Math.idiv(screen.height, story.UI_SCALE) - Math.idiv(height, 2) - 5;
        const bubble = _createDialog(text, x, y, height, width);
        _activeBubble = bubble;

        if (label) {
            const padding = 1;
            const labelText = new TextSprite(TEXT_Z + 2);
            labelText.setText(label);
            labelText.setColor(14);
            labelText.setFlag(SpriteFlag.RelativeToCamera, true);
            labelText.left = 3 * story.UI_SCALE;
            labelText.top = (y - (height >> 1)) * story.UI_SCALE - labelText.height - padding;
            labelText.attachToTask(bubble);

            const labelBackdrop = new RectangleSprite(TEXT_Z + 1);
            labelBackdrop.setDimensions(Math.idiv(labelText.width + (padding << 1), story.UI_SCALE), Math.idiv(labelText.height + (padding << 1), story.UI_SCALE));
            labelBackdrop.setColor(9);
            labelBackdrop.setFlag(SpriteFlag.RelativeToCamera, true);
            labelBackdrop.left = labelText.left - padding;
            labelBackdrop.top = labelText.top - padding;
            labelBackdrop.attachToTask(bubble);
        }

        pauseUntil(() => bubble.isDone());
        bubble.destroy();
        _activeBubble = null;
    }

    /**
     * 让精灵上方显示一段文字，类似内置的 sayText 效果。
     * 文字会直接全部显示，持续一段时间后自动消失。
     *
     * @param sprite 目标精灵
     * @param text 要显示的文本
     * @param timeOnScreen 文字显示持续时间（毫秒），默认 2000
     */
    //% blockId=story_sprite_say_text
    //% block="角色 $sprite 说 $text ||持续 $timeOnScreen 毫秒"
    //% text.defl="你好！"
    //% sprite.shadow=variables_get
    //% sprite.defl=sprite
    //% timeOnScreen.defl=2000
    //% inlineInputMode=inline
    //% blockGap=8
    //% weight=98
    //% group="文本"
    export function spriteSayText(sprite: Sprite, text: string, timeOnScreen = 2000) {
        if (!text) return;

        // 移除同一个精灵的旧对话
        let existing = -1;
        for (let i = 0; i < _activeSays.length; i++) {
            if (_activeSays[i].sprite === sprite) {
                existing = i;
                break;
            }
        }
        if (existing >= 0) {
            _activeSays[existing].textSprite.destroy();
            _activeSays[existing].backdrop.destroy();
            _activeSays.splice(existing, 1);
        }

        const font = image.getFontForText(text);
        const w = font.charWidth * text.length;
        const h = font.charHeight;

        // 背景
        const backdropImg = image.create(w + 4, h + 4);
        backdropImg.fillRect(0, 0, w + 4, h + 4, 1);
        const backdrop = sprites.create(backdropImg);
        backdrop.setFlag(SpriteFlag.Ghost, true);
        backdrop.z = TEXT_Z - 1;
        backdrop.setScale(story.UI_SCALE);

        // 文字
        const textImg = image.create(w, h);
        textImg.print(text, 0, 0, 15);
        const textSprite = sprites.create(textImg);
        textSprite.setFlag(SpriteFlag.Ghost, true);
        textSprite.z = TEXT_Z;
        textSprite.setScale(story.UI_SCALE);

        const info: SayInfo = {
            sprite,
            textSprite,
            backdrop,
            endTime: game.runtime() + timeOnScreen
        };
        _activeSays.push(info);
    }

    /**
     * Shows a menu of choices for the player to make and pauses until the player
     * makes a choice. The menu shown to the player uses the up, down, and A buttons,
     * so make sure you ignore those button presses while the menu is open.
     *
     *
     * @param choice1 A choice to appear in the list of player choices
     * @param choice2 A choice to appear in the list of player choices
     * @param choice3 A choice to appear in the list of player choices
     * @param choice4 A choice to appear in the list of player choices
     * @param choice5 A choice to appear in the list of player choices
     */
    //% blockId=arcade_story_show_player_choices
    //% block="显示玩家选项 $choice1 $choice2 ||$choice3 $choice4 $choice5"
    //% help=github:arcade-story/show-player-choices.md
    //% inlineInputMode=inline
    //% weight=80
    //% blockGap=8
    //% group="菜单"
    export function showPlayerChoices(choice1: string, choice2: string, choice3?: string, choice4?: string, choice5?: string) {
        const choices = [choice1];
        if (choice2) choices.push(choice2);
        if (choice3) choices.push(choice3);
        if (choice4) choices.push(choice4);

        _currentCutscene().showMenu(choices);
    }

    /**
     * Checks the last choice made by the player in a menu created by "show player choices".
     *
     * @param choice The text to check against the last choice made
     * @returns True if the choice matches the last answer and false otherwise
     */
    //% blockId=arcade_story_last_answer
    //% block="上次选择等于 $choice"
    //% help=github:arcade-story/last-answer-equals.md
    //% weight=70
    //% group="菜单"
    export function checkLastAnswer(choice: string): boolean {
        return _currentCutscene().lastAnswer === choice;
    }

    //% blockId=arcade_story_cancel_conversation
    //% block="取消对话"
    //% weight=60
    //% deprecated=1
    //% group="菜单"
    export function cancelCurrentConversation() {
        cancelCurrentCutscene();
    }

    /**
     * Gets the text of the last choice made by the player in a menu created
     * by "show player choices".
     *
     * @returns True if the menu is open and false otherwise
     */
    //% blockId=arcade_story_get_last_answer
    //% block="获取上次选择"
    //% help=github:arcade-story/get-last-answer.md
    //% weight=60
    //% blockGap=8
    //% group="菜单"
    export function getLastAnswer(): string {
        return _currentCutscene().lastAnswer;
    }

    /**
     * Checks if the menu created by "show player choices" is still open.
     *
     * @returns True if the menu is open and false otherwise
     */
    //% blockId=arcade_story_is_menu_open
    //% block="菜单是否打开"
    //% help=github:arcade-story/is-menu-open.md
    //% weight=50
    //% group="菜单"
    export function isMenuOpen(): boolean {
        return story.menu.isMenuOpen();
    }

    /**
     * Cancels the currently active cutscene.
     */
    //% blockId=arcade_story_cancel_cutscene
    //% block="取消过场动画"
    //% help=github:arcade-story/cancel-cutscene.md
    //% weight=50
    //% blockGap=8
    //% group="过场动画"
    export function cancelCurrentCutscene() {
        _currentCutscene().cancel();
    }

    /**
     * Cancels the currently active cutscene as well as any pending
     * cutscenes that haven't started yet.
     */
    //% blockId=arcade_story_cancel_all_cutscenes
    //% block="取消所有过场动画"
    //% help=github:arcade-story/cancel-all-cutscenes.md
    //% weight=49
    //% blockGap=8
    //% group="过场动画"
    export function cancelAllCutscenes() {
        _currentCutscene().cutsceneQueue = [];
        cancelCurrentCutscene();
    }

    function _createDialog(text: string, x: number, y: number, height: number, width: number, foreground = 15, background = 1, speed?: TextSpeed) {
        const font = image.getFontForText(text);
        const script = _formatText(text, speed === undefined ? TextSpeed.Normal : speed, Math.idiv(width - 8, font.charWidth), Math.idiv(height - 8, font.charHeight));

        const left = x - (width >> 1);
        const top = y - (height >> 1)

        const bubble = new Bubble(TEXT_Z, true);
        bubble.setAlign(left, top);
        bubble.foregroundColor = foreground;
        bubble.backgroundColor = background;
        bubble.startMessage(script.pages);

        const backdrop = new RectangleSprite(TEXT_Z - 1);
        backdrop.setColor(background);
        backdrop.setDimensions(width, height);
        backdrop.setFlag(SpriteFlag.RelativeToCamera, true);
        backdrop.left = left * story.UI_SCALE;
        backdrop.top = top * story.UI_SCALE;
        backdrop.attachToTask(bubble);

        return bubble;
    }

    export function _pauseUntilTaskIsComplete(task: story.Task) {
        const state = _currentCutscene();
        pauseUntil(() => task.isDone() || state.state === State.Cancelled);
    }

    export function _currentCutscene() {
        if (!stateStack) {
            stateStack = [];

            game.addScenePushHandler(() => {
                stateStack.push(new ConversationState());
            });

            game.addScenePopHandler(() => {
                if (stateStack.length) {
                    stateStack[stateStack.length - 1].cancel();
                    stateStack.pop();
                }
            });
        }
        if (!stateStack.length) {
            stateStack.push(new ConversationState());
        }
        return stateStack[stateStack.length - 1];
    }
}