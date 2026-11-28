package app.whispers.poster;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import java.io.File;

/** Deletes everything a post leaves on the phone. */
final class Cleanup {
    /** Our own downloaded videos (Movies/WhispersPoster) older than maxAgeMs; 0 deletes all of them. */
    static void ownVideos(Context c, Store store, long maxAgeMs) {
        try {
            long cutoff = (System.currentTimeMillis() - maxAgeMs) / 1000;
            ContentResolver cr = c.getContentResolver();
            int n = 0;
            try (Cursor cur = cr.query(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, new String[]{MediaStore.Video.Media._ID},
                    MediaStore.Video.Media.RELATIVE_PATH + " LIKE ? AND " + MediaStore.Video.Media.DATE_ADDED + " <= ?",
                    new String[]{"Movies/WhispersPoster%", String.valueOf(cutoff)}, null)) {
                while (cur != null && cur.moveToNext()) n += cr.delete(Uri.withAppendedPath(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, cur.getString(0)), null, null);
            }
            if (n > 0) store.log("cleanup: deleted " + n + " downloaded video(s)");
        } catch (Exception e) { store.log("cleanup of our videos failed: " + e.getMessage()); }
    }

    /**
     * The copy Instagram saves to the gallery when it posts (DCIM/Instagram, Pictures/Instagram, Movies/Instagram).
     * Only files created during this post's time window are touched, so your own Instagram downloads are safe.
     * Needs "All files access", granted once in the app's setup.
     */
    static void instagramCopies(Context ctx, Store store, long fromMs, long toMs) {
        java.util.List<String> gone = new java.util.ArrayList<>();
        if (!Environment.isExternalStorageManager()) { store.log("cleanup: can't remove Instagram's gallery copy (file access not allowed in setup)"); return; }
        File root = Environment.getExternalStorageDirectory();
        String[] dirs = {"DCIM/Instagram", "Pictures/Instagram", "Movies/Instagram", "DCIM/Camera"};
        int n = 0;
        for (String d : dirs) {
            File[] files = new File(root, d).listFiles();
            if (files == null) continue;
            for (File f : files) {
                String name = f.getName().toLowerCase();
                boolean media = name.endsWith(".mp4") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp");
                // DCIM/Camera only for files Instagram names itself, never your own photos.
                if (d.equals("DCIM/Camera") && !name.contains("instagram")) continue;
                if (media && f.isFile() && f.lastModified() >= fromMs && f.lastModified() <= toMs && f.delete()) { n++; gone.add(f.getAbsolutePath()); }
            }
        }
        // Tell the gallery the files are gone, so no empty thumbnails are left behind.
        if (!gone.isEmpty()) android.media.MediaScannerConnection.scanFile(ctx, gone.toArray(new String[0]), null, null);
        store.log("cleanup: deleted " + n + " Instagram gallery copy(ies) from this post");
    }
}
