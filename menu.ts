namespace story.menu {
    export enum MenuLocation {
        //% block="全屏"
        FullScreen,
        //% block="居中"
        Center,
        //% block="上半部分"
        TopHalf,
        //% block="右半部分"
        RightHalf,
        //% block="下半部分"
        BottomHalf,
        //% block="左半部分"
        LeftHalf,
        //% block="右上"
        TopRight,
        //% block="右下"
        BottomRight,
        //% block="左下"
        BottomLeft,
        //% block="左上"
        TopLeft
    }

    export enum MenuStyle {
        //% block="网格"
        Grid,
        //% block="列表"
        List
    }

    class LayoutMetrics {

        constructor(public left: number, public top: number, public width: number, public height: number) {
        }

        get right() {
            return this.left + this.width;
        }

        get bottom() {
            return this.top + this.height;
        }
    }

    export class MenuSprite extends sprites.BaseSprite {
        style: MenuStyle;
        protected location: MenuLocation;

        protected options: string[];
        protected labels: ScrollingLabel[];
        protected selectedIndex: number;

        protected foreground: number;
        protected background: number;
        protected cursorBackground: number;
        protected cursorForeground: number;
        protected open: boolean;

        protected padding: number;
        protected metrics: LayoutMetrics;

        constructor() {
            super(100);
            this.selectedIndex = 0;
            this.style = MenuStyle.List;
            this.setLocation(MenuLocation.Center);
            this.open = false;
            this.setColors(15, 1, 1, 3);
            this.padding = 2;
        }

        setOptions(options: string[]) {
            this.options = options.slice();
            this.selectedIndex = 0;
            this.recreateLabels();
        }

        setColors(foreground: number, background: number, cursorForeground: number, cursorBackground: number) {
            this.foreground = Math.max(Math.min(foreground | 0, 15), 0);
            this.background = Math.max(Math.min(background | 0, 15), 0);
            this.cursorForeground = Math.max(Math.min(cursorForeground | 0, 15), 0);
            this.cursorBackground = Math.max(Math.min(cursorBackground | 0, 15), 0);
        }

        setStyle(style: MenuStyle) {
            this.style = style;
        }

        setLocation(location: MenuLocation) {
            this.location = location;
            this.metrics = getLayoutMetrics(location);
            this.recreateLabels();
        }

        selectedMenuOption(): string {
            if (!this.options || !this.options[this.selectedIndex]) {
                return "";
            }

            return this.options[this.selectedIndex];
        }

        selectedMenuIndex(): number {
            return this.selectedIndex;
        }

        setSelectedIndex(index: number) {
            const numOptions = this.options ? this.options.length : 0;
            if (!numOptions) return;

            index |= 0;
            while (index < 0) index += this.options.length;

            index = index % numOptions;

            if (this.labels && this.labels[this.selectedIndex]) {
                this.labels[this.selectedIndex].setScrolling(false);
            }

            this.selectedIndex = index;

            if (this.labels && this.labels[this.selectedIndex]) {
                this.labels[this.selectedIndex].setScrolling(true);
            }
        }

        moveSelectionVertical(up: boolean) {
            if (this.style === MenuStyle.Grid) {
                if (up) {
                    if (this.options && this.options.length & 1) {
                        if (this.selectedIndex === 0) {
                            this.setSelectedIndex(this.selectedIndex - 1)
                        }
                        else if (this.selectedIndex === 1) {
                            this.setSelectedIndex(this.selectedIndex - 3)
                        }
                        else {
                            this.setSelectedIndex(this.selectedIndex - 2)
                        }
                    }
                    else {
                        this.setSelectedIndex(this.selectedIndex - 2)
                    }
                }
                else {
                    if (this.options && this.options.length & 1 && this.selectedIndex >= this.options.length - 2) {
                        this.setSelectedIndex(this.selectedIndex + 1)
                    }
                    else {
                        this.setSelectedIndex(this.selectedIndex + 2)
                    }
                }
            }
            else {
                if (up) {
                    this.previous()
                }
                else {
                    this.next();
                }
            }
        }

        moveSelectionHorizontal(left: boolean) {
            if (this.style === MenuStyle.Grid) {
                if (this.selectedIndex % 2 === 0) {
                    this.setSelectedIndex(this.selectedIndex + 1);
                }
                else {
                    this.setSelectedIndex(this.selectedIndex - 1);
                }
            }
        }

        next() {
            this.setSelectedIndex(this.selectedIndex + 1);
        }

        previous() {
            this.setSelectedIndex(this.selectedIndex - 1);
        }

        setSelectedOption(option: string) {
            const index = this.options ? this.options.indexOf(option) : -1;

            if (index !== -1) {
                this.setSelectedIndex(index);
            }
        }

        isOpen(): boolean {
            return this.open;
        }

        setMenuOpen(open: boolean) {
            this.open = open;
        }

        destroy() {
            game.currentScene().allSprites.removeElement(this);
        }

        __visible(): boolean {
            return this.open;
        }

        __drawCore(camera: scene.Camera) {
            const scale = story.UI_SCALE;
            if (this.background) {
                screen.fillRect(
                    this.metrics.left * scale,
                    this.metrics.top * scale,
                    this.metrics.width * scale,
                    Math.min(
                        this.metrics.height * scale,
                        (this.contentHeight() + this.padding) * scale
                    ),
                    this.background
                );
            }

            if (this.style === MenuStyle.Grid) {
                this.drawGridMenu();
            }
            else {
                this.drawListMenu();
            }
        }

        protected getMaxLabelWidth() {
            if (this.style === MenuStyle.Grid) {
                return (this.metrics.width - (this.padding * 3)) >> 1;
            }
            return this.metrics.width - (this.padding << 1);
        }

        protected recreateLabels() {
            this.labels = [];
            if (!this.options) return;

            const labelWidth = this.getMaxLabelWidth();

            for (const option of this.options) {
                this.labels.push(new ScrollingLabel(option, labelWidth));
            }

            this.setSelectedIndex(this.selectedMenuIndex())
        }

        protected contentHeight() {
            let h = 0;
            for (let i = 0; i < this.labels.length; i++) {
                h += this.padding;
                h += this.labels[i].font.charHeight;
            }
            return h
        }

        protected drawGridMenu() {
            const scale = story.UI_SCALE;
            let current: ScrollingLabel;

            let top = this.metrics.top + this.padding;
            let left = this.metrics.left + this.padding;

            for (let i = 0; i < this.labels.length; i++) {
                current = this.labels[i];

                if (i === this.selectedIndex) {
                    screen.fillRect((left - 1) * scale, (top - 1) * scale, (current.width + 2) * scale, (current.font.charHeight + 2) * scale, this.cursorBackground);
                    current.draw(left * scale, top * scale, this.cursorForeground);
                }
                else {
                    current.draw(left * scale, top * scale, this.foreground);
                }

                if (i % 2 === 1) {
                    left = this.metrics.left + this.padding;
                    top += current.font.charHeight + this.padding;
                }
                else {
                    left += current.width + this.padding;
                }
            }
        }

        protected drawListMenu() {
            const scale = story.UI_SCALE;
            let current: ScrollingLabel;

            let top = this.metrics.top + this.padding;
            let left = this.metrics.left + this.padding;

            for (let i = 0; i < this.labels.length; i++) {
                current = this.labels[i];
                if (i === this.selectedIndex) {
                    screen.fillRect((left - 1) * scale, (top - 1) * scale, (current.width + 2) * scale, (current.font.charHeight + 2) * scale, this.cursorBackground);
                    current.draw(left * scale, top * scale, this.cursorForeground);
                }
                else {
                    current.draw(left * scale, top * scale, this.foreground);
                }

                top += current.font.charHeight + this.padding
            }
        }
    }

    class ScrollingLabel {
        public offset: number;

        public stage: number;
        public timer: number;
        public scrolling: boolean;
        public pauseTime: number;
        public maxCharacters: number;
        public maxOffset: number;
        public width: number;
        public font: image.Font;
        public partialCanvas: Image;

        constructor(public text: string, maxWidth: number) {
            this.scrolling = false;

            this.pauseTime = 1000;
            this.timer = this.pauseTime;
            this.stage = 0;
            this.offset = 0;
            this.width = maxWidth;

            this.font = image.getFontForText(this.text);

            const fullLength = this.text.length * this.font.charWidth;
            this.maxCharacters = Math.idiv(maxWidth, this.font.charWidth);
            this.maxOffset = fullLength - this.maxCharacters * this.font.charWidth;
            this.partialCanvas = image.create(this.font.charWidth, this.font.charHeight);
        }

        setScrolling(scrolling: boolean) {
            if (this.scrolling !== scrolling) {
                this.stage = 0;
                this.offset = 0;
                this.scrolling = scrolling;
            }
        }

        draw(left: number, top: number, color: number) {
            const scale = story.UI_SCALE;
            const font = this.font;
            const charW = font.charWidth;
            const charH = font.charHeight;
            const startIndex = Math.idiv(this.offset, charW);
            const letterOffset = startIndex * charW - this.offset;

            if (!this.scrolling) {
                this.offset = 0;
            }
            else if (this.stage === 1) {
                this.offset++;
                if (this.offset >= this.maxOffset) {
                    this.stage++;
                    this.offset = Math.max(this.maxOffset, 0);
                }
            }
            else {
                if (this.stage === 0) {
                    this.offset = 0;
                }
                else if (this.stage === 2) {
                    this.offset = Math.max(this.maxOffset, 0);
                }

                this.timer -= game.currentScene().eventContext.deltaTimeMillis;

                if (this.timer < 0) {
                    this.stage = (this.stage + 1) % 3;
                    this.timer = this.pauseTime;
                }
            }

            const canvas = image.create(this.maxCharacters * charW + charW, charH);
            if (letterOffset) {
                this.partialCanvas.fill(0);
                this.partialCanvas.print(this.text.charAt(startIndex), letterOffset, 0, color, font);
                canvas.drawTransparentImage(this.partialCanvas, 0, 0);
            }
            else {
                canvas.print(this.text.charAt(startIndex), 0, 0, color, font);
            }

            for (let i = 1; i < this.maxCharacters; i++) {
                canvas.print(
                    this.text.charAt(startIndex + i),
                    i * charW + letterOffset,
                    0,
                    color,
                    font
                );
            }

            if (scale === 1) {
                screen.drawTransparentImage(canvas, left, top);
            }
            else {
                const drawWidth = this.maxCharacters * charW;
                const scaledWidth = (drawWidth * scale) | 0;
                const scaledHeight = (charH * scale) | 0;
                screen.blit(
                    left, top,
                    scaledWidth, scaledHeight,
                    canvas,
                    0, 0,
                    drawWidth, charH,
                    true, false
                );
            }
        }
    }

    function getLayoutMetrics(layout: MenuLocation) {
        const padding = 2;
        const scale = story.UI_SCALE;

        const maxWidth = Math.idiv(screen.width - (padding << 1), scale);
        const maxHeight = Math.idiv(screen.height - (padding << 1), scale);
        const halfWidth = Math.idiv(screen.width >> 1, scale);
        const halfHeight = Math.idiv(screen.height >> 1, scale);

        switch (layout) {
            case MenuLocation.FullScreen:
                return new LayoutMetrics(padding, padding, maxWidth, maxHeight);
            case MenuLocation.Center:
                return new LayoutMetrics(0, 0, 0, 0);
            case MenuLocation.TopHalf:
                return new LayoutMetrics(padding, padding, maxWidth, maxHeight >> 1);
            case MenuLocation.RightHalf:
                return new LayoutMetrics(halfWidth, padding, maxWidth >> 1, maxHeight);
            case MenuLocation.BottomHalf:
                return new LayoutMetrics(padding, halfHeight, maxWidth, maxHeight >> 1);
            case MenuLocation.LeftHalf:
                return new LayoutMetrics(padding, padding, maxWidth >> 1, maxHeight);
            case MenuLocation.TopRight:
                return new LayoutMetrics(halfWidth, padding, maxWidth >> 1, maxHeight >> 1);
            case MenuLocation.BottomRight:
                return new LayoutMetrics(halfWidth, halfHeight, maxWidth >> 1, maxHeight >> 1);
            case MenuLocation.BottomLeft:
                return new LayoutMetrics(padding, halfHeight, maxWidth >> 1, maxHeight >> 1);
            case MenuLocation.TopLeft:
                return new LayoutMetrics(padding, padding, maxWidth >> 1, maxHeight >> 1);
        }
    }
}