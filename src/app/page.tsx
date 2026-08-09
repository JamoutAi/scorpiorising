import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { CoreLoop } from "@/components/CoreLoop";
import { MagicFeatures } from "@/components/MagicFeatures";
import { Story } from "@/components/Story";
import { Pricing } from "@/components/Pricing";
import { WaitlistCTA } from "@/components/WaitlistCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <CoreLoop />
        <MagicFeatures />
        <Story />
        <Pricing />
        <WaitlistCTA />
      </main>
      <Footer />
    </>
  );
}
