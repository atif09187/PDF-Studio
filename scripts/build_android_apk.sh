#!/usr/bin/env bash
set -e

echo "=== 1. PREPARING ANDROID PROJECT DIRECTORIES ==="
ANDROID_DIR="android-project"
rm -rf "$ANDROID_DIR"
mkdir -p "$ANDROID_DIR/src/com/ch_atif_gondal/pdfstudio"
mkdir -p "$ANDROID_DIR/res/values"
mkdir -p "$ANDROID_DIR/res/mipmap-mdpi"
mkdir -p "$ANDROID_DIR/res/mipmap-hdpi"
mkdir -p "$ANDROID_DIR/res/mipmap-xhdpi"
mkdir -p "$ANDROID_DIR/res/mipmap-xxhdpi"
mkdir -p "$ANDROID_DIR/res/mipmap-xxxhdpi"
mkdir -p "$ANDROID_DIR/assets/www"
mkdir -p "$ANDROID_DIR/build/classes"
mkdir -p "release"
mkdir -p "public/downloads"

echo "=== 2. GENERATING APP ICONS FROM Logo.png ==="
LOGO_SOURCE="public/logo.png"
if [ ! -f "$LOGO_SOURCE" ]; then
  LOGO_SOURCE="Logo.png"
fi

convert "$LOGO_SOURCE" -resize 48x48   "$ANDROID_DIR/res/mipmap-mdpi/ic_launcher.png"
convert "$LOGO_SOURCE" -resize 72x72   "$ANDROID_DIR/res/mipmap-hdpi/ic_launcher.png"
convert "$LOGO_SOURCE" -resize 96x96   "$ANDROID_DIR/res/mipmap-xhdpi/ic_launcher.png"
convert "$LOGO_SOURCE" -resize 144x144 "$ANDROID_DIR/res/mipmap-xxhdpi/ic_launcher.png"
convert "$LOGO_SOURCE" -resize 192x192 "$ANDROID_DIR/res/mipmap-xxxhdpi/ic_launcher.png"

echo "=== 3. COPYING WEB ASSETS TO ANDROID ASSETS/WWW ==="
cp -r dist/* "$ANDROID_DIR/assets/www/"
rm -f "$ANDROID_DIR/assets/www/Logo.png"

echo "=== 4. CREATING ANDROID MANIFEST & RESOURCES ==="
cat << 'EOF' > "$ANDROID_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.ch_atif_gondal.pdfstudio"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:hardwareAccelerated="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

cat << 'EOF' > "$ANDROID_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">PDF Studio</string>
</resources>
EOF

cat << 'EOF' > "$ANDROID_DIR/res/values/styles.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.NoTitleBar">
        <item name="android:windowBackground">@android:color/black</item>
    </style>
</resources>
EOF

echo "=== 5. CREATING MAINACTIVITY.JAVA ==="
cat << 'EOF' > "$ANDROID_DIR/src/com/ch_atif_gondal/pdfstudio/MainActivity.java"
package com.ch_atif_gondal.pdfstudio;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

public class MainActivity extends Activity {
    private WebView mWebView;
    private ValueCallback<Uri[]> mFilePathCallback;
    private final static int FILECHOOSER_RESULTCODE = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(0xFF0F172A);
        }

        mWebView = new WebView(this);
        setContentView(mWebView);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("file://") || url.startsWith("http://") || url.startsWith("https://")) {
                    return false;
                }
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }
        });

        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
                if (mFilePathCallback != null) {
                    mFilePathCallback.onReceiveValue(null);
                }
                mFilePathCallback = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILECHOOSER_RESULTCODE);
                } catch (Exception e) {
                    mFilePathCallback = null;
                    Toast.makeText(MainActivity.this, "Cannot Open File Chooser", Toast.LENGTH_LONG).show();
                    return false;
                }
                return true;
            }
        });

        mWebView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (mFilePathCallback == null) return;
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && data != null) {
                String dataString = data.getDataString();
                if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                } else if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) {
                        results[i] = data.getClipData().getItemAt(i).getUri();
                    }
                }
            }
            mFilePathCallback.onReceiveValue(results);
            mFilePathCallback = null;
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
EOF

ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"

echo "=== 6. AAPT GENERATING R.JAVA ==="
aapt package -f -m \
  -J "$ANDROID_DIR/src" \
  -M "$ANDROID_DIR/AndroidManifest.xml" \
  -S "$ANDROID_DIR/res" \
  -I "$ANDROID_JAR"

echo "=== 7. COMPILING JAVA SOURCE CODE ==="
javac -source 8 -target 8 \
  -bootclasspath "$ANDROID_JAR" \
  -d "$ANDROID_DIR/build/classes" \
  "$ANDROID_DIR/src/com/ch_atif_gondal/pdfstudio/"*.java

echo "=== 8. CONVERTING BYTECODE TO DALVIK DEX (classes.dex) ==="
/usr/bin/dalvik-exchange --dex --output="$ANDROID_DIR/build/classes.dex" "$ANDROID_DIR/build/classes"

echo "=== 9. PACKAGING APK ASSETS & RESOURCES ==="
aapt package -f \
  -M "$ANDROID_DIR/AndroidManifest.xml" \
  -S "$ANDROID_DIR/res" \
  -A "$ANDROID_DIR/assets" \
  -I "$ANDROID_JAR" \
  -F "$ANDROID_DIR/build/unaligned.apk"

echo "=== 10. ADDING CLASSES.DEX TO UNALIGNED APK ==="
(cd "$ANDROID_DIR/build" && zip -u unaligned.apk classes.dex)

echo "=== 11. ZIPALIGNING APK ==="
zipalign -v -p 4 "$ANDROID_DIR/build/unaligned.apk" "$ANDROID_DIR/build/aligned.apk"

echo "=== 12. GENERATING RELEASE KEYSTORE IF NOT EXISTS (LIFETIME UNLIMITED VALIDITY) ==="
KEYSTORE="release/release.keystore"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v -keystore "$KEYSTORE" \
    -alias pdfstudio \
    -keyalg RSA \
    -keysize 2048 \
    -validity 36500 \
    -storepass pdfstudio2026 \
    -keypass pdfstudio2026 \
    -dname "CN=Ch Atif Gondal, OU=PDF Studio, O=Ch Atif Gondal, L=Lahore, ST=Punjab, C=PK"
fi

echo "=== 13. SIGNING RELEASE APK WITH APKSIGNER ==="
FINAL_APK="release/PDF_Studio_Release.apk"
apksigner sign --ks "$KEYSTORE" \
  --ks-key-alias pdfstudio \
  --ks-pass pass:pdfstudio2026 \
  --key-pass pass:pdfstudio2026 \
  --out "$FINAL_APK" \
  "$ANDROID_DIR/build/aligned.apk"

echo "=== 14. VERIFYING APK ==="
apksigner verify --verbose "$FINAL_APK"
aapt dump badging "$FINAL_APK" | head -n 12

echo "=== 15. COPYING APK TO PUBLIC DOWNLOAD DIRECTORY ==="
cp "$FINAL_APK" "public/PDF_Studio_Release.apk"
cp "$FINAL_APK" "public/downloads/PDF_Studio_Release.apk"

echo "=== 16. PACKAGING COMPLETE PROJECT SOURCE CODE INTO ZIP ==="
ZIP_OUTPUT="release/PDF_Studio_Project_Source.zip"
zip -q -r "$ZIP_OUTPUT" . -x "node_modules/*" ".git/*" "android-project/build/*" "*.tmp"
cp "$ZIP_OUTPUT" "public/PDF_Studio_Project_Source.zip"
cp "$ZIP_OUTPUT" "public/downloads/PDF_Studio_Project_Source.zip"

echo "=== APK BUILD COMPLETE ==="
ls -lh "$FINAL_APK"
ls -lh "$ZIP_OUTPUT"
