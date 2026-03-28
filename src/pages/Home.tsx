import { useState } from "react";
import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { PlannerForm } from "../components/PlannerForm";
import { ItineraryDisplay } from "../components/ItineraryDisplay";
import { MapDisplay } from "../components/MapDisplay";
import { generateItinerary } from "../services/geminiService";
import { Itinerary, PlannerFormState } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function Home() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateItinerary = async (data: PlannerFormState) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateItinerary(
        data.startingLocation,
        data.destination,
        data.budgetRs,
        data.days,
        data.travelers,
        data.travelType,
        data.language,
        data.travelScope
      );
      setItinerary(result);
      
      setTimeout(() => {
        document.getElementById("itinerary-display")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Failed to generate itinerary. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <Hero />
      <Features />
      <PlannerForm onSubmit={handleGenerateItinerary} isLoading={isLoading} />
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-6 py-4"
          >
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 text-center font-medium">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {itinerary && (
        <div id="itinerary-display">
          <ItineraryDisplay itinerary={itinerary} onUpdate={setItinerary} />
          <MapDisplay itinerary={itinerary} onUpdate={setItinerary} />
        </div>
      )}
    </main>
  );
}
