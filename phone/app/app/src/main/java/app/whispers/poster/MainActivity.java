package app.whispers.poster;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final int INK = Color.parseColor("#0C0F1D"), BRASS = Color.parseColor("#C9A45C");
    private static final int TEXT = Color.parseColor("#F4EDE0"), MUTED = Color.parseColor("#B9B2C7");
    private Store store;
    private TextView status, service;
    private Button recordBtn;
    private final Handler h = new Handler(Looper.getMainLooper());

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        store = new Store(this);
        if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED)
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);

        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setPadding(dp(22), dp(40), dp(22), dp(40));
        TextView title = text("Whispers Poster", 32, TEXT);
        title.setTypeface(Typeface.SERIF);
        col.addView(title);
        col.addView(text("Posts the day's Whispers video in Instagram with a trending song. Only inside Instagram, only when a post is due.", 15, MUTED));

        service = text("", 15, TEXT);
        service.setPadding(0, dp(18), 0, 0);
        col.addView(service);
        status = text("", 15, MUTED);
        col.addView(status);

        col.addView(section("Setup"));
        col.addView(button("Turn on the accessibility service", false, () -> startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))));
        col.addView(button("Allow it to delete leftover files", false, () -> startActivity(new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, android.net.Uri.parse("package:" + getPackageName())))));
        col.addView(button("Battery: set Whispers Poster to Unrestricted", false, () -> startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))));

        col.addView(section("Posting"));
        Switch on = sw("Post automatically", store.enabled());
        on.setOnCheckedChangeListener((v, c) -> store.setEnabled(c));
        col.addView(on);
        Switch off = sw("Only post when I'm not using the phone", store.onlyScreenOff());
        off.setOnCheckedChangeListener((v, c) -> store.setOnlyScreenOff(c));
        col.addView(off);
        col.addView(button("Check for a post now", true, () -> withService(s -> s.tickAsync(false), "Checking…")));
        col.addView(button("Dry run (does everything except Share)", false, () -> withService(s -> s.tickAsync(true), "Dry run starts in a moment. Don't touch the phone.")));

        col.addView(section("Teach and fix"));
        recordBtn = button("Record me posting one Reel by hand", false, this::toggleRecording);
        col.addView(recordBtn);
        col.addView(button("Save the screen in 10 seconds", false, () -> withService(s -> s.dumpAfter(10_000), "Open the screen in Instagram now. Saving in 10 seconds.")));
        col.addView(button("Share last report", false, () -> share("Whispers Poster report", store.lastFailure())));
        col.addView(button("Share recording", false, () -> share("Whispers Poster recording", store.recording())));
        col.addView(button("Share log", false, () -> share("Whispers Poster log", store.readLog())));

        ScrollView sv = new ScrollView(this);
        sv.setBackgroundColor(INK);
        sv.addView(col);
        setContentView(sv);
    }

    @Override protected void onResume() { super.onResume(); refresh(); }

    private void refresh() {
        PosterService s = PosterService.instance;
        service.setText(s != null ? "✓ Accessibility service is on" : "✗ Accessibility service is off. Turn it on below.");
        status.setText(store.status());
        if (recordBtn != null) recordBtn.setText(s != null && s.isRecording() ? "Stop recording" : "Record me posting one Reel by hand");
        h.removeCallbacksAndMessages(null);
        h.postDelayed(this::refresh, 3000);
    }

    private void toggleRecording() {
        PosterService s = PosterService.instance;
        if (s == null) { toast("Turn on the accessibility service first"); return; }
        boolean on = !s.isRecording();
        s.setRecording(on);
        toast(on ? "Recording. Open Instagram and post one Reel with a song, then come back and stop." : "Stopped. Tap Share recording.");
        refresh();
    }

    interface Act { void run(PosterService s); }
    private void withService(Act a, String msg) {
        PosterService s = PosterService.instance;
        if (s == null) { toast("Turn on the accessibility service first"); return; }
        a.run(s);
        toast(msg);
    }

    private void share(String subject, String body) {
        if (body == null || body.isEmpty()) { toast("Nothing to share yet"); return; }
        Intent i = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_SUBJECT, subject).putExtra(Intent.EXTRA_TEXT, body);
        startActivity(Intent.createChooser(i, subject));
    }

    private void toast(String s) { Toast.makeText(this, s, Toast.LENGTH_LONG).show(); }

    private TextView section(String s) {
        TextView t = text(s, 13, BRASS);
        t.setAllCaps(true);
        t.setLetterSpacing(0.08f);
        t.setPadding(0, dp(26), 0, dp(4));
        return t;
    }

    private TextView text(String s, int sp, int color) {
        TextView t = new TextView(this);
        t.setText(s); t.setTextSize(sp); t.setTextColor(color); t.setLineSpacing(0, 1.2f); t.setPadding(0, dp(6), 0, 0);
        return t;
    }

    private Switch sw(String label, boolean on) {
        Switch s = new Switch(this);
        s.setText(label); s.setTextColor(TEXT); s.setTextSize(16); s.setChecked(on);
        s.setPadding(0, dp(12), 0, dp(12));
        return s;
    }

    private Button button(String label, boolean primary, Runnable r) {
        Button b = new Button(this);
        b.setText(label); b.setAllCaps(false); b.setTextSize(15);
        b.setTextColor(primary ? Color.parseColor("#1A140C") : TEXT);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(primary ? BRASS : Color.argb(26, 255, 255, 255));
        bg.setCornerRadius(dp(24));
        b.setBackground(bg);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(50));
        lp.topMargin = dp(10);
        b.setLayoutParams(lp);
        b.setOnClickListener(v -> r.run());
        return b;
    }

    private int dp(int v) { return Math.round(v * getResources().getDisplayMetrics().density); }
}
