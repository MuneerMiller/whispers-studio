package app.whispers.poster;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;

/** Wakes the service every 15 minutes to look for a due post. */
public class AlarmReceiver extends BroadcastReceiver {
    static void arm(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pi = PendingIntent.getBroadcast(c, 1, new Intent(c, AlarmReceiver.class), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        am.setInexactRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP, SystemClock.elapsedRealtime() + 60_000, AlarmManager.INTERVAL_FIFTEEN_MINUTES, pi);
    }

    @Override
    public void onReceive(Context c, Intent i) {
        PosterService s = PosterService.instance;
        if (s != null) s.tickAsync(false);
        else new Store(c).log("Tick skipped: the accessibility service is off");
    }
}
