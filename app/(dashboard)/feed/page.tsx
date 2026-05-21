import { createAdminClient } from "@/lib/supabase/admin";
import { FeedEstimateCard } from "@/components/chickens/feed-estimate-card";
import { FeedScheduleCard } from "@/components/chickens/feed-schedule-card";
import { FeedPriceEditor } from "@/components/feed/feed-price-editor";
import { getFeedSettings } from "@/lib/actions/feed-settings";

export default async function FeedPage() {
  const supabase = createAdminClient();

  const [{ data: batches }, overrides] = await Promise.all([
    supabase
      .from("chicken_batches")
      .select("*")
      .neq("stage", "harvested")
      .order("created_at", { ascending: false }),
    getFeedSettings(),
  ]);

  return (
    <div className="space-y-4">
      <FeedPriceEditor initialOverrides={overrides} />
      <FeedEstimateCard batches={batches || []} overrides={overrides} />
      <FeedScheduleCard />
    </div>
  );
}
