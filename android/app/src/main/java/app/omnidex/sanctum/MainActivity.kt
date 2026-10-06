package app.omnidex.sanctum

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.RenderProcessGoneDetail
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private var webView: WebView? = null
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val intentData = result.data
            val uris: Array<Uri>? = when {
                intentData?.clipData != null -> {
                    val clipData = intentData.clipData!!
                    Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                }
                intentData?.data != null -> arrayOf(intentData.data!!)
                else -> null
            }
            filePathCallback?.onReceiveValue(uris)
        } else {
            filePathCallback?.onReceiveValue(null)
        }
        filePathCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            // Apply obsidian background to decorView immediately
            window.decorView.setBackgroundColor(Color.parseColor("#0A0C10"))

            val rootLayout = FrameLayout(this).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                setBackgroundColor(Color.parseColor("#0A0C10"))
            }

            val wv = WebView(this).apply {
                layoutParams = FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                setBackgroundColor(Color.parseColor("#0A0C10"))
            }

            rootLayout.addView(wv)
            setContentView(rootLayout)

            webView = wv
            configureWebView(wv)
            setupBackNavigation(wv)

            wv.loadUrl("https://appassets.androidplatform.net/index.html")
        } catch (t: Throwable) {
            Log.e("OmnidexCrash", "Startup exception caught and absorbed", t)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView(wv: WebView) {
        val settings = wv.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.textZoom = 100

        wv.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        wv.overScrollMode = View.OVER_SCROLL_NEVER

        wv.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                val url = request?.url ?: return null
                val host = url.host ?: ""

                // Handle local bundled assets
                if (host.equals("appassets.androidplatform.net", ignoreCase = true) ||
                    host.equals("localhost", ignoreCase = true)
                ) {
                    var path = url.path ?: "/"
                    if (path == "/" || path.isEmpty()) {
                        path = "/index.html"
                    }

                    // Clean and normalize asset subpath
                    val cleanPath = path.trimStart('/')
                        .removePrefix("assets/www/")
                        .removePrefix("www/")

                    val assetPath = "www/$cleanPath"

                    try {
                        val stream = assets.open(assetPath)
                        val mimeType = getMimeType(cleanPath)
                        val responseHeaders = mutableMapOf(
                            "Access-Control-Allow-Origin" to "*",
                            "Cache-Control" to "no-cache",
                            "Content-Type" to mimeType
                        )
                        return WebResourceResponse(mimeType, "UTF-8", 200, "OK", responseHeaders, stream)
                    } catch (e: Exception) {
                        Log.w("OmnidexAsset", "Asset not found: $assetPath (${e.message})")
                    }
                }

                // Default network handling for remote APIs (Google Books, Vercel telemetry, fonts)
                return null
            }

            override fun onRenderProcessGone(
                view: WebView?,
                detail: RenderProcessGoneDetail?
            ): Boolean {
                Log.w("OmnidexNative", "WebView render process reclaimed. Recovering gracefully.")
                try {
                    view?.destroy()
                    recreate()
                } catch (e: Exception) {
                    Log.e("OmnidexNative", "Recovery recreation error", e)
                }
                return true
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                Log.w("OmnidexNative", "Resource error on ${request?.url}: ${error?.description}")
            }
        }

        wv.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                if (consoleMessage != null) {
                    Log.d("OmnidexWeb", "[${consoleMessage.messageLevel()}] ${consoleMessage.message()} (${consoleMessage.sourceId()}:${consoleMessage.lineNumber()})")
                }
                return true
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                try {
                    fileChooserLauncher.launch(intent)
                } catch (e: Exception) {
                    Log.e("OmnidexNative", "Failed to launch file chooser", e)
                    this@MainActivity.filePathCallback?.onReceiveValue(null)
                    this@MainActivity.filePathCallback = null
                    return false
                }
                return true
            }
        }
    }

    private fun setupBackNavigation(wv: WebView) {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (wv.canGoBack()) {
                    wv.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun getMimeType(filePath: String): String {
        val lower = filePath.lowercase()
        return when {
            lower.endsWith(".html") -> "text/html"
            lower.endsWith(".js") || lower.endsWith(".mjs") -> "application/javascript"
            lower.endsWith(".css") -> "text/css"
            lower.endsWith(".svg") -> "image/svg+xml"
            lower.endsWith(".png") -> "image/png"
            lower.endsWith(".jpg") || lower.endsWith(".jpeg") -> "image/jpeg"
            lower.endsWith(".webp") -> "image/webp"
            lower.endsWith(".json") -> "application/json"
            lower.endsWith(".woff2") -> "font/woff2"
            lower.endsWith(".woff") -> "font/woff"
            lower.endsWith(".ttf") -> "font/ttf"
            else -> "application/octet-stream"
        }
    }

    override fun onDestroy() {
        webView?.let {
            it.stopLoading()
            it.destroy()
        }
        webView = null
        super.onDestroy()
    }
}
