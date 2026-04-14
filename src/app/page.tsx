"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import Nav from "@/components/public/Nav";
import HeroSection from "@/components/public/HeroSection";
import ServicesSection from "@/components/public/ServicesSection";
import ProcessSection from "@/components/public/ProcessSection";
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
      <ProcessSection />
      <Calculator />
      <ContactSection />
      <Footer />
    </>
  );
}
