namespace story {
    export class MessagePart {
        public readonly text: string;
        public readonly charsPerSecond: number;
        public readonly width: number;
        public readonly height: number;

        constructor(text: string, charsPerSecond: number) {
            this.text = text;
            this.charsPerSecond = charsPerSecond;

            const f = image.getFontForText(text);
            this.width = f.charWidth * text.length;
            this.height = f.charHeight;
        }

        substring(length: number) {
            return new MessagePart(this.text.substr(0, length), this.charsPerSecond);
        }
    }

    const maxPanDistance = 30;

    export class MessageLine {
        public readonly parts: MessagePart[];
        public readonly width: number;
        public readonly height: number;

        constructor(parts: MessagePart[]) {
            this.parts = parts;
            this.width = 0;
            this.height = 0;

            for (const p of parts) {
                this.width += p.width;
                this.height = Math.max(this.height, p.height);
            }
        }

        get text() {
            return this.parts.map(p => p.text).join("");
        }
    }

    export class MessagePage {
        public readonly lines: MessageLine[];

        constructor(lines: MessageLine[]) {
            this.lines = lines;
        }
    }

    const tickSound = new music.Melody("@20,10,0,0 c5:1-150")

    enum BubbleState {
        Printing,
        Stopped,
        Paused
    }

    export class Bubble extends Sprite implements Task {
        protected anchor: Sprite;
        protected cx: number;
        protected cy: number;

        public pagePauseLength = 1000;
        public finalPagePauseLength = 1000;
        public foregroundColor = 15;
        public backgroundColor = 1;

        protected timer: number;
        protected tickPeriod: number;

        protected pageIndex: number;
        protected lineIndex: number;
        protected partIndex: number;
        protected tick: number;

        protected pages: MessagePage[];

        protected endCB: () => void;
        protected padding: number;

        protected state: BubbleState;

        protected centered: boolean;
        protected leftAlign: number;
        protected topAlign: number;

        constructor(z = 1, protected relativeToCamera = false) {
            super(image.create(1, 1));
            this.z = z;
            this.setFlag(SpriteFlag.Ghost, true);
            if (relativeToCamera) {
                this.setFlag(SpriteFlag.RelativeToCamera, true);
            }

            this.cx = 0;
            this.cy = 0;

            this.pageIndex = 0;
            this.lineIndex = 0;
            this.partIndex = 0;
            this.tick = 0;

            this.padding = 2;

            this.state = BubbleState.Stopped;

            this.pages = [];
        }

        isPrinting() {
            return this.state !== BubbleState.Stopped && this.state !== BubbleState.Paused;
        }

        isDone() {
            return this.state === BubbleState.Stopped;
        }

        cancel() {
            this.destroy();
        }

        setAlign(left: number, top: number) {
            this.leftAlign = left;
            this.topAlign = top;
        }

        __update(camera: scene.Camera, dt: number) {
            this.updateCore(game.currentScene().eventContext.deltaTimeMillis);
            if (this.state !== BubbleState.Stopped) {
                this.redraw();
            }
            this.updatePosition(camera);
        }

        protected updatePosition(camera: scene.Camera) {
            const scale = UI_SCALE;
            const img = this.image;
            const width = img.width * scale;
            const height = img.height * scale;

            let left: number;
            let top: number;

            if (this.leftAlign !== undefined) {
                left = this.leftAlign * scale;
                top = this.topAlign * scale;
            }
            else {
                left = this.cx * scale - (width >> 1) - (this.relativeToCamera ? 0 : camera.drawOffsetX);

                if (left + width > screen.width) {
                    if (left + width - screen.width > maxPanDistance * scale) {
                        left -= maxPanDistance * scale;
                    }
                    else {
                        left = screen.width - width;
                    }
                }
                else if (left < 0) {
                    if (left < -maxPanDistance * scale) {
                        left += maxPanDistance * scale;
                    }
                    else {
                        left = 0;
                    }
                }
            }

            if (this.topAlign !== undefined) {
                top = this.topAlign * scale;
            }
            else {
                top = this.cy * scale - (height >> 1) - (this.relativeToCamera ? 0 : camera.drawOffsetY);

                const lines = this.currentPage ? this.currentPage.lines.slice(0, this.lineIndex + 1) : [];
                if (lines.length > 1) {
                    for (let i = 0; i < lines.length - 1; i++) {
                        top -= (lines[i].height * scale) >> 1;
                    }
                }

                if (top + height > screen.height) {
                    if (top + height - screen.height > maxPanDistance * scale) {
                        top -= maxPanDistance * scale;
                    }
                    else {
                        top = screen.height - height;
                    }
                }
                else if (top < 0) {
                    if (top < -maxPanDistance * scale) {
                        top += maxPanDistance * scale;
                    }
                    else {
                        top = 0;
                    }
                }
            }

            this.left = left;
            this.top = top;
        }

        protected redraw() {
            const img = this.image;
            img.fill(this.backgroundColor);

            const page = this.currentPage;
            if (!page) return;

            const lines = page.lines.slice(0, this.lineIndex);
            if (this.currentLine) lines.push(getPartialLine(this.currentLine, this.partIndex, this.tick));

            let top = this.padding;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                let left = this.padding + (this.centered ? ((img.width >> 1) - (line.width >> 1)) : 0);
                for (const part of line.parts) {
                    img.print(part.text, left, top, this.foregroundColor);
                    left += part.width;
                }
                top += line.height;
            }
        }

        protected get currentPage() {
            return this.pages[this.pageIndex];
        }

        protected get currentLine() {
            return this.currentPage && this.currentPage.lines[this.lineIndex];
        }

        protected get currentPart() {
            return this.currentLine && this.currentLine.parts[this.partIndex];
        }

        startMessage(pages: MessagePage[], onEnd?: () => void) {
            this.pages = pages;
            this.endCB = onEnd;
            this.state = BubbleState.Printing;

            this.pageIndex = 0;
            this.lineIndex = 0;
            this.tick = 0;

            this.partIndex = -1;
            this.advancePart();
            this.timer = this.tickPeriod;

            // 计算最大逻辑尺寸
            let width = 20;
            let height = 0;
            for (const page of pages) {
                let pageHeight = this.padding << 1;
                for (const line of page.lines) {
                    width = Math.max(width, line.width + (this.padding << 1));
                    pageHeight += line.height;
                }
                height = Math.max(height, pageHeight);
            }

            this.setImage(image.create(width, height));
            this.setScale(UI_SCALE);
        }

        setAnchor(cx: number, cy: number) {
            this.cx = cx;
            this.cy = cy;
        }

        setAnchorSprite(anchor: Sprite) {
            this.anchor = anchor;

            if (this.anchor) {
                this.setAnchor(this.anchor.x, this.anchor.top - 8);
            }
        }

        setCentered(enabled: boolean) {
            this.centered = enabled;
        }

        stop() {
            this.state = BubbleState.Stopped;
        }

        destroy(effect?: any, duration?: number) {
            super.destroy(effect, duration);
            this.stop();
        }

        protected updateCore(dtMillis: number) {
            if (this.state === BubbleState.Stopped) return;

            if (this.anchor) {
                this.setAnchor(this.anchor.x, this.anchor.top - 8);
            }

            this.timer -= dtMillis;

            while (this.timer < 0) {
                if (this.state === BubbleState.Paused) {
                    this.advancePage();
                    this.timer = this.tickPeriod;
                }
                else {
                    this.tick++;
                    this.timer += this.tickPeriod;
                    playWithVolume(tickSound, 60)

                    if (this.tick >= this.currentPart.text.length) {
                        this.advancePart();
                    }
                }

                if ((this.state as BubbleState) === BubbleState.Stopped) return;
            }
        }

        protected setRate(charsPerSecond: number) {
            this.tickPeriod = (1000 / charsPerSecond) | 0;
        }

        protected advancePart() {
            this.tick = 0;
            this.partIndex++;

            if (this.currentPart) {
                this.setRate(this.currentPart.charsPerSecond);
            }
            else {
                this.advanceLine();
            }
        }

        protected advanceLine() {
            this.lineIndex++;

            if (this.currentLine) {
                this.partIndex = -1;
                this.advancePart();
            }
            else {
                this.state = BubbleState.Paused;
                if (this.pageIndex == this.pages.length - 1) {
                    this.timer += this.finalPagePauseLength
                }
                else {
                    this.timer += this.pagePauseLength;
                }
            }
        }

        protected advancePage() {
            this.pageIndex++;
            this.state = BubbleState.Printing;

            if (this.currentPage) {
                this.lineIndex = -1;
                this.advanceLine();
            }
            else {
                this.state = BubbleState.Stopped;
                if (this.endCB) this.endCB();
            }
        }
    }

    function getPartialLine(line: MessageLine, partIndex: number, tick: number) {
        const parts = line.parts.slice(0, partIndex);
        parts.push(line.parts[partIndex].substring(tick));
        return new MessageLine(parts);
    }

    function playWithVolume(sound: music.Melody, volume: number) {
        if (!_currentCutscene().soundEnabled) return;
        sound.play(volume);
    }

    export function line(text: string, speed: TextSpeed): MessageLine {
        return new MessageLine([new MessagePart(text, speed)]);
    }

    export function page(line1: MessageLine, line2?: MessageLine, line3?: MessageLine, line4?: MessageLine, line5?: MessageLine) {
        return new MessagePage([line1, line2, line3, line4, line5].filter(l => !!l));
    }

    export function say(sprite: Sprite, page: MessagePage) {
        sayPages(sprite, [page]);
    }

    export function sayPages(sprite: Sprite, pages: MessagePage[]) {
        const b = new Bubble();
        b.setAnchorSprite(sprite);
        b.startMessage(pages);
    }
}
