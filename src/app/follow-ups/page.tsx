import { Suspense } from "react";
import { FollowUpsView } from "@/components/follow-ups/FollowUpsView";

export default function FollowUpsPage() {
  // useSearchParams (for ?tab=upcoming from the dashboard link) needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <FollowUpsView />
    </Suspense>
  );
}
