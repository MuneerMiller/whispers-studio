package app.whispers.poster;

import android.app.Activity;
import android.app.KeyguardManager;
import android.os.Bundle;

/** Turns the screen on and asks Android to drop a non-secure lock screen, then closes itself. */
public class WakeActivity extends Activity {
    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        setShowWhenLocked(true);
        setTurnScreenOn(true);
        KeyguardManager km = getSystemService(KeyguardManager.class);
        if (km != null && km.isKeyguardLocked()) {
            km.requestDismissKeyguard(this, new KeyguardManager.KeyguardDismissCallback() {
                @Override public void onDismissSucceeded() { finish(); }
                @Override public void onDismissError() { finish(); }
                @Override public void onDismissCancelled() { finish(); }
            });
        } else finish();
    }
}
