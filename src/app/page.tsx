"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import Nav from "@/components/public/Nav";
import HeroSection from "@/components/public/HeroSection";
import ServicesSection from "@/components/public/ServicesSection";
import ReferencesSection from "@/components/public/ReferencesSection";
import ProcessSection from "@/components/public/ProcessSection";
import PortalSection from "@/components/public/PortalSection";
import Calculator from "@/components/public/Calculator";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";

export default function Home() {
  useFadeIn();

  return (
    <>
      <Nav />
      <HeroSection />
      <ServicesSection />
      <ReferencesSection />
      <ProcessSection />
      <PortalSection />
      <Calculator />
      <ContactSection />
      <Footer />
    </>
  );
}
