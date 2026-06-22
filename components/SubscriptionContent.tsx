"use client";

import { useSearchParams } from "next/navigation";
import SubscriptionTabs from "./SubscriptionTabs";
import BenefitTab from "./BenefitTab";
import CardTab from "./CardTab";
import Benefit from "./Benefit";

export default function SubscriptionContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "service";

  return (
    <>
      <SubscriptionTabs />
      {tab === "benefit" ? (
        <BenefitTab />
      ) : tab === "card" ? (
        <CardTab />
      ) : (
        <Benefit bg="/images/bg_white_benefit.png" />
      )}
    </>
  );
}
