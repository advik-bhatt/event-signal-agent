"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  cluster: number;
  isHighlight: boolean;
}

interface Edge {
  a: number;
  b: number;
  opacity: number;
}

const CLUSTER_COLORS = [
  "rgba(90,122,90,",    // sage
  "rgba(90,100,140,",   // soft blue
  "rgba(140,100,80,",   // warm brown
  "rgba(100,120,90,",   // muted green
];

function EventGraph({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current || width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Build nodes
    const nodeCount = Math.min(55, Math.floor((width * height) / 5000));
    const clusterCount = 4;
    const nodes: Node[] = [];

    // Cluster centers
    const centers = [
      { x: width * 0.25, y: height * 0.3 },
      { x: width * 0.72, y: height * 0.25 },
      { x: width * 0.6, y: height * 0.68 },
      { x: width * 0.22, y: height * 0.65 },
    ];

    for (let i = 0; i < nodeCount; i++) {
      const cluster = i % clusterCount;
      const cx = centers[cluster].x;
      const cy = centers[cluster].y;
      const spread = Math.min(width, height) * 0.14;

      nodes.push({
        x: cx + (Math.random() - 0.5) * spread,
        y: cy + (Math.random() - 0.5) * spread,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: 2 + Math.random() * 4,
        opacity: 0.3 + Math.random() * 0.5,
        cluster,
        isHighlight: i < 3,
      });
    }

    // Build edges (connect nearby nodes in same/adjacent clusters)
    const edges: Edge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.min(width, height) * 0.2;
        if (dist < maxDist && Math.random() > 0.6) {
          edges.push({ a: i, b: j, opacity: (1 - dist / maxDist) * 0.3 });
        }
      }
    }

    nodesRef.current = nodes;
    edgesRef.current = edges;

    function draw() {
      if (!ctx || !canvas) return;
      timeRef.current += 0.008;
      const t = timeRef.current;

      ctx.clearRect(0, 0, width, height);

      // Draw edges
      for (const edge of edgesRef.current) {
        const a = nodesRef.current[edge.a];
        const b = nodesRef.current[edge.b];
        const pulse = Math.sin(t + edge.a * 0.3) * 0.5 + 0.5;
        const color = CLUSTER_COLORS[a.cluster];

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `${color}${edge.opacity * (0.4 + pulse * 0.3)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw nodes
      for (let i = 0; i < nodesRef.current.length; i++) {
        const node = nodesRef.current[i];
        const pulse = Math.sin(t + i * 0.4) * 0.5 + 0.5;
        const color = CLUSTER_COLORS[node.cluster];

        // Glow for highlight nodes
        if (node.isHighlight) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `${color}0.08)`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r * 2, 0, Math.PI * 2);
          ctx.fillStyle = `${color}0.15)`;
          ctx.fill();
        }

        // Node
        ctx.beginPath();
        ctx.arc(
          node.x,
          node.y,
          node.r * (node.isHighlight ? 1 + pulse * 0.3 : 1),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `${color}${node.opacity * (0.7 + pulse * 0.3)})`;
        ctx.fill();

        // Gentle drift
        node.x += node.vx * (1 + Math.sin(t * 0.3 + i) * 0.3);
        node.y += node.vy * (1 + Math.cos(t * 0.25 + i) * 0.3);

        // Soft boundary bounce
        const pad = 20;
        if (node.x < pad || node.x > width - pad) node.vx *= -1;
        if (node.y < pad || node.y > height - pad) node.vy *= -1;
        node.x = Math.max(pad, Math.min(width - pad, node.x));
        node.y = Math.max(pad, Math.min(height - pad, node.y));
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="rounded-2xl"
    />
  );
}

export default function DataViz() {
  const ref = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDims({
          width: Math.floor(rect.width),
          height: Math.floor(Math.min(rect.width * 0.55, 420)),
        });
      }
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section
      ref={ref}
      className="py-28 md:py-36 px-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #f8f6f2, rgba(90,122,90,0.04) 40%, #f8f6f2)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <span className="font-sans text-xs tracking-[0.2em] uppercase text-charcoal/35">
            The intelligence
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-4"
        >
          How Breathe sees your world.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="font-sans text-base text-charcoal/45 text-center max-w-lg mx-auto mb-12"
        >
          Events cluster by topic, audience, and timing. Your ranked shortlist emerges
          from the intersection of all three.
        </motion.p>

        {/* Canvas container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.25 }}
          ref={containerRef}
          className="relative w-full rounded-2xl overflow-hidden border border-charcoal/6 bg-white/30"
        >
          {dims.width > 0 && (
            <EventGraph width={dims.width} height={dims.height} />
          )}

          {/* Overlay legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4">
            {[
              { color: "bg-[#5a7a5a]", label: "Tech events" },
              { color: "bg-[#5a648c]", label: "Founder events" },
              { color: "bg-[#8c6450]", label: "Design events" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full opacity-60 ${item.color}`} />
                <span className="font-sans text-[10px] text-charcoal/35">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Highlight nodes label */}
          <div className="absolute top-4 right-4 text-right">
            <div className="font-serif text-2xl text-charcoal/70">400+</div>
            <div className="font-sans text-[10px] text-charcoal/30 uppercase tracking-wider">events scanned</div>
          </div>
        </motion.div>

        {/* Caption */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-center font-sans text-sm text-charcoal/35 italic"
        >
          &ldquo;400+ events. Your 3. Ranked in seconds.&rdquo;
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto"
        >
          {[
            { value: "532", label: "Events found per week", unit: "avg" },
            { value: "< 2s", label: "Time to rank", unit: "" },
            { value: "94%", label: "Match accuracy", unit: "" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4">
              <div className="font-serif text-3xl text-charcoal/80 mb-1">
                {stat.value}
                {stat.unit && (
                  <span className="text-sm text-charcoal/30 ml-1">{stat.unit}</span>
                )}
              </div>
              <div className="font-sans text-[11px] text-charcoal/35 uppercase tracking-wider leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
