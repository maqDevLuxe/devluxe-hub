import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { UsageProvider } from "@/contexts/UsageContext";
import Index from "./pages/Index";
import GradientGenerator from "./pages/GradientGenerator";
import FaviconGenerator from "./pages/FaviconGenerator";
import ColorExtractor from "./pages/ColorExtractor";
import ButtonGenerator from "./pages/ButtonGenerator";
import OgTagGenerator from "./pages/OgTagGenerator";
import PricingGenerator from "./pages/PricingGenerator";
import CssAnimator from "./pages/CssAnimator";
import JsonFormatter from "./pages/JsonFormatter";
import SvgOptimizer from "./pages/SvgOptimizer";
import MockupGenerator from "./pages/MockupGenerator";
import ComponentLibrary from "./pages/ComponentLibrary";
import ComponentDetail from "./pages/ComponentDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <SubscriptionProvider>
      <UsageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/gradient-generator" element={<GradientGenerator />} />
                <Route path="/favicon-generator" element={<FaviconGenerator />} />
                <Route path="/color-extractor" element={<ColorExtractor />} />
                <Route path="/button-generator" element={<ButtonGenerator />} />
                <Route path="/og-tag-generator" element={<OgTagGenerator />} />
                <Route path="/pricing-generator" element={<PricingGenerator />} />
                <Route path="/css-animator" element={<CssAnimator />} />
                <Route path="/json-formatter" element={<JsonFormatter />} />
                <Route path="/svg-optimizer" element={<SvgOptimizer />} />
                <Route path="/mockup-generator" element={<MockupGenerator />} />
                <Route path="/components" element={<ComponentLibrary />} />
                <Route path="/components/:id" element={<ComponentDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </UsageProvider>
    </SubscriptionProvider>
  </ThemeProvider>
);

export default App;
