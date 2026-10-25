# Mobile Guide - ECLIPSE RUN: THE LOST KINGDOM

## Playing on Mobile

### Option 1: Local Network (Same WiFi)
1. On your Windows PC, find your local IP address:
   ```powershell
   ipconfig
   ```
   Look for IPv4 Address (e.g., 192.168.1.100)

2. Start the server (already running, or restart):
   ```powershell
   cd C:\Users\pc\Documents\eclipse-run
   node server.js
   ```

3. On your mobile phone (connected to same WiFi), open Chrome/Browser and go to:
   ```
   http://YOUR-PC-IP:8000
   ```
   (e.g., http://192.168.1.100:8000)

### Option 2: Using ngrok (Access from anywhere)
If you want to play outside your WiFi:
```powershell
npx ngrok http 8000
```
Use the provided https URL on your phone.

## Mobile Controls

### Touch Gestures (Swipe)
- **Swipe Left** - Move to left lane
- **Swipe Right** - Move to right lane  
- **Swipe Up** - Jump
- **Swipe Down** - Slide

### On-Screen Buttons
Large buttons appear at bottom of screen:
- ◀ ▶ (Left/Right lanes)
- ▲ (Jump)
- ▼ (Slide)

### Other
- **Pause Button (⏸)** - Top right on mobile HUD
- **Portrait/Landscape** - Both supported, rotates automatically

## Settings

In Settings menu:
- **Mobile Performance Mode** - Enable for weaker devices (reduces shadows/particles)
- **Show Touch Controls** - Toggle on-screen buttons

## Tips for Mobile

- Use landscape mode for better visibility
- Enable Performance Mode if game lags
- Touch targets are sized for easy tapping
- Game works offline after first load
- Orientation changes are handled automatically

## Troubleshooting

- **Can't connect**: Make sure phone and PC are on same WiFi network
- **Laggy**: Enable Mobile Performance Mode in Settings
- **Controls not responding**: Make sure game is running (not paused) and check touch toggle
- **Screen zooming**: Game prevents zoom - if issues persist, refresh page
- **Buttons behind browser UI**: Use landscape mode or fullscreen
