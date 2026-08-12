"use client";

import { useFadeIn } from "@/hooks/useFadeIn";
import Nav from "@/components/public/Nav";
import ReferencesSection from "@/components/public/ReferencesSection";
import Footer from "@/components/public/Footer";

export default function ReferencePage() {
  useFadeIn();

  return (
    <>
      <Nav />
      <div style={{ paddingTop: "80px" }}>
        <ReferencesSection />
      </div>
      <Footer />
    </>
  );
}
