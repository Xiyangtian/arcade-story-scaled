namespace story {
    /**
     * Prints some text to the screen one character at a time.
     *
     * @param text The text to print to the screen
     * @param x The center x position to print the text at
     * @param y The center y position to print the text at
     * @param foreground The color used to print the text
     * @param background The color of the background behind the printed text
     * @param speed The speed at which to print the text
     */
    //% blockId=story_show_text
    //% block="在 x $x y $y 打印 $text||文字颜色 $foreground 背景颜色 $background 速度 $speed"
    //% help=github:arcade-story/print-text.md
    //% text.defl=":)"
    //% foreground.shadow=colorindexpicker
    //% foreground.defl=15
    //% background.shadow=colorindexpicker
    //% background.defl=1
    //% inlineInputMode=inline
    //% blockGap=8
    //% weight=99
    //% group="文本"
    export function printText(text: string, x: number, y: number, foreground = 15, background = 1, speed?: TextSpeed) {
        const script = _formatText(text, speed === undefined ? TextSpeed.Normal : speed);
        script.setColors(foreground, background);
        printScript(script, x, y, TEXT_Z);
    }

    function isBreakCharacter(charCode: number) {
        return charCode <= 32 ||
            (charCode >= 58 && charCode <= 64) ||
            (charCode >= 91 && charCode <= 96) ||
            (charCode >= 123 && charCode <= 126);
    }

    export function _formatText(text: string, speed: TextSpeed, maxLineLength = 20, maxLinesPerPage = 5): Script {
        const result = new Script();

        let lastBreakLocation = 0;
        let lastBreak = 0;
        let line = 0;

        for (let index = 0; index < text.length; index++) {
            if (text.charAt(index) === "\n") {
                result.addLineToCurrentPage(formatLine(text.substr(lastBreak, index - lastBreak)), speed);
                index++;
                lastBreak = index;
                line++;
            }
            // Handle \\n in addition to \n because that's how it gets converted from blocks
            else if (text.charAt(index) === "\\" && text.charAt(index + 1) === "n") {
                result.addLineToCurrentPage(formatLine(text.substr(lastBreak, index - lastBreak)), speed)
                index += 2;
                lastBreak = index
                line++;
            }
            else if (isBreakCharacter(text.charCodeAt(index))) {
                lastBreakLocation = index;
            }

            if (index - lastBreak === maxLineLength) {
                if (lastBreakLocation === index || lastBreakLocation < lastBreak) {
                    result.addLineToCurrentPage(formatLine(text.substr(lastBreak, maxLineLength)), speed);
                    lastBreak = index;
                    line++;
                }
                else {
                    result.addLineToCurrentPage(formatLine(text.substr(lastBreak, lastBreakLocation - lastBreak)), speed);
                    lastBreak = lastBreakLocation;
                    line++;
                }
            }

            if (line >= maxLinesPerPage) {
                line = 0;
                result.newPage();
            }
        }

        result.addLineToCurrentPage(formatLine(text.substr(lastBreak, text.length - lastBreak)), speed);

        return result;
    }

    function formatLine(text: string) {
        let i = 0;
        while (text.charAt(i) === " ") i++;
        return text.substr(i, text.length);
    }

    /**
     * Print some text to the screen within a given box, relative to the camera, and character by character.
     *
     * @param text The text to print to the screen
     * @param x The center x position to print the text at
     * @param y The center y position to print the text at
     * @param height The height of the invisible box to print within
     * @param width The width of the invisible box to print within
     * @param foreground The color used to print the text
     * @param background The color of the background behind the printed text
     * @param speed The speed at which to print the text
     */
    //% blockId=story_print_dialog
    //% block="在相机 x $x y $y 的盒子中打印 $text 宽度 $width 高度 $height||文字颜色 $foreground 背景颜色 $background 速度 $speed"
    //% help=github:arcade-story/print-dialog.md
    //% text.defl=":)"
    //% foreground.shadow=colorindexpicker
    //% foreground.defl=15
    //% background.shadow=colorindexpicker
    //% background.defl=1
    //% x.defl=80
    //% y.defl=90
    //% width.defl=150
    //% height.defl=50
    //% inlineInputMode=inline
    //% blockGap=8
    //% weight=60
    //% group="文本"
    export function printDialog(text: string, x: number, y: number, height: number, width: number, foreground = 15, background = 1, speed?: TextSpeed) {
        const font = image.getFontForText(text);
        const script = _formatText(text, speed === undefined ? TextSpeed.Normal : speed, Math.idiv(width - 8, font.charWidth), Math.idiv(height - 8, font.charHeight));
        script.setColors(foreground, background);
        printScript(script, x - width / 2, y - height / 2, TEXT_Z, true, true);
    }

    /**
     * Sets the amount of time to pause in between pages of text that are printed out by
     * the story extension.
     *
     * @param pagePauseMillis The time to pause at the end of pages in milliseconds
     * @param finalPagePauseMillis The time to pause at the end of the final page in milliseconds
     */
    //% blockId=story_set_page_pause_length
    //% block="设置翻页暂停 $pagePauseMillis 毫秒 最终页暂停 $finalPagePauseMillis 毫秒"
    //% help=github:arcade-story/set-page-pause-length.md
    //% pagePauseMillis.shadow=timePicker
    //% pagePauseMillis.defl=1000
    //% finalPagePauseMillis.shadow=timePicker
    //% finalPagePauseMillis.defl=1000
    //% inlineInputMode=inline
    //% blockGap=8
    //% weight=40
    //% group="文本"
    export function setPagePauseLength(pagePauseMillis: number, finalPagePauseMillis: number) {
        _defaultPagePauseLength = pagePauseMillis;
        _defaultFinalPagePauseLength = finalPagePauseMillis;
    }
}