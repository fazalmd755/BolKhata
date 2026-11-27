package com.bolkhata.app;

import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;
import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private TextToSpeech tts;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize Android Native Text-to-Speech Engine
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int res = tts.setLanguage(new Locale("hi", "IN"));
                if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                    tts.setLanguage(new Locale("en", "IN"));
                }
                tts.setPitch(1.2f); // Sweet female pitch
                tts.setSpeechRate(0.95f);
            }
        });

        // Expose Native Android TTS to JavaScript in Capacitor WebView
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void speak(String text) {
                    if (tts != null && text != null && !text.trim().isEmpty()) {
                        runOnUiThread(() -> {
                            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "bolkhata_tts_" + System.currentTimeMillis());
                        });
                    }
                }

                @JavascriptInterface
                public void stop() {
                    if (tts != null) {
                        runOnUiThread(() -> tts.stop());
                    }
                }
            }, "AndroidTTS");
        }
    }

    @Override
    public void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
}
