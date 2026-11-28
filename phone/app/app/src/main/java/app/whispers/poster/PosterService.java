package app.whispers.poster;

import android.accessibilityservice.AccessibilityService;
import android.app.KeyguardManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.PowerManager;
import android.provider.MediaStore;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * The whole poster. Every 15 minutes it reads phone/jobs.json from the Whispers repo; when a job is due and the phone
 * is free (unlocked, and by default not in use), it downloads the video, switches Instagram to the right account and
 * posts it as a Reel with a trending song, following phone/steps.json. It never touches anything outside Instagram,
 * and does nothing else in Instagram (no likes, follows, comments or messages).
 */
public class PosterService extends AccessibilityService {
    static volatile PosterService instance;
    static final String IG = "com.instagram.android";
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final AtomicBoolean busy = new AtomicBoolean();
    private volatile boolean recording;
    private Store store;

    @Override protected void onServiceConnected() {
        instance = this;
        store = new Store(this);
        AlarmReceiver.arm(this);
        store.setStatus("Service on. Checking for posts every 15 minutes.");
    }

    @Override public boolean onUnbind(Intent i) { instance = null; return super.onUnbind(i); }
    @Override public void onInterrupt() { }

    // ---- recording a manual post, to learn Instagram's exact buttons ----
    void setRecording(boolean on) {
        recording = on;
        if (on) { store.clearRecording(); store.appendRecording("# Recording started " + Store.stamp() + ". Post one Reel by hand, then stop."); }
        else store.appendRecording("# Recording stopped " + Store.stamp());
    }
    boolean isRecording() { return recording; }

    @Override public void onAccessibilityEvent(AccessibilityEvent e) {
        if (!recording || e.getPackageName() == null || !IG.contentEquals(e.getPackageName())) return;
        int t = e.getEventType();
        if (t == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            store.appendRecording("screen: " + e.getClassName());
        } else if (t == AccessibilityEvent.TYPE_VIEW_CLICKED || t == AccessibilityEvent.TYPE_VIEW_LONG_CLICKED) {
            AccessibilityNodeInfo n = e.getSource();
            String id = n == null ? "" : Engine.str(n.getViewIdResourceName()).replace("com.instagram.android:id/", "");
            String desc = n == null ? "" : Engine.str(n.getContentDescription());
            String text = n == null ? "" : Engine.str(n.getText());
            if (text.isEmpty() && !e.getText().isEmpty()) text = e.getText().toString();
            store.appendRecording((t == AccessibilityEvent.TYPE_VIEW_LONG_CLICKED ? "LONG " : "") + "tap: id=" + id + " text=\"" + text + "\" desc=\"" + desc + "\" class=" + e.getClassName());
        }
    }

    // ---- screen dump on request ----
    void dumpAfter(long delayMs) {
        worker.execute(() -> {
            Engine.sleep(delayMs);
            Engine en = new Engine(this, store, new HashMap<>(), null, true);
            store.saveFailure("SCREEN DUMP (requested)\n" + en.dumpScreen());
            notifyUser("Screen saved", "Open Whispers Poster and tap Share last report.");
        });
    }

    // ---- the posting loop ----
    void tickAsync(boolean dry) {
        if (!busy.compareAndSet(false, true)) return;
        worker.execute(() -> { try { tick(dry); } catch (Exception e) { store.setStatus("Error: " + e.getMessage()); } finally { busy.set(false); } });
    }

    private void tick(boolean dry) throws Exception {
        if (!dry && !store.enabled()) { store.log("Tick: posting is switched off in the app"); return; }
        JSONArray jobs = new JSONArray(Net.getText(store.base() + "jobs.json"));
        JSONObject steps = new JSONObject(Net.getText(store.base() + "steps.json"));
        long now = System.currentTimeMillis();
        JSONObject job = null;
        for (int i = 0; i < jobs.length(); i++) {
            JSONObject j = jobs.getJSONObject(i);
            if (store.isDone(j.getString("id")) || store.attempts(j.getString("id")) >= 3) continue;
            if (!dry && (now < iso(j.getString("not_before")) || now > iso(j.getString("expires")))) continue;
            job = j; break;
        }
        // A dry run with nothing queued uses the test job (a public sample clip), so setup can be tested any time.
        if (job == null && dry) job = new JSONObject(Net.getText(store.base() + "test-job.json"));
        if (job == null) { store.setStatus("Nothing due right now"); return; }

        KeyguardManager km = getSystemService(KeyguardManager.class);
        PowerManager pm = getSystemService(PowerManager.class);
        if (!dry && store.onlyScreenOff() && pm.isInteractive()) { store.setStatus("Post " + job.getString("code") + " is due, waiting until you're not using the phone"); return; }
        PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "poster:post");
        wl.acquire(6 * 60_000);
        try {
            if (!pm.isInteractive() || km.isKeyguardLocked()) {
                startActivity(new Intent(this, WakeActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
                Engine.sleep(2500);
            }
            if (km.isDeviceLocked()) { store.setStatus("Post " + job.getString("code") + " is due, but the phone is locked. See setup: Smart Lock or no lock."); return; }
            post(job, steps, dry);
        } finally { if (wl.isHeld()) wl.release(); }
    }

    private void post(JSONObject job, JSONObject steps, boolean dry) {
        String id = job.optString("id"), code = job.optString("code");
        long started = System.currentTimeMillis();
        Uri video = null;
        Engine en = null;
        try {
            store.setStatus((dry ? "Dry run: " : "Posting ") + code + " to @" + job.getString("handle"));
            if (!dry) store.addAttempt(id);
            Cleanup.ownVideos(this, store, 0);
            video = saveVideo(job.getString("video_url"), code);
            Map<String, String> vars = new HashMap<>();
            vars.put("handle", job.getString("handle"));
            vars.put("caption", job.getString("caption"));
            vars.put("code", code);
            en = new Engine(this, store, vars, steps.optJSONArray("dismiss"), dry);
            en.videoUri = video;
            JSONObject flows = steps.getJSONObject("flows");
            en.run("switch_account", flows.getJSONArray("switch_account"));
            en.run("post_reel", flows.getJSONArray("post_reel"));
            if (dry) {
                if (flows.has("dry_cleanup")) en.run("dry_cleanup", flows.getJSONArray("dry_cleanup"));
                store.setStatus("Dry run finished: every step worked up to Share (nothing was posted)");
                notifyUser("Dry run worked", "Every step up to Share worked. Nothing was posted.");
            } else {
                store.markDone(id);
                store.setStatus("Posted " + code + " to @" + job.getString("handle"));
            }
        } catch (Exception e) {
            String dump = en != null ? en.dumpScreen() : "";
            store.saveFailure("FAILED " + code + ": " + e.getMessage() + "\n\nScreen at the time:\n" + dump);
            store.setStatus("Couldn't post " + code + ": " + e.getMessage());
            notifyUser("Couldn't post " + code, e.getMessage() + " Tap Share last report in the app.");
            if (en != null) for (int i = 0; i < 4; i++) { performGlobalAction(GLOBAL_ACTION_BACK); Engine.sleep(500); }
        } finally {
            Engine.sleep(1500);
            performGlobalAction(GLOBAL_ACTION_HOME);
            // Leave nothing behind: give Instagram time to finish uploading, then delete our downloaded video and any
            // copy Instagram saved to the gallery during this post.
            Engine.sleep(120_000);
            Cleanup.ownVideos(this, store, 0);
            Cleanup.instagramCopies(this, store, started - 60_000, System.currentTimeMillis());
        }
    }

    // ---- the video file: saved where Instagram can read it, deleted a day later ----
    private Uri saveVideo(String url, String code) throws Exception {
        ContentResolver cr = getContentResolver();
        ContentValues v = new ContentValues();
        v.put(MediaStore.Video.Media.DISPLAY_NAME, code + ".mp4");
        v.put(MediaStore.Video.Media.MIME_TYPE, "video/mp4");
        v.put(MediaStore.Video.Media.RELATIVE_PATH, "Movies/WhispersPoster");
        v.put(MediaStore.Video.Media.IS_PENDING, 1);
        Uri uri = cr.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, v);
        if (uri == null) throw new Exception("couldn't create the video file");
        try (OutputStream out = cr.openOutputStream(uri)) { Net.download(url, out); }
        v.clear();
        v.put(MediaStore.Video.Media.IS_PENDING, 0);
        cr.update(uri, v, null, null);
        return uri;
    }

    private void notifyUser(String title, String text) {
        NotificationManager nm = getSystemService(NotificationManager.class);
        nm.createNotificationChannel(new NotificationChannel("poster", "Whispers Poster", NotificationManager.IMPORTANCE_DEFAULT));
        nm.notify((int) (System.currentTimeMillis() % 100000), new Notification.Builder(this, "poster")
                .setSmallIcon(android.R.drawable.stat_sys_upload_done).setContentTitle(title).setContentText(text)
                .setStyle(new Notification.BigTextStyle().bigText(text)).setAutoCancel(true).build());
    }

    static long iso(String s) { return java.time.Instant.parse(s).toEpochMilli(); }
}
