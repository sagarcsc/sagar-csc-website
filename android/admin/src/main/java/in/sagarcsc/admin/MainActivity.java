package in.sagarcsc.admin;
import android.app.Activity; import android.os.Bundle; import android.webkit.*;
public class MainActivity extends Activity { WebView w; public void onCreate(Bundle b){super.onCreate(b); w=new WebView(this); w.getSettings().setJavaScriptEnabled(true); w.getSettings().setDomStorageEnabled(true); w.setWebViewClient(new WebViewClient()); setContentView(w); w.loadUrl("https://csc-sagar-6dcb9c.netlify.app/admin-site/index.html"); } public void onBackPressed(){if(w.canGoBack())w.goBack();else super.onBackPressed();}}
