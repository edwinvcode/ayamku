import { FEED_RATES, FEED_SCHEDULE } from "@/lib/feed-estimate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

type ScheduleKey = keyof typeof FEED_SCHEDULE;

const scheduleKeys = Object.keys(FEED_SCHEDULE) as ScheduleKey[];

export function FeedScheduleCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          Jadwal Pemberian Pakan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scheduleKeys.map((key) => {
          const sched = FEED_SCHEDULE[key];
          const rate = FEED_RATES[key];
          const gramPerFeeding = rate.gramPerHead / sched.frequency;

          return (
            <div key={key} className="rounded-lg border bg-card p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <span className="font-semibold text-sm">{rate.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">({sched.ageRange})</span>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  <span className="font-medium text-foreground">{rate.gramPerHead}g</span>
                  {" "}/ ekor / hari
                  {" · "}
                  <span className="font-medium text-foreground">{sched.frequency}×</span>
                  {" "}sehari
                </div>
              </div>

              {/* Feeding times with gram per session */}
              <div className="flex flex-wrap gap-2">
                {sched.times.map((t) => (
                  <div
                    key={t}
                    className="flex flex-col items-center rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 px-3 py-1.5 text-center"
                  >
                    <span className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400">{t}</span>
                    <span className="text-xs text-blue-600/70 dark:text-blue-500/70">{gramPerFeeding % 1 === 0 ? gramPerFeeding : gramPerFeeding.toFixed(1)}g/ekor</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{sched.notes}</p>
            </div>
          );
        })}

        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Catatan Umum</p>
          <p>· Air minum segar harus selalu tersedia di semua fase.</p>
          <p>· Bersihkan tempat pakan sebelum pengisian berikutnya untuk mencegah jamur.</p>
          <p>· Sesuaikan jam jika cuaca sangat panas — geser ke pagi lebih awal atau malam.</p>
        </div>
      </CardContent>
    </Card>
  );
}
