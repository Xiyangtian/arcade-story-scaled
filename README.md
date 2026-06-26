# arcade-simple-story

A simplified story text dialog extension for MakeCode Arcade.

## Features

- `story.printCharacterText(text, label?)` - Print character dialog at the bottom of the screen
- `story.spriteSayText(sprite, text)` - Show speech bubble above a sprite
- `story.setScale(scale)` - Set UI scale factor for high resolution screens
- `story.setSoundEnabled(enabled)` - Enable/disable typing sound

## Usage

```typescript
// Set UI scale for 320x240 screen
story.setScale(2)

// Show dialog with label
story.printCharacterText("Hello world!", "Player")

// Show speech bubble above sprite
story.spriteSayText(mySprite, "Hi there!")
```
