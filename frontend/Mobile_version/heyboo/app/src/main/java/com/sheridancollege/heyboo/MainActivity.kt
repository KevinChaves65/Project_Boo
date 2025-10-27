package com.sheridancollege.heyboo

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebSettings
import android.webkit.WebChromeClient
import android.util.Log

class MainActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    private val TAG = "MainActivity"
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            setContentView(R.layout.activity_main)
            
            // Initialize WebView
            webView = findViewById(R.id.webview)
            
            // Configure WebView settings
            val webSettings: WebSettings = webView.settings
            webSettings.javaScriptEnabled = true
            webSettings.domStorageEnabled = true
            webSettings.allowFileAccess = true
            webSettings.allowContentAccess = true
            webSettings.loadWithOverviewMode = true
            webSettings.useWideViewPort = true
            webSettings.builtInZoomControls = false
            webSettings.displayZoomControls = false
            webSettings.cacheMode = WebSettings.LOAD_DEFAULT
            
            // Enable mixed content (if needed)
            webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            
            // Set WebViewClient to handle page navigation inside WebView
            webView.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    Log.d(TAG, "Page loaded: $url")
                }
                
                override fun onReceivedError(
                    view: WebView?,
                    errorCode: Int,
                    description: String?,
                    failingUrl: String?
                ) {
                    super.onReceivedError(view, errorCode, description, failingUrl)
                    Log.e(TAG, "Error loading page: $description")
                }
            }
            
            // Set WebChromeClient for additional functionality
            webView.webChromeClient = WebChromeClient()
            
            // Load local HTML file from assets folder
            webView.loadUrl("file:///android_asset/index.html")
            Log.d(TAG, "Loading index.html from assets")
            
        } catch (e: Exception) {
            Log.e(TAG, "Error in onCreate: ${e.message}")
            e.printStackTrace()
        }
    }
    
    // Handle back button to navigate WebView history
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        webView.destroy()
    }
}
