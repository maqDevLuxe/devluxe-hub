import { type SubscriptionTier } from "@/contexts/SubscriptionContext";

export interface LibraryComponent {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredTier: SubscriptionTier;
  preview: string;
  previewAr?: string; // Arabic RTL variant
  tags: string[];
  isSaasTool?: boolean;
}

export type ComponentCategory =
  | "E-commerce UI"
  | "SaaS Dashboards"
  | "Marketing Blocks"
  | "Web3 / Fintech";

export const CATEGORIES: ComponentCategory[] = [
  "E-commerce UI",
  "SaaS Dashboards",
  "Marketing Blocks",
  "Web3 / Fintech",
];

export const componentLibrary: LibraryComponent[] = [
  /* ── E-commerce UI ─────────────────────── */
  {
    id: "product-card",
    name: "Product Card",
    description: "A sleek product card with image, price badge, and add-to-cart CTA.",
    category: "E-commerce UI",
    requiredTier: "free",
    preview: `<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 w-72">
  <div class="h-40 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 mb-4 flex items-center justify-center text-sm opacity-60">Product Image</div>
  <h3 class="font-semibold text-lg mb-1">Premium Headphones</h3>
  <p class="text-sm opacity-60 mb-3">Wireless noise-cancelling</p>
  <div class="flex items-center justify-between">
    <span class="text-xl font-bold">$299</span>
    <button class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-medium">Add to Cart</button>
  </div>
</div>`,
    previewAr: `<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 w-72" dir="rtl">
  <div class="h-40 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 mb-4 flex items-center justify-center text-sm opacity-60">صورة المنتج</div>
  <h3 class="font-semibold text-lg mb-1">سماعات فاخرة</h3>
  <p class="text-sm opacity-60 mb-3">لاسلكية مع عزل الضوضاء</p>
  <div class="flex items-center justify-between">
    <span class="text-xl font-bold">$299</span>
    <button class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-medium">أضف للسلة</button>
  </div>
</div>`,
    tags: ["card", "product", "e-commerce"],
  },
  {
    id: "cart-summary",
    name: "Cart Summary",
    description: "A compact cart summary widget with item count, subtotal, and checkout button.",
    category: "E-commerce UI",
    requiredTier: "professional",
    preview: `<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 w-80">
  <h3 class="font-semibold mb-4">Cart Summary</h3>
  <div class="space-y-2 mb-4 text-sm">
    <div class="flex justify-between"><span class="opacity-60">Items (3)</span><span>$597</span></div>
    <div class="flex justify-between"><span class="opacity-60">Shipping</span><span class="text-green-400">Free</span></div>
    <div class="border-t border-white/10 pt-2 flex justify-between font-bold"><span>Total</span><span>$597</span></div>
  </div>
  <button class="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold">Checkout</button>
</div>`,
    previewAr: `<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 w-80" dir="rtl">
  <h3 class="font-semibold mb-4">ملخص السلة</h3>
  <div class="space-y-2 mb-4 text-sm">
    <div class="flex justify-between"><span class="opacity-60">العناصر (3)</span><span>$597</span></div>
    <div class="flex justify-between"><span class="opacity-60">الشحن</span><span class="text-green-400">مجاني</span></div>
    <div class="border-t border-white/10 pt-2 flex justify-between font-bold"><span>الإجمالي</span><span>$597</span></div>
  </div>
  <button class="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold">الدفع</button>
</div>`,
    tags: ["cart", "checkout", "e-commerce"],
  },

  /* ── SaaS Dashboards ───────────────────── */
  {
    id: "stat-card",
    name: "Animated Stat Card",
    description: "A stat display card with count-up animation and trend indicator.",
    category: "SaaS Dashboards",
    requiredTier: "free",
    preview: `<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 w-64">
  <p class="text-sm opacity-60 mb-1">Revenue</p>
  <p class="text-3xl font-bold">$12,450</p>
  <span class="text-green-400 text-sm">↑ 12.5%</span>
</div>`,
    previewAr: `<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 w-64" dir="rtl">
  <p class="text-sm opacity-60 mb-1">الإيرادات</p>
  <p class="text-3xl font-bold">$12,450</p>
  <span class="text-green-400 text-sm">↑ 12.5%</span>
</div>`,
    tags: ["stats", "dashboard", "data"],
    isSaasTool: true,
  },
  {
    id: "dashboard-layout",
    name: "Dashboard Shell",
    description: "A full dashboard shell with collapsible sidebar, header, and content area.",
    category: "SaaS Dashboards",
    requiredTier: "ultimate",
    preview: `<div class="flex h-[300px] rounded-xl border border-white/10 overflow-hidden w-full">
  <aside class="w-48 bg-white/5 border-r border-white/10 p-4 text-sm">
    <div class="font-semibold mb-4">Dashboard</div>
    <div class="space-y-2 opacity-60">
      <div>Overview</div>
      <div>Analytics</div>
      <div>Settings</div>
    </div>
  </aside>
  <main class="flex-1 p-6">
    <div class="text-lg font-semibold mb-2">Welcome back</div>
    <div class="grid grid-cols-2 gap-3">
      <div class="h-20 rounded-lg bg-white/5 border border-white/10"></div>
      <div class="h-20 rounded-lg bg-white/5 border border-white/10"></div>
    </div>
  </main>
</div>`,
    tags: ["dashboard", "layout", "sidebar"],
    isSaasTool: true,
  },

  /* ── Marketing Blocks ──────────────────── */
  {
    id: "hero-section",
    name: "Hero Section",
    description: "A bold hero block with gradient headline, subtitle, and dual CTAs.",
    category: "Marketing Blocks",
    requiredTier: "free",
    preview: `<div class="text-center py-12 px-6">
  <h1 class="text-4xl font-bold mb-4" style="background:linear-gradient(135deg,#7c3aed,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Build Faster, Ship Smarter</h1>
  <p class="text-lg opacity-60 max-w-md mx-auto mb-6">The modern developer toolkit for premium web experiences.</p>
  <div class="flex gap-3 justify-center">
    <button class="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold">Get Started</button>
    <button class="px-6 py-3 rounded-lg border border-white/20 font-semibold">Learn More</button>
  </div>
</div>`,
    previewAr: `<div class="text-center py-12 px-6" dir="rtl">
  <h1 class="text-4xl font-bold mb-4" style="background:linear-gradient(135deg,#7c3aed,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent">ابنِ أسرع، أطلق بذكاء</h1>
  <p class="text-lg opacity-60 max-w-md mx-auto mb-6">مجموعة الأدوات العصرية لتجارب الويب الفاخرة.</p>
  <div class="flex gap-3 justify-center">
    <button class="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold">ابدأ الآن</button>
    <button class="px-6 py-3 rounded-lg border border-white/20 font-semibold">اعرف المزيد</button>
  </div>
</div>`,
    tags: ["hero", "landing", "marketing"],
  },
  {
    id: "testimonial-card",
    name: "Testimonial Card",
    description: "An editorial testimonial card with avatar, quote, and star rating.",
    category: "Marketing Blocks",
    requiredTier: "professional",
    preview: `<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 w-80">
  <div class="flex gap-1 mb-3 text-yellow-400">★★★★★</div>
  <p class="text-sm opacity-80 mb-4 italic">"This toolkit saved us hundreds of hours. The components are pixel-perfect and production-ready."</p>
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500"></div>
    <div>
      <div class="font-semibold text-sm">Sarah Chen</div>
      <div class="text-xs opacity-60">CTO, TechStart</div>
    </div>
  </div>
</div>`,
    tags: ["testimonial", "social-proof", "marketing"],
  },

  /* ── Web3 / Fintech ────────────────────── */
  {
    id: "wallet-connect",
    name: "Wallet Connect Card",
    description: "A Web3 wallet connection card with provider selection and balance display.",
    category: "Web3 / Fintech",
    requiredTier: "professional",
    preview: `<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 w-80">
  <h3 class="font-semibold mb-4">Connect Wallet</h3>
  <div class="space-y-2">
    <button class="w-full py-3 px-4 rounded-lg border border-white/10 bg-white/5 text-sm flex items-center gap-3 hover:bg-white/10 transition">
      <div class="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-xs">🦊</div>
      MetaMask
    </button>
    <button class="w-full py-3 px-4 rounded-lg border border-white/10 bg-white/5 text-sm flex items-center gap-3 hover:bg-white/10 transition">
      <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">💎</div>
      WalletConnect
    </button>
  </div>
</div>`,
    tags: ["wallet", "web3", "crypto"],
  },
  {
    id: "token-swap",
    name: "Token Swap Interface",
    description: "A DeFi token swap widget with input fields, rate display, and swap button.",
    category: "Web3 / Fintech",
    requiredTier: "ultimate",
    preview: `<div class="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 w-80">
  <h3 class="font-semibold mb-4">Swap Tokens</h3>
  <div class="space-y-3">
    <div class="rounded-lg bg-white/5 border border-white/10 p-4">
      <div class="flex justify-between text-sm opacity-60 mb-1"><span>From</span><span>Balance: 2.45</span></div>
      <div class="flex justify-between items-center"><input class="bg-transparent text-2xl font-bold w-24 outline-none" value="1.0" /><span class="font-semibold">ETH</span></div>
    </div>
    <div class="text-center text-lg opacity-40">↓</div>
    <div class="rounded-lg bg-white/5 border border-white/10 p-4">
      <div class="flex justify-between text-sm opacity-60 mb-1"><span>To</span><span>Balance: 3,240</span></div>
      <div class="flex justify-between items-center"><span class="text-2xl font-bold">3,240</span><span class="font-semibold">USDC</span></div>
    </div>
    <button class="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold">Swap</button>
  </div>
</div>`,
    tags: ["swap", "defi", "fintech"],
  },
  {
    id: "command-palette",
    name: "Command Palette",
    description: "A spotlight-style command palette with fuzzy search and keyboard navigation.",
    category: "SaaS Dashboards",
    requiredTier: "ultimate",
    preview: `<div class="rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-4 w-[440px]">
  <input placeholder="Type a command..." class="w-full bg-transparent border-b border-white/10 pb-3 mb-3 outline-none text-sm" />
  <div class="space-y-1">
    <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-sm"><span class="opacity-40">⌘K</span> Search components</div>
    <div class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm"><span class="opacity-40">⌘P</span> Go to project</div>
    <div class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-sm"><span class="opacity-40">⌘T</span> Toggle theme</div>
  </div>
</div>`,
    tags: ["command", "search", "navigation"],
    isSaasTool: true,
  },
];
