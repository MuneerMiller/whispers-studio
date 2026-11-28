package app.whispers.poster;

import android.content.Context;
import android.content.SharedPreferences;
import java.io.File;
import java.io.FileWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/** Settings, the done-list of jobs, and a plain-text log the user can share. */
final class Store {
    static final String DEFAULT_BASE = "https://raw.githubusercontent.com/MuneerMiller/whispers-studio/main/phone/";
    private final Context ctx;
    private final SharedPreferences p;

    Store(Context c) { ctx = c.getApplicationContext(); p = ctx.getSharedPreferences("poster", Context.MODE_PRIVATE); }

    boolean enabled() { return p.getBoolean("enabled", false); }
    void setEnabled(boolean v) { p.edit().putBoolean("enabled", v).apply(); }
    boolean onlyScreenOff() { return p.getBoolean("onlyScreenOff", true); }
    void setOnlyScreenOff(boolean v) { p.edit().putBoolean("onlyScreenOff", v).apply(); }
    String base() { return p.getString("base", DEFAULT_BASE); }

    boolean isDone(String jobId) { return p.getBoolean("done:" + jobId, false); }
    void markDone(String jobId) { p.edit().putBoolean("done:" + jobId, true).apply(); }
    int attempts(String jobId) { return p.getInt("tries:" + jobId, 0); }
    void addAttempt(String jobId) { p.edit().putInt("tries:" + jobId, attempts(jobId) + 1).apply(); }

    void setStatus(String s) { p.edit().putString("status", stamp() + "  " + s).apply(); log(s); }
    String status() { return p.getString("status", "Not run yet"); }

    private File logFile() { return new File(ctx.getFilesDir(), "log.txt"); }
    private File lastFailFile() { return new File(ctx.getFilesDir(), "last-failure.txt"); }
    private File recordingFile() { return new File(ctx.getFilesDir(), "recording.txt"); }

    synchronized void log(String s) {
        try {
            File f = logFile();
            if (f.length() > 400_000) { f.delete(); }
            try (FileWriter w = new FileWriter(f, true)) { w.write(stamp() + "  " + s + "\n"); }
        } catch (Exception ignored) { }
    }
    String readLog() { return read(logFile()); }
    void saveFailure(String s) { write(lastFailFile(), stamp() + "\n" + s); }
    String lastFailure() { return read(lastFailFile()); }
    void appendRecording(String s) { try (FileWriter w = new FileWriter(recordingFile(), true)) { w.write(s + "\n"); } catch (Exception ignored) { } }
    String recording() { return read(recordingFile()); }
    void clearRecording() { recordingFile().delete(); }

    private static String read(File f) {
        try { return f.exists() ? new String(Files.readAllBytes(f.toPath()), StandardCharsets.UTF_8) : ""; } catch (Exception e) { return ""; }
    }
    private static void write(File f, String s) { try (FileWriter w = new FileWriter(f, false)) { w.write(s); } catch (Exception ignored) { } }
    static String stamp() { return new SimpleDateFormat("dd MMM HH:mm:ss", Locale.UK).format(new Date()); }
}
