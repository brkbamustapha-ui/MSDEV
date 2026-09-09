import { Hero } from "@/components/Hero";
import { RobotSection } from "@/components/RobotSection";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Portfolio } from "@/components/Portfolio";
import { Technologies } from "@/components/Technologies";
import { Process } from "@/components/Process";
import { WhyMsdev } from "@/components/WhyMsdev";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Hero />
      <RobotSection />
      <About />
      <Services />
      <Portfolio />
      <Technologies />
      <Process />
      <WhyMsdev />
      <Contact />
      <Footer />
    </>
  );
}
