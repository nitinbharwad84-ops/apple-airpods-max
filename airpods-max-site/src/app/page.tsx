import NavBar from "@/components/NavBar";
import Scrollytelling from "@/components/Scrollytelling";
import DeepDiveSection from "@/components/DeepDiveSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-apple-blue selection:text-white">
      <NavBar />
      <Scrollytelling />
      <DeepDiveSection />

      {/* Fallback / Footer Content if needed after scroll */}
      <Footer />
    </main>
  );
}
