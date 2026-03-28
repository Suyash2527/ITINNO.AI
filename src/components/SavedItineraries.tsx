import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserItineraries } from "../services/dbService";
import { Itinerary } from "../types";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Calendar, MapPin, IndianRupee, Share2, Trash2, ExternalLink } from "lucide-react";
import { ShareItinerary } from "./ShareItinerary";

interface SavedItinerariesProps {
  onSelect: (itinerary: Itinerary) => void;
}

export function SavedItineraries({ onSelect }: SavedItinerariesProps) {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [sharingItinerary, setSharingItinerary] = useState<Itinerary | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      loadItineraries(userId);
    } else {
      setItineraries([]);
      setLoading(false);
    }
  }, [userId]);

  const loadItineraries = async (uid: string) => {
    setLoading(true);
    try {
      const data = await getUserItineraries(uid);
      setItineraries(data);
    } catch (error) {
      console.error("Failed to load itineraries:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-text/60">Loading saved itineraries...</p>
        </div>
      </section>
    );
  }

  if (itineraries.length === 0) return null;

  return (
    <section className="py-24 bg-background relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-text mb-4">Your Travel Dashboard</h2>
          <p className="text-text/60 max-w-2xl mx-auto">Revisit your past travel plans, share them with friends, or continue planning your next adventure.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {itineraries.map((itinerary, index) => (
            <motion.div
              key={itinerary.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-surface rounded-[2rem] p-8 shadow-2xl hover:shadow-primary/5 transition-all border border-text/5 group relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-text mb-1 group-hover:text-primary transition-colors">{itinerary.destination}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-text/40 uppercase tracking-widest font-bold">
                    <Calendar className="w-3 h-3" />
                    {itinerary.createdAt 
                      ? new Date((itinerary.createdAt as any).seconds * 1000).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) 
                      : "Recently saved"}
                  </div>
                </div>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {itinerary.days.length} Days
                </span>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-text/70">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="font-medium">From: {itinerary.startingLocation}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text/70">
                  <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Budget: ₹{itinerary.budgetRs.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-text/5 flex items-center justify-between">
                <button
                  onClick={() => onSelect(itinerary)}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Details
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSharingItinerary(itinerary);
                    }}
                    className="p-3 bg-background/50 hover:bg-primary/10 text-text/40 hover:text-primary rounded-xl transition-all"
                    title="Share Itinerary"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-3 bg-background/50 hover:bg-red-500/10 text-text/40 hover:text-red-500 rounded-xl transition-all"
                    title="Delete Itinerary"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {sharingItinerary && (
          <ShareItinerary 
            itinerary={sharingItinerary} 
            onClose={() => setSharingItinerary(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}
