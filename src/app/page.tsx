import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { ProjectsShowcase } from "@/components/sections/ProjectsShowcase";
import { Playground } from "@/components/sections/Playground";
import { Journey } from "@/components/sections/Journey";
import { Contact } from "@/components/sections/Contact";
import { Marquee } from "@/components/animations/Marquee";
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Marquee />
      <ProjectsShowcase />
      <Journey />
      <Playground />
      <Contact />
    </>
  );
}