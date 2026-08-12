# ABHI LUDO — Android

This is a complete playable mobile Ludo application, not a visual mockup.

Included:
- 2P / 3P / 4P local Pass & Play
- Computer mode with AI players
- Classic / Quick / Team Up selections
- 4 tokens per player
- Dice, six-to-enter, six extra turn
- Safe cells
- Captures
- Home lanes and exact finish
- Winner detection
- Animated token movement/highlight
- Sound/vibration toggles
- Local coin persistence
- Mobile-first premium UI
- Capacitor Android packaging
- GitHub Actions APK build

## GitHub APK build
Upload all files to the repository root, commit to `main`, then open:
Actions → Build ABHI LUDO APK → Run workflow.

After the workflow finishes:
Actions → latest run → Artifacts → ABHI-LUDO-APK.

The APK is a debug APK intended for direct testing/installation. For Play Store release, generate a signed release build with your own keystore.
