package app.whispers.poster;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Path;
import android.graphics.Rect;
import android.net.Uri;
import android.os.Bundle;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.accessibility.AccessibilityWindowInfo;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Runs a flow from steps.json inside Instagram. Every selector lives in that file (in the repo), so a changed
 * Instagram screen is fixed by editing the file, not by reinstalling the app.
 *
 * Step: {"do": "...", "target": {...} | "any": [{...}, ...], "timeout": ms, "optional": bool, "final": bool,
 *        "value": "...", "n": 0, "note": "..."}
 * do:   launch (value = package) | share_video | click | long_click | set_text | paste | back | home | wait (ms in value)
 *       | skip_rest_if (end the flow early if the target is on screen)
 * Target fields (all optional, regexes, case-insensitive, {var} filled in): text, desc, any_text (text or
 *       description), id (resource id), hint, cls; plus "clickable": true. "n" picks the n-th match (0 = first).
 */
final class Engine {
    static final class StepFailed extends Exception { StepFailed(String m) { super(m); } }

    private final AccessibilityService svc;
    private final Store store;
    private final Map<String, String> vars;
    private final JSONArray dismiss;
    private final boolean dry;
    Uri videoUri;

    Engine(AccessibilityService svc, Store store, Map<String, String> vars, JSONArray dismiss, boolean dry) {
        this.svc = svc; this.store = store; this.vars = vars; this.dismiss = dismiss == null ? new JSONArray() : dismiss; this.dry = dry;
    }

    void run(String name, JSONArray steps) throws Exception {
        store.log("flow " + name + " (" + steps.length() + " steps" + (dry ? ", dry run" : "") + ")");
        for (int i = 0; i < steps.length(); i++) {
            JSONObject s = steps.getJSONObject(i);
            String what = s.optString("do"), note = s.optString("note", "");
            if (dry && s.optBoolean("final")) { store.log("  " + (i + 1) + " " + what + " skipped (dry run) " + note); continue; }
            dismissPopups();
            boolean ok;
            try { ok = step(s); }
            catch (StepFailed e) { throw new StepFailed(name + " step " + (i + 1) + " (" + what + (note.isEmpty() ? "" : ": " + note) + "): " + e.getMessage()); }
            if (!ok) { store.log("  " + (i + 1) + " " + what + ": target on screen, rest of " + name + " skipped"); return; }
            store.log("  " + (i + 1) + " " + what + " ok " + note);
            sleep(s.optLong("after", 700));
        }
    }

    /** Returns false only for skip_rest_if when its target is found. */
    private boolean step(JSONObject s) throws Exception {
        String what = s.getString("do");
        long timeout = s.optLong("timeout", 8000);
        boolean optional = s.optBoolean("optional");
        switch (what) {
            case "wait": sleep(Long.parseLong(s.optString("value", "1000"))); return true;
            case "back": svc.performGlobalAction(AccessibilityService.GLOBAL_ACTION_BACK); return true;
            case "home": svc.performGlobalAction(AccessibilityService.GLOBAL_ACTION_HOME); return true;
            case "launch": {
                Intent i = svc.getPackageManager().getLaunchIntentForPackage(s.getString("value"));
                if (i == null) throw new StepFailed(s.getString("value") + " is not installed");
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                svc.startActivity(i); return true;
            }
            case "share_video": {
                if (videoUri == null) throw new StepFailed("no video downloaded");
                Intent i = new Intent(Intent.ACTION_SEND).setType("video/mp4").putExtra(Intent.EXTRA_STREAM, videoUri)
                        .setPackage(s.optString("value", "com.instagram.android"))
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                svc.startActivity(i); return true;
            }
            case "skip_rest_if": return find(s, Math.min(timeout, 3000)) == null;
            case "click": case "long_click": case "set_text": case "paste": {
                AccessibilityNodeInfo n = find(s, timeout);
                if (n == null) {
                    if (optional) return true;
                    throw new StepFailed("couldn't find " + describe(s) + " within " + timeout / 1000 + "s");
                }
                if (what.equals("click")) tap(n, false);
                else if (what.equals("long_click")) tap(n, true);
                else typeInto(n, fill(s.optString("value"), false), what.equals("paste"));
                return true;
            }
            default: throw new StepFailed("unknown step type " + what);
        }
    }

    private void dismissPopups() {
        for (int k = 0; k < dismiss.length(); k++) {
            JSONObject d = dismiss.optJSONObject(k);
            if (d == null) continue;
            AccessibilityNodeInfo n = findNow(targets(d), d.optInt("n", 0));
            if (n != null) { store.log("  dismissed popup " + d); tap(n, false); sleep(800); }
        }
    }

    private AccessibilityNodeInfo find(JSONObject s, long timeout) throws Exception {
        List<JSONObject> t = targets(s);
        long end = System.currentTimeMillis() + timeout;
        do {
            AccessibilityNodeInfo n = findNow(t, s.optInt("n", 0));
            if (n != null) return n;
            sleep(350);
        } while (System.currentTimeMillis() < end);
        return null;
    }

    private static List<JSONObject> targets(JSONObject s) {
        List<JSONObject> t = new ArrayList<>();
        JSONArray any = s.optJSONArray("any");
        if (any != null) for (int i = 0; i < any.length(); i++) t.add(any.optJSONObject(i));
        if (s.has("target")) t.add(s.optJSONObject("target"));
        if (t.isEmpty() && (s.has("text") || s.has("desc") || s.has("id") || s.has("any_text"))) t.add(s);
        return t;
    }

    private AccessibilityNodeInfo findNow(List<JSONObject> targets, int nth) {
        List<AccessibilityNodeInfo> roots = new ArrayList<>();
        try { for (AccessibilityWindowInfo w : svc.getWindows()) { AccessibilityNodeInfo r = w.getRoot(); if (r != null) roots.add(r); } } catch (Exception ignored) { }
        if (roots.isEmpty() && svc.getRootInActiveWindow() != null) roots.add(svc.getRootInActiveWindow());
        for (JSONObject t : targets) {
            if (t == null) continue;
            int seen = 0;
            for (AccessibilityNodeInfo root : roots) {
                ArrayDeque<AccessibilityNodeInfo> q = new ArrayDeque<>();
                q.add(root);
                while (!q.isEmpty()) {
                    AccessibilityNodeInfo n = q.poll();
                    if (n == null) continue;
                    if (n.isVisibleToUser() && matches(n, t)) { if (seen++ == nth) return n; }
                    for (int i = 0; i < n.getChildCount(); i++) q.add(n.getChild(i));
                }
            }
        }
        return null;
    }

    private boolean matches(AccessibilityNodeInfo n, JSONObject t) {
        String text = str(n.getText()), desc = str(n.getContentDescription()), id = str(n.getViewIdResourceName());
        String hint = n.getHintText() == null ? "" : n.getHintText().toString(), cls = str(n.getClassName());
        if (t.has("text") && !re(t.optString("text")).matcher(text).find()) return false;
        if (t.has("desc") && !re(t.optString("desc")).matcher(desc).find()) return false;
        if (t.has("any_text") && !(re(t.optString("any_text")).matcher(text).find() || re(t.optString("any_text")).matcher(desc).find())) return false;
        if (t.has("id") && !re(t.optString("id")).matcher(id).find()) return false;
        if (t.has("hint") && !re(t.optString("hint")).matcher(hint).find()) return false;
        if (t.has("cls") && !re(t.optString("cls")).matcher(cls).find()) return false;
        if (t.optBoolean("clickable") && !n.isClickable()) return false;
        return t.has("text") || t.has("desc") || t.has("any_text") || t.has("id") || t.has("hint") || t.has("cls");
    }

    private Pattern re(String p) { return Pattern.compile(fill(p, true), Pattern.CASE_INSENSITIVE | Pattern.DOTALL); }

    /** Fills {var}; inside a regex the value is quoted so its characters match literally. */
    String fill(String s, boolean regex) {
        for (Map.Entry<String, String> e : vars.entrySet()) s = s.replace("{" + e.getKey() + "}", regex ? Pattern.quote(e.getValue()) : e.getValue());
        return s;
    }

    private void tap(AccessibilityNodeInfo n, boolean longPress) {
        AccessibilityNodeInfo c = n;
        while (c != null && !(longPress ? c.isLongClickable() : c.isClickable())) c = c.getParent();
        int action = longPress ? AccessibilityNodeInfo.ACTION_LONG_CLICK : AccessibilityNodeInfo.ACTION_CLICK;
        if (c != null && c.performAction(action)) return;
        Rect r = new Rect();
        n.getBoundsInScreen(r);
        Path p = new Path();
        p.moveTo(r.exactCenterX(), r.exactCenterY());
        svc.dispatchGesture(new GestureDescription.Builder().addStroke(new GestureDescription.StrokeDescription(p, 0, longPress ? 900 : 60)).build(), null, null);
    }

    private void typeInto(AccessibilityNodeInfo n, String value, boolean paste) {
        tap(n, false);
        sleep(400);
        AccessibilityNodeInfo f = n.isEditable() ? n : n.findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
        if (f == null) f = n;
        if (!paste) {
            Bundle b = new Bundle();
            b.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, value);
            if (f.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, b)) return;
        }
        ClipboardManager cm = (ClipboardManager) svc.getSystemService(Context.CLIPBOARD_SERVICE);
        cm.setPrimaryClip(ClipData.newPlainText("caption", value));
        f.performAction(AccessibilityNodeInfo.ACTION_PASTE);
    }

    String describe(JSONObject s) { return targets(s).toString(); }

    /** A readable dump of every visible element, for fixing steps.json when a screen changes. */
    String dumpScreen() {
        StringBuilder sb = new StringBuilder();
        try {
            for (AccessibilityWindowInfo w : svc.getWindows()) {
                AccessibilityNodeInfo r = w.getRoot();
                if (r == null) continue;
                sb.append("=== window: ").append(str(r.getPackageName())).append('\n');
                dump(r, 0, sb);
            }
        } catch (Exception e) { sb.append("dump failed: ").append(e); }
        return sb.toString();
    }

    private static void dump(AccessibilityNodeInfo n, int depth, StringBuilder sb) {
        if (n == null || depth > 40) return;
        if (n.isVisibleToUser()) {
            Rect r = new Rect(); n.getBoundsInScreen(r);
            String id = str(n.getViewIdResourceName()), text = str(n.getText()), desc = str(n.getContentDescription());
            String hint = n.getHintText() == null ? "" : n.getHintText().toString();
            if (!id.isEmpty() || !text.isEmpty() || !desc.isEmpty() || !hint.isEmpty() || n.isClickable() || n.isEditable()) {
                sb.append("  ".repeat(Math.min(depth, 20))).append(str(n.getClassName()).replace("android.widget.", "").replace("android.view.", ""));
                if (!id.isEmpty()) sb.append(" id=").append(id.replace("com.instagram.android:id/", ""));
                if (!text.isEmpty()) sb.append(" text=\"").append(cut(text)).append('"');
                if (!desc.isEmpty()) sb.append(" desc=\"").append(cut(desc)).append('"');
                if (!hint.isEmpty()) sb.append(" hint=\"").append(cut(hint)).append('"');
                if (n.isClickable()) sb.append(" [click]");
                if (n.isEditable()) sb.append(" [edit]");
                sb.append(' ').append(r.toShortString()).append('\n');
            }
        }
        for (int i = 0; i < n.getChildCount(); i++) dump(n.getChild(i), depth + 1, sb);
    }

    private static String cut(String s) { s = s.replace('\n', ' '); return s.length() > 60 ? s.substring(0, 60) + "…" : s; }
    static String str(CharSequence c) { return c == null ? "" : c.toString(); }
    static void sleep(long ms) { try { Thread.sleep(ms); } catch (InterruptedException ignored) { } }
}
