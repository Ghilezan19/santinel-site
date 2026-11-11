import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Marquee from "@/components/sections/Marquee";
import SafetyModule from "@/components/sections/SafetyModule";
import AirModule from "@/components/sections/AirModule";
import People from "@/components/sections/People";
import Pipeline from "@/components/sections/Pipeline";
import LiveDemo from "@/components/sections/LiveDemo";
import RoiCalculator from "@/components/sections/RoiCalculator";
import Pricing from "@/components/sections/Pricing";
import Compliance from "@/components/sections/Compliance";
import Team from "@/components/sections/Team";
import Cta from "@/components/sections/Cta";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main>
      <Hero />
      <Problem />
      <Marquee />
      <SafetyModule />
      <AirModule />
      <People />
      <Pipeline />
      <LiveDemo />
      <RoiCalculator />
      <Pricing />
      <Compliance />
      <Team />
      <Cta />
    </main>
  );
}
