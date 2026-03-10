/**
 * FeaturedTools — Bento grid of 4 glassmorphism tool cards with hover scale.
 */
import { motion } from "framer-motion";
import { Palette, Image, Braces, PenTool, Pipette, MousePointer2, Share2, CreditCard, Wand2, Monitor } from "lucide-react";
import { Link } from "react-router-dom";

const tools = [
  {
    icon: Palette,
    name: "Gradient Generator",
    description: "Create stunning CSS gradients with a live visual editor.",
    color: "from-primary/20 to-glow-secondary/20",
    span: "md:col-span-2",
    link: "/gradient-generator",
  },
  {
    icon: Image,
    name: "Favicon Maker",
    description: "Design and export favicons in all required formats instantly.",
    color: "from-glow-secondary/20 to-primary/10",
    span: "",
    link: "/favicon-generator",
  },
  {
    icon: Braces,
    name: "JSON Formatter",
    description: "Beautify, minify, and validate JSON with syntax highlighting.",
    color: "from-primary/10 to-glow-secondary/20",
    span: "",
    link: "/json-formatter",
  },
  {
    icon: PenTool,
    name: "SVG Optimizer",
    description: "Compress and clean SVG files while preserving visual quality.",
    color: "from-glow-secondary/10 to-primary/20",
    span: "",
    link: "/svg-optimizer",
  },
  {
    icon: MousePointer2,
    name: "Button Generator",
    description: "Design premium React buttons with live hover animations and export clean code.",
    color: "from-primary/20 to-glow-secondary/10",
    span: "",
    link: "/button-generator",
  },
  {
    icon: Share2,
    name: "OG Tag Generator",
    description: "Preview social cards for Facebook, Twitter & LinkedIn and export meta tags.",
    color: "from-glow-secondary/15 to-primary/15",
    span: "",
    link: "/og-tag-generator",
  },
  {
    icon: CreditCard,
    name: "Pricing Generator",
    description: "Build high-converting SaaS pricing tables with live preview and Tailwind export.",
    color: "from-primary/20 to-glow-secondary/20",
    span: "",
    link: "/pricing-generator",
  },
  {
    icon: Pipette,
    name: "Color Extractor",
    description: "Extract dominant color palettes from any image instantly.",
    color: "from-primary/15 to-glow-secondary/15",
    span: "",
    link: "/color-extractor",
  },
  {
    icon: Wand2,
    name: "CSS Animator",
    description: "Build CSS @keyframes visually with a bezier curve editor and live preview.",
    color: "from-glow-secondary/20 to-primary/15",
    span: "md:col-span-2",
    link: "/css-animator",
  },
  {
    icon: Monitor,
    name: "Mockup Generator",
    description: "Turn screenshots into Dribbble-ready mockups with device frames and gradients.",
    color: "from-primary/15 to-glow-secondary/20",
    span: "md:col-span-2",
    link: "/mockup-generator",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const FeaturedTools = () => {
  return (
    <section className="relative py-32">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Featured <span className="gradient-text">Tools</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Handpicked utilities designed for speed, privacy, and a premium developer experience.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {tools.map((tool) => (
            <motion.div
              key={tool.name}
              variants={cardVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className={`glass-card rounded-2xl cursor-pointer group relative overflow-hidden ${tool.span}`}
            >
              <Link to={tool.link} className="block p-8 relative">
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <tool.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
                    {tool.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedTools;
