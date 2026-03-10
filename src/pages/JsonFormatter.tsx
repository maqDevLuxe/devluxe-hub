/**
 * JsonFormatter — Hacker Luxury JSON formatter, validator, and minifier.
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ArrowLeft, Trash2, Minimize2, AlignLeft, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ─── Error Parser ─── */
function parseJsonError(input: string, err: unknown): { message: string; line: number | null } {
  const msg = err instanceof Error ? err.message : String(err);
  // Try to extract position from error message
  const posMatch = msg.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = Number(posMatch[1]);
    const line = input.substring(0, pos).split("\n").length;
    return { message: msg, line };
  }
  const lineMatch = msg.match(/line\s+(\d+)/i);
  if (lineMatch) {
    return { message: msg, line: Number(lineMatch[1]) };
  }
  return { message: msg, line: null };
}

/* ─── Copy Button ─── */
const CopyBtn = ({ text, label = "Copy" }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
};

/* ─── Line Numbers ─── */
const LineNumbers = ({ count, errorLine }: { count: number; errorLine: number | null }) => (
  <div className="select-none pr-3 text-right border-r border-border mr-3 min-w-[2.5rem]">
    {Array.from({ length: Math.max(count, 1) }, (_, i) => (
      <div
        key={i}
        className={`text-xs leading-[1.625rem] font-mono ${
          errorLine === i + 1 ? "text-destructive font-bold" : "text-muted-foreground/40"
        }`}
      >
        {i + 1}
      </div>
    ))}
  </div>
);

/* ─── SEO Section ─── */
const SeoSection = () => (
  <section className="py-24 border-t border-border">
    <div className="container mx-auto px-6 max-w-4xl space-y-16">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          What Is <span className="gradient-text">JSON</span>?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          JSON (JavaScript Object Notation) is a lightweight, text-based data interchange format that's
          easy for humans to read and write, and easy for machines to parse and generate. It's the de facto
          standard for REST APIs, configuration files, and data storage in modern web development. JSON
          supports six data types: strings, numbers, booleans, null, arrays, and objects—making it both
          simple and powerful enough for nearly any data structure.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          How to Validate a <span className="gradient-text">JSON File</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Validation ensures your JSON is syntactically correct and parseable. The simplest method is
          <code className="text-primary mx-1">JSON.parse()</code> in JavaScript—it throws a
          <code className="text-primary mx-1">SyntaxError</code> with position information when the input
          is malformed. For schema validation (ensuring data matches expected structure), tools like
          JSON Schema, Ajv, or Zod provide type-safe validation with detailed error messages.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Our formatter above catches parse errors and pinpoints the exact line number, making it easy to
          locate and fix syntax issues. Paste your JSON, and any errors will be highlighted instantly.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Common JSON <span className="gradient-text">Syntax Errors</span> Explained
        </h2>
        <div className="space-y-3">
          {[
            { error: "Trailing commas", example: '{ "a": 1, }', fix: "Remove the comma after the last property or array element." },
            { error: "Single quotes", example: "{ 'key': 'value' }", fix: "JSON requires double quotes for strings." },
            { error: "Unquoted keys", example: "{ key: \"value\" }", fix: "All keys must be wrapped in double quotes." },
            { error: "Comments", example: "{ /* note */ }", fix: "JSON does not support comments. Remove them or use JSONC." },
          ].map((item) => (
            <div key={item.error} className="glass-card rounded-xl p-4 space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">{item.error}</h3>
              <code className="text-xs font-mono text-destructive block">{item.example}</code>
              <p className="text-xs text-muted-foreground">{item.fix}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            { q: "Is my data sent to a server?", a: "No. Everything runs 100% in your browser using JavaScript's built-in JSON.parse() and JSON.stringify(). Your data never leaves your machine." },
            { q: "What's the maximum JSON size I can format?", a: "Browser-dependent, but typically several megabytes. For extremely large files (100MB+), consider command-line tools like jq." },
            { q: "Can I format JSONC (JSON with comments)?", a: "This tool validates strict JSON. Comments will cause a parse error. Strip comments first, or use a JSONC-aware parser." },
            { q: "What indentation does the formatter use?", a: "The beautifier uses 2-space indentation for clean, readable output. The minifier removes all whitespace for the smallest possible payload." },
          ].map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border">
              <AccordionTrigger className="text-foreground text-left hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
);

/* ─── Main Page ─── */
const JsonFormatter = () => {
  const [input, setInput] = useState('{\n  "name": "DevLuxe",\n  "version": "1.0.0",\n  "tools": [\n    "Gradient Generator",\n    "Favicon Maker",\n    "JSON Formatter"\n  ],\n  "premium": true\n}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState<{ message: string; line: number | null } | null>(null);
  const [stats, setStats] = useState<{ keys: number; depth: number; size: string } | null>(null);

  useEffect(() => {
    document.title = "JSON Formatter & Validator — DevLuxe";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Beautify, minify, and validate JSON with syntax error line detection. Fast, private, runs entirely in your browser.");
    }
  }, []);

  const countKeys = (obj: unknown, depth = 0): { keys: number; maxDepth: number } => {
    if (Array.isArray(obj)) {
      return obj.reduce(
        (acc, item) => {
          const r = countKeys(item, depth + 1);
          return { keys: acc.keys + r.keys, maxDepth: Math.max(acc.maxDepth, r.maxDepth) };
        },
        { keys: 0, maxDepth: depth + 1 }
      );
    }
    if (obj && typeof obj === "object") {
      const entries = Object.entries(obj);
      return entries.reduce(
        (acc, [, val]) => {
          const r = countKeys(val, depth + 1);
          return { keys: acc.keys + 1 + r.keys, maxDepth: Math.max(acc.maxDepth, r.maxDepth) };
        },
        { keys: 0, maxDepth: depth + 1 }
      );
    }
    return { keys: 0, maxDepth: depth };
  };

  const formatJson = useCallback(
    (minify = false) => {
      if (!input.trim()) {
        setOutput("");
        setError(null);
        setStats(null);
        return;
      }
      try {
        const parsed = JSON.parse(input);
        const formatted = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
        setOutput(formatted);
        setError(null);
        const { keys, maxDepth } = countKeys(parsed);
        const bytes = new Blob([formatted]).size;
        setStats({
          keys,
          depth: maxDepth,
          size: bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`,
        });
      } catch (err) {
        const parsed = parseJsonError(input, err);
        setError(parsed);
        setOutput("");
        setStats(null);
      }
    },
    [input]
  );

  // Auto-format on input change
  useEffect(() => {
    const timer = setTimeout(() => formatJson(false), 300);
    return () => clearTimeout(timer);
  }, [input, formatJson]);

  const inputLines = input.split("\n").length;
  const outputLines = output.split("\n").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to tools
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-3xl sm:text-5xl font-display font-bold mb-4">
              JSON <span className="gradient-text">Formatter</span> & Validator
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Beautify, minify, and validate JSON with instant error detection. 100% client-side.
            </p>
          </motion.div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="max-w-6xl mx-auto mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20"
              >
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold text-destructive">Syntax Error</span>
                  {error.line && (
                    <span className="text-muted-foreground ml-2 font-mono text-xs">Line {error.line}</span>
                  )}
                  <p className="text-muted-foreground text-xs mt-0.5 font-mono">{error.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Editor Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
            {/* Input */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Input</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setInput(""); setOutput(""); setError(null); setStats(null); }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>
              <div className="glass-card rounded-xl border border-border overflow-hidden flex-1 min-h-[400px]">
                <div className="flex h-full">
                  <LineNumbers count={inputLines} errorLine={error?.line ?? null} />
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    spellCheck={false}
                    className="flex-1 bg-transparent text-foreground font-mono text-sm leading-[1.625rem] p-0 py-2 pr-4 resize-none focus:outline-none min-h-[400px]"
                    placeholder="Paste your JSON here..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Output */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Output</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => formatJson(true)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Minimize2 className="w-3 h-3" /> Minify
                  </button>
                  <button
                    onClick={() => formatJson(false)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <AlignLeft className="w-3 h-3" /> Beautify
                  </button>
                  <CopyBtn text={output} />
                </div>
              </div>
              <div className="glass-card rounded-xl border border-border overflow-hidden flex-1 min-h-[400px]">
                <div className="flex h-full">
                  <LineNumbers count={output ? outputLines : 0} errorLine={null} />
                  <pre className="flex-1 text-foreground font-mono text-sm leading-[1.625rem] py-2 pr-4 overflow-auto whitespace-pre min-h-[400px]">
                    {output || (
                      <span className="text-muted-foreground/40">Formatted output will appear here...</span>
                    )}
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <AnimatePresence>
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-6xl mx-auto mt-4 flex items-center justify-center gap-6"
              >
                {[
                  { label: "Keys", value: stats.keys },
                  { label: "Depth", value: stats.depth },
                  { label: "Size", value: stats.size },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <p className="text-sm font-mono text-primary font-semibold">{s.value}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <SeoSection />
      <Footer />
    </div>
  );
};

export default JsonFormatter;
