# ECLIPSE RUN: THE LOST KINGDOM

An original 3D fantasy endless runner game set in the shattered kingdom of Aetheria. Guide Lyra and her magical companion Lumi through ancient ruins, enchanted forests, crystal abysses, celestial falls, and the Eclipse Citadel.

## Story

The lost kingdom of Aetheria once floated above the clouds, protected by seven magical crystals. During a mysterious celestial eclipse, the kingdom shattered and a dark creature called the Shadow Guardian awakened. 

You control Lyra, an adventurous explorer who discovers the last surviving Eclipse Crystal. She must escape through ancient ruins, enchanted forests, floating islands, and dangerous crystal caves. Her magical companion Lumi guides her through the journey.

## Features

- **Beautiful 3D Fantasy World** - Midnight blue/violet skies, glowing crystals, atmospheric fog, and stunning environments
- **Original Characters** - Play as Lyra with her glowing crystal pendant, accompanied by Lumi
- **3-Lane Endless Runner** - Classic lane-based gameplay with smooth controls
- **5 Unique Zones** - Moonlit Ruins, Whispering Forest, Crystal Abyss, Celestial Falls, Eclipse Citadel
- **Collectibles** - Moon Shards and rare Eclipse Crystals
- **Power-ups** - Shield protection and Crystal Dash energy bursts
- **Increasing Difficulty** - Speed builds up as you progress
- **Local High Scores** - Your best run is saved
- **Polished UI** - Beautiful menus, HUD, pause screen, and game over screen

## Controls (Desktop/Chrome)

- **A / ←** - Move Left
- **D / →** - Move Right  
- **W / ↑ / SPACE** - Jump
- **S / ↓** - Slide
- **ESC** - Pause/Resume
- **R** - Restart (after Game Over)

## How to Run on Windows

### Option 1: Using Node.js (Recommended)

1. Open PowerShell or Command Prompt
2. Navigate to the game folder:
```powershell
cd C:\Users\pc\Documents\eclipse-run
```
3. Start the local server:
```powershell
node server.js
```
4. Open Google Chrome and go to: **http://localhost:8000**

### Option 2: Using Python

```powershell
cd C:\Users\pc\Documents\eclipse-run
python -m http.server 8000
```
Then open Chrome to http://localhost:8000

## Requirements

- Windows 10/11
- Google Chrome (recommended)
- Node.js (for server.js) or Python
- WebGL support (enabled by default in Chrome)

## Technical Details

- Built with HTML5, CSS3, JavaScript
- 3D rendering powered by Three.js
- Browser-based, no installation required
- Responsive design
- Object pooling for performance
- Local storage for high scores

## Tips

- Jump over pillars and low obstacles
- Slide under gates and barriers
- Collect Eclipse Crystals to charge Crystal Dash
- Watch for zone changes as you progress deeper into Aetheria
- Try to beat your best score!

*The kingdom awaits its hero...*
