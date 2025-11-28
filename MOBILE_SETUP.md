# Mobile Setup Guide

This guide will help you set up iOS and Android development environments for the mobile shell.

## Prerequisites

### iOS (macOS only)

- **Xcode** (latest version from App Store)
- **Xcode Command Line Tools**: `xcode-select --install`
- **CocoaPods**: `sudo gem install cocoapods`

### Android

- **Java Development Kit (JDK)**: JDK 17 or higher
- **Android Studio** (latest version)
- **Android SDK**: Installed via Android Studio
- **Environment Variables**: Set `ANDROID_HOME` and add to `PATH`

## iOS Setup

### 1. Install CocoaPods (if not already installed)

```bash
sudo gem install cocoapods
```

### 2. Install iOS Dependencies

```bash
cd apps/mobile-shell/ios
pod install
cd ../..
```

### 3. Open in Xcode

```bash
open apps/mobile-shell/ios/MobileShell.xcworkspace
```

**Note**: Always open `.xcworkspace`, not `.xcodeproj` when using CocoaPods.

### 4. Configure Xcode Project

In Xcode:

1. Select the **MobileShell** project in the navigator
2. Select the **MobileShell** target
3. Go to **Signing & Capabilities** tab
4. Select your **Team** (Apple Developer account)
5. Xcode will automatically generate a provisioning profile

### 5. Select Simulator or Device

- **Simulator**: Choose from the device dropdown (e.g., iPhone 15 Pro)
- **Physical Device**: Connect via USB, trust the computer, select device

### 6. Run the App

**Option A: Using Nx (Recommended)**

```bash
# Terminal 1: Start Metro bundler
npm run start:mobile

# Terminal 2: Run on iOS
nx run-ios mobile-shell
```

**Option B: Using Xcode**

1. Make sure Metro bundler is running (`npm run start:mobile`)
2. In Xcode, click the **Play** button (▶️) or press `Cmd+R`
3. The app will build and launch on the selected simulator/device

### 7. Troubleshooting iOS

**If pods fail to install:**

```bash
cd apps/mobile-shell/ios
pod deintegrate
pod install
```

**If build fails:**

- Clean build folder: `Cmd+Shift+K` in Xcode
- Delete `DerivedData`: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- Rebuild: `Cmd+B`

## Android Setup

### 1. Install Android Studio

1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. Install Android SDK, Android SDK Platform, and Android Virtual Device (AVD)

### 2. Configure Environment Variables

Add to your `~/.zshrc` (or `~/.bash_profile`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Then reload:

```bash
source ~/.zshrc
```

### 3. Create Android Virtual Device (AVD)

1. Open Android Studio
2. Go to **Tools > Device Manager**
3. Click **Create Device**
4. Select a device (e.g., Pixel 6)
5. Select a system image (e.g., API 33)
6. Click **Finish**

### 4. Open Android Project

```bash
# Open Android Studio
open -a "Android Studio" apps/mobile-shell/android
```

Or manually:

1. Open Android Studio
2. **File > Open**
3. Navigate to `apps/mobile-shell/android`
4. Click **OK**

### 5. Configure Gradle

Android Studio will automatically sync Gradle. If it doesn't:

- Click **Sync Now** in the notification bar
- Or go to **File > Sync Project with Gradle Files**

### 6. Run the App

**Option A: Using Nx (Recommended)**

```bash
# Terminal 1: Start Metro bundler
npm run start:mobile

# Terminal 2: Run on Android
nx run-android mobile-shell
```

**Option B: Using Android Studio**

1. Make sure Metro bundler is running (`npm run start:mobile`)
2. Start an emulator from Device Manager
3. In Android Studio, click **Run** (▶️) or press `Shift+F10`
4. Select the running emulator or connected device

### 7. Troubleshooting Android

**If Gradle sync fails:**

```bash
cd apps/mobile-shell/android
./gradlew clean
```

**If emulator won't start:**

- Check that virtualization is enabled in BIOS
- Try cold boot: **Device Manager > Actions > Cold Boot Now**

**If build fails:**

- Clean build: `cd apps/mobile-shell/android && ./gradlew clean`
- Invalidate caches: **File > Invalidate Caches / Restart**

## Quick Start Commands

### Start Metro Bundler

```bash
npm run start:mobile
```

### Run on iOS Simulator

```bash
nx run-ios mobile-shell
```

### Run on Android Emulator

```bash
nx run-android mobile-shell
```

### Run on Specific Device

```bash
# iOS: List available devices
xcrun simctl list devices

# Android: List available devices
adb devices

# Then specify device
nx run-ios mobile-shell --device="iPhone 15 Pro"
nx run-android mobile-shell --device="emulator-5554"
```

## Development Workflow

1. **Start Metro bundler** (keep running):

   ```bash
   npm run start:mobile
   ```

2. **Run the app** (in separate terminal):

   ```bash
   # iOS
   nx run-ios mobile-shell

   # Android
   nx run-android mobile-shell
   ```

3. **Make changes** to your React Native code
4. **Press `R` twice** in the Metro bundler terminal to reload
5. Or **shake device** and select "Reload" (physical devices)

## Hot Reloading

Hot reloading should work automatically. When you save a file:

- The app will automatically reload
- State is preserved (with Fast Refresh)

To manually reload:

- **iOS**: `Cmd+R` in simulator, or shake device
- **Android**: `R` twice in Metro terminal, or shake device

## Debugging

### React Native Debugger

1. Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
2. Select **Debug**
3. Opens Chrome DevTools at `http://localhost:8081/debugger-ui`

### Flipper (Optional)

- Install Flipper: `brew install --cask flipper`
- Launch Flipper
- It will automatically connect to your React Native app

## Common Issues

### Metro bundler port already in use

```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

### iOS build fails with "No such module"

```bash
cd apps/mobile-shell/ios
pod install
```

### Android build fails with "SDK location not found"

Set `ANDROID_HOME` environment variable (see Android Setup step 2)

### App won't connect to Metro bundler

- Check that Metro is running on port 8081
- Verify device/emulator can reach `localhost:8081`
- For physical devices, use your computer's IP: `adb reverse tcp:8081 tcp:8081`
