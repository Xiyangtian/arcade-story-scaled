# arcade-story-scaled

支持 UI 缩放的 MakeCode Arcade 故事对话扩展。

基于微软原版 [arcade-storytelling](https://github.com/microsoft/arcade-storytelling) 修改。

## 主要功能

### 缩放

- `story.setScale(scale)` - 手动设置 UI 缩放比例（如不设置，默认根据屏幕分辨率自动计算）

### 文本

- `story.printCharacterText(text, label?)` - 在屏幕下方显示角色对话，可附加角色名称标签
- `story.spriteSayText(sprite, text, timeOnScreen?)` - 在指定精灵上方显示气泡对话，持续指定毫秒后自动消失
- `story.printText(text, x, y, foreground?, background?, speed?)` - 在指定坐标打印文本，可自定义颜色、背景和打字速度
- `story.printDialog(text, x, y, width, height, foreground?, background?, speed?)` - 在指定位置显示自定义大小的对话框
- `story.setSoundEnabled(enabled)` - 开启或关闭打字时的音效
- `story.setPagePause(pagePauseMillis, finalPagePauseMillis)` - 设置翻页时的暂停时间（毫秒）

### 移动

- `story.spriteMoveToLocation(sprite, x, y, speed)` - 让精灵以指定速度移动到目标坐标
- `story.cancelMove(sprite)` - 取消精灵正在进行的移动

### 过场动画

- `story.startCutscene(callback)` - 开始过场动画，内部代码会按顺序执行
- `story.cancelCutscene()` - 取消当前正在进行的过场动画
- `story.cancelAllCutscenes()` - 取消所有过场动画

### 菜单

- `story.showPlayerChoices(choice1, choice2, choice3?, choice4?, choice5?)` - 显示玩家选项菜单（支持 2~5 个选项）
- `story.lastAnswerEquals(choice)` - 判断玩家上次选择的是否等于指定选项
- `story.getLastAnswer()` - 获取玩家上次选择的选项文本
- `story.isMenuOpen()` - 判断菜单当前是否处于打开状态

### 场景

- `story.pushScene()` - 压入场景（保存当前场景状态）
- `story.popScene()` - 弹出场景（恢复到上一个场景状态）
- `story.clearScene()` - 清空当前场景
- `story.cancelCurrentText()` - 取消当前正在显示的文本

### 序列

- `story.queueStoryPart(callback)` - 将一段故事代码加入队列，按顺序执行
- `story.clearStoryQueue()` - 清空故事队列

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

## 屏幕分辨率设置

MakeCode Arcade 默认屏幕分辨率为 160x120。如果你使用更高的分辨率（如 240x180 或 320x240），需要在项目开头添加以下代码：

```typescript
namespace userconfig {
    export const ARCADE_SCREEN_WIDTH = 240
    export const ARCADE_SCREEN_HEIGHT = 180
}
```

设置后，本扩展会根据屏幕尺寸自动计算合适的 UI 缩放比例。也可以手动调用 `story.setScale()` 覆盖自动计算的值。

### 常用分辨率与缩放比例

| 屏幕分辨率 | 自动缩放比例 |
|---|---|
| 160x120 | 1 |
| 240x180 | 1.5 |
| 320x240 | 2 |

## UI 缩放说明

通过 `story.setScale()` 可以调整所有 UI 元素（对话、菜单、文本）的显示比例：
- `1` - 默认大小（适合 160x120 屏幕）
- `1.5` - 1.5 倍缩放（适合 240x180 屏幕）
- `2` - 2 倍缩放（适合 320x240 屏幕）

支持任意小数缩放，如 `1.2`、`1.8` 等。
