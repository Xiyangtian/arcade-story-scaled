# arcade-story-scaled

支持 UI 缩放的 MakeCode Arcade 故事对话扩展。

基于微软原版 [arcade-storytelling](https://github.com/microsoft/arcade-storytelling) 修改。

## 主要功能

- `story.printCharacterText(text, label?)` - 在屏幕下方显示角色对话（带标签）
- `story.spriteSayText(sprite, text)` - 在精灵上方显示气泡对话
- `story.printText(text, x, y)` - 在指定位置打印文本
- `story.printDialog(text, x, y, width, height)` - 在指定位置显示自定义大小的对话框
- `story.showMenu(title, choices)` - 显示选项菜单
- `story.setScale(scale)` - 设置 UI 缩放比例（支持小数，如 1.2、1.5）
- `story.setSoundEnabled(enabled)` - 开启/关闭打字音效

## 使用示例

```typescript
// 设置 UI 缩放（适合高分辨率屏幕）
story.setScale(1.5)

// 显示角色对话
story.printCharacterText("你好，世界！", "玩家")

// 在精灵上方显示气泡
story.spriteSayText(mySprite, "嗨！")

// 在指定位置打印文本
story.printText("提示文字", 80, 60)

// 显示选项菜单
story.showMenu("请选择", ["选项A", "选项B", "选项C"])
```

## UI 缩放说明

通过 `story.setScale()` 可以调整所有 UI 元素（对话、菜单、文本）的显示比例：
- `1` - 默认大小（适合 160x120 屏幕）
- `1.5` - 1.5 倍缩放（适合 240x180 屏幕）
- `2` - 2 倍缩放（适合 320x240 屏幕）

支持任意小数缩放，如 `1.2`、`1.8` 等。
