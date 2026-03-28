import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Map, Plane, ArrowRight } from "lucide-react";
import { useState } from "react";

export function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const scale = useTransform(scrollY, [0, 1000], [1, 1.2]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  const [activeTab, setActiveTab] = useState<"plan" | "flight">("plan");
  const [destination, setDestination] = useState("");

  const handleDream = () => {
    const plannerSection = document.getElementById('planner');
    if (plannerSection) {
      plannerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        style={{ y, scale, opacity }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background z-10" />
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
          alt="Breathtaking Travel Landscape"
          className="w-full h-full object-cover opacity-90"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      <div className="relative z-20 text-center px-6 w-full max-w-5xl mx-auto mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 relative p-3 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-surface/10 backdrop-blur-md border border-text/5 shadow-lg overflow-hidden group inline-block mx-auto"
        >
          {/* Subtle light reflection/glow */}
          <div className="absolute -inset-full bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-20 group-hover:rotate-180 transition-transform duration-1000 pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-transparent text-stroke-text tracking-widest uppercase leading-none drop-shadow-sm">
              TRAVEL BEYOND
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif text-primary -mt-1 md:-mt-2 drop-shadow-2xl filter brightness-110">
              Boundaries
            </h2>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-text/80 mb-12 max-w-2xl mx-auto font-light"
        >
          We don't just plan trips; we engineer memories. Experience the world
          through bespoke itineraries crafted by next-generation intelligence.
        </motion.p>

        {/* Search/Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-3xl mx-auto bg-surface/40 backdrop-blur-xl border border-text/10 rounded-3xl p-2"
        >
          <div className="flex items-center gap-2 mb-2 px-4 pt-2">
            <button
              onClick={() => setActiveTab("plan")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === "plan" ? "bg-primary text-surface" : "text-text/70 hover:text-text"
              }`}
            >
              <Map className="w-4 h-4" />
              PLAN TRIP
            </button>
            <button
              onClick={() => setActiveTab("flight")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === "flight" ? "bg-primary text-surface" : "text-text/70 hover:text-text"
              }`}
            >
              <Plane className="w-4 h-4" />
              BOOK FLIGHT
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center bg-surface-light/50 rounded-2xl p-2 gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 md:py-0">
              <Search className="w-5 h-5 text-text/50" />
              <input
                type="text"
                placeholder="Where to? (e.g. Kyoto, Paris)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-text placeholder:text-text/50 text-lg"
              />
            </div>
            <button
              onClick={handleDream}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-surface px-8 py-4 rounded-xl font-bold transition-colors w-full md:w-auto"
            >
              DREAM
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Suggested Destinations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          {["SANTORINI", "TOKYO", "REYKJAVIK", "BALI"].map((dest) => (
            <button
              key={dest}
              onClick={() => setDestination(dest)}
              className="px-6 py-2 rounded-full bg-surface/60 backdrop-blur-sm border border-text/10 text-xs font-bold tracking-widest text-text/80 hover:text-text hover:bg-surface transition-colors"
            >
              {dest}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
