/**
 * Index — DevLuxe homepage assembling all sections.
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedTools from "@/components/FeaturedTools";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturedTools />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
