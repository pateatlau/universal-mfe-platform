# Android Setup - Step by Step Guide

## ✅ What's Already Done

Great news! You already have:

- ✅ Java 17 installed
- ✅ Android SDK installed at `~/Library/Android/sdk`
- ✅ Android Studio installed
- ✅ Android platforms (API 31 and 33) installed
- ✅ Environment variables configured

## Step 1: Verify Environment Variables

The environment variables have been added to your `~/.zshrc` file.

**To verify they're working**, open a **new terminal window** and run:

```bash
echo $ANDROID_HOME
```

You should see: `/Users/patea/Library/Android/sdk`

If you see nothing, run:

```bash
source ~/.zshrc
```

## Step 2: Create an Android Virtual Device (AVD)

An AVD is a virtual Android phone that runs on your computer. Here's how to create one:

### Option A: Using Android Studio (Recommended for Beginners)

1. **Open Android Studio**

   ```bash
   open -a "Android Studio"
   ```

2. **Wait for Android Studio to fully load** (first time may take a few minutes)

3. **Open Device Manager**
   - Click on **More Actions** (three dots) in the top right
   - Or go to: **Tools > Device Manager**
   - Or click the **Device Manager** icon in the toolbar (phone icon)

4. **Create Virtual Device**
   - Click **Create Device** button
   - You'll see a list of device definitions

5. **Choose a Device**
   - For beginners, I recommend: **Pixel 6** or **Pixel 7**
   - Click **Next**

6. **Select System Image**
   - Choose **API Level 33** (Android 13) - you already have this installed
   - If you see a download icon, click it to download (may take a few minutes)
   - Click **Next**

7. **Verify Configuration**
   - Name: Keep default or change to something like "Pixel_6_API_33"
   - Click **Finish**

8. **Your AVD is Ready!**
   - You'll see it in the Device Manager list
   - Click the **Play** button (▶️) to start it
   - Wait for the emulator to boot (first time may take 1-2 minutes)

### Option B: Using Command Line (Advanced)

If you prefer command line:

```bash
# List available system images
sdkmanager --list | grep "system-images"

# Create AVD (this is just an example - adjust as needed)
avdmanager create avd -n Pixel_6_API_33 -k "system-images;android-33;google_apis;x86_64" -d "pixel_6"
```

## Step 3: Start the Emulator

**Using Android Studio:**

- Open Device Manager
- Click the **Play** button (▶️) next to your AVD
- Wait for it to boot (you'll see the Android home screen)

**Using Command Line:**

```bash
emulator -avd Pixel_6_API_33 &
```

**Verify it's running:**

```bash
adb devices
```

You should see something like:

```
List of devices attached
emulator-5554    device
```

## Step 4: Run Your React Native App

Now that everything is set up, let's run your mobile shell app!

### Terminal 1: Start Metro Bundler

```bash
cd /Users/patea/2026/projects/universal-mfe-platform
npm run start:mobile
```

Keep this terminal running! You should see the Metro bundler welcome screen.

### Terminal 2: Run Android App

Open a **new terminal window** and run:

```bash
cd /Users/patea/2026/projects/universal-mfe-platform
nx run-android mobile-shell
```

**What happens:**

1. Gradle will build your Android app (first time takes 2-5 minutes)
2. The app will install on your emulator
3. The app will launch automatically

### If You See Errors

**"SDK location not found":**

```bash
# Make sure environment variables are set
source ~/.zshrc
echo $ANDROID_HOME
```

**"No devices found":**

```bash
# Check if emulator is running
adb devices

# If empty, start emulator from Android Studio Device Manager
```

**"Gradle sync failed":**

```bash
cd apps/mobile-shell/android
./gradlew clean
```

## Step 5: Development Workflow

Once everything is running:

1. **Metro Bundler** should be running in Terminal 1
2. **Emulator** should be running with your app
3. **Make changes** to your code (e.g., `apps/mobile-shell/src/app/App.tsx`)
4. **Press `R` twice** in the Metro bundler terminal to reload
5. Or **shake the emulator** (Ctrl+M or Cmd+M) and select "Reload"

## Troubleshooting

### Emulator Won't Start

- Make sure virtualization is enabled in your Mac's System Settings
- Try cold boot: Device Manager > Actions > Cold Boot Now
- Check Android Studio logs: Help > Show Log in Finder

### App Won't Connect to Metro

- Make sure Metro is running on port 8081
- Check: `lsof -i :8081`
- In emulator, press `Ctrl+M` (or `Cmd+M`) and select "Settings"
- Make sure "Debug server host & port" is set to `localhost:8081`

### Build Fails

```bash
# Clean everything
cd apps/mobile-shell/android
./gradlew clean

# Delete build folders
rm -rf apps/mobile-shell/android/app/build
rm -rf apps/mobile-shell/android/build

# Try again
cd ../..
nx run-android mobile-shell
```

## Quick Reference Commands

```bash
# Check Android setup
echo $ANDROID_HOME
adb devices
adb version

# Start emulator (if you know the AVD name)
emulator -avd Pixel_6_API_33 &

# List all AVDs
emulator -list-avds

# Run app
npm run start:mobile          # Terminal 1
nx run-android mobile-shell   # Terminal 2

# Reload app
# Press R twice in Metro terminal, or shake emulator
```

## Next Steps

Once Android is working:

1. Try making a small change to your app code
2. See it hot-reload automatically
3. Then we can set up iOS! 🎉
