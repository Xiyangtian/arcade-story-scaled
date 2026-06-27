namespace story {
    export class ShapeSprite extends Sprite {
        color: number;
        parent: Task;

        constructor(z: number) {
            super(image.create(1, 1));
            this.z = z;
            this.left = 0;
            this.top = 0;
            this.color = 1;
            this.setFlag(SpriteFlag.Ghost, true);
        }

        setColor(color: number) {
            this.color = color;
        }

        attachToTask(task: Task) {
            this.parent = task;
        }

        destroy(effect?: any, duration?: number) {
            super.destroy(effect, duration);
            if (this.parent && this.parent.cancel) {
                this.parent.cancel();
            }
        }

        __update(camera: scene.Camera, dt: number) {
            if (this.parent && this.parent.isDone()) {
                this.destroy();
            }
        }
    }

    export class TextSprite extends ShapeSprite {
        text: string;

        setColor(color: number) {
            super.setColor(color);
            this.refresh();
        }

        setText(text: string) {
            this.text = text;
            this.refresh();
        }

        getWidth() {
            if (!this.text) return 0;
            const font = image.getFontForText(this.text);
            return font.charWidth * this.text.length * story.UI_SCALE;
        }

        getHeight() {
            if (!this.text) return 0;
            const font = image.getFontForText(this.text);
            return font.charHeight * story.UI_SCALE;
        }

        refresh() {
            if (!this.text) {
                this.setImage(image.create(1, 1));
                return;
            }
            const font = image.getFontForText(this.text);
            const w = font.charWidth * this.text.length;
            const h = font.charHeight;
            const img = image.create(w, h);
            img.print(this.text, 0, 0, this.color);
            this.setImage(img);
            this.setScale(story.UI_SCALE);
        }
    }

    export class RectangleSprite extends ShapeSprite {
        logicalWidth: number;
        logicalHeight: number;
        isOutline: boolean

        setColor(color: number) {
            super.setColor(color);
            this.refresh();
        }

        setDimensions(width: number, height: number) {
            this.logicalWidth = width;
            this.logicalHeight = height;
            this.refresh();
        }

        setSolid(isSolid: boolean) {
            this.isOutline = !isSolid;
            this.refresh();
        }

        refresh() {
            if (!this.logicalWidth || !this.logicalHeight) {
                this.setImage(image.create(1, 1));
                return;
            }
            const img = image.create(this.logicalWidth, this.logicalHeight);
            if (this.isOutline) {
                img.drawRect(0, 0, this.logicalWidth, this.logicalHeight, this.color);
            }
            else {
                img.fillRect(0, 0, this.logicalWidth, this.logicalHeight, this.color);
            }
            this.setImage(img);
            this.setScale(story.UI_SCALE);
        }
    }

    export class IconSprite extends ShapeSprite {
        icon: Image;

        setIcon(icon: Image) {
            this.icon = icon;
            this.setImage(icon);
            this.setScale(story.UI_SCALE);
        }
    }
}
