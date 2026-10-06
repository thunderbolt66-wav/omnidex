# Keep WebKit and JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-dontwarn androidx.webkit.**
-keep class androidx.webkit.** { *; }
