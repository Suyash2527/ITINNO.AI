import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlannerFormState } from "../types";
import { MapPin, Navigation, Calendar as CalendarIcon, IndianRupee, Utensils, Palette, TreePine, Landmark, Coffee, Mountain, User, Users, Activity, Globe, Map, Heart, Camera, Car, Sparkles, Minus, Plus, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { generateBudgetInsights } from "../services/geminiService";

interface PlannerFormProps {
  onSubmit: (data: PlannerFormState) => void;
  isLoading: boolean;
}

export function PlannerForm({ onSubmit, isLoading }: PlannerFormProps) {
  const [formData, setFormData] = useState<PlannerFormState>({
    startingLocation: "",
    destination: "",
    budgetRs: 50000,
    days: 3,
    travelers: 2,
    travelType: "Adventure",
    language: "English",
    travelScope: "Local",
  });

  const [interests, setInterests] = useState<string[]>([]);
  const [budgetInsight, setBudgetInsight] = useState<{ isSufficient: boolean; message: string; recommendedBudget: number } | null>(null);
  const [isAnalyzingBudget, setIsAnalyzingBudget] = useState(false);

  // Debounce budget analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.startingLocation && formData.destination && formData.budgetRs > 0 && formData.days > 0) {
        analyzeBudget();
      } else {
        setBudgetInsight(null);
      }
    }, 1500); // Wait 1.5s after user stops typing/sliding

    return () => clearTimeout(timer);
  }, [formData.startingLocation, formData.destination, formData.budgetRs, formData.days, formData.travelers, formData.travelType]);

  const analyzeBudget = async () => {
    setIsAnalyzingBudget(true);
    try {
      const insight = await generateBudgetInsights(
        formData.startingLocation,
        formData.destination,
        formData.budgetRs,
        formData.days,
        formData.travelers,
        formData.travelType
      );
      setBudgetInsight(insight);
    } catch (error) {
      console.error("Failed to analyze budget", error);
    } finally {
      setIsAnalyzingBudget(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
    // Update travelType based on first interest for now to keep compatibility
    if (!interests.includes(interest) && interests.length === 0) {
      setFormData(prev => ({ ...prev, travelType: interest }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <section id="planner" className="py-16 md:py-24 bg-background relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-surface rounded-[2rem] p-6 sm:p-8 md:p-12 border border-white/5 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-8 md:mb-10">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-xl md:text-2xl font-serif font-bold text-text tracking-wide">Travel-OS</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Travel Scope */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Travel Scope</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, travelScope: "Local" })}
                  className={`py-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    formData.travelScope === "Local"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-surface-light border-text/5 text-text/60 hover:text-text hover:border-text/20"
                  }`}
                >
                  <Map className="w-4 h-4" />
                  Local (Domestic)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, travelScope: "International" })}
                  className={`py-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    formData.travelScope === "International"
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-surface-light border-text/5 text-text/60 hover:text-text hover:border-text/20"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  International
                </button>
              </div>
            </div>

            {/* Destinations */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Destinations</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
                <input
                  type="text"
                  required
                  placeholder="Paris, London, Rome"
                  className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl bg-surface-light border border-text/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-text placeholder:text-text/30"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
            </div>

            {/* Origin */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Origin</label>
              <div className="relative">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
                <input
                  type="text"
                  required
                  placeholder="New York (JFK)"
                  className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl bg-surface-light border border-text/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-text placeholder:text-text/30"
                  value={formData.startingLocation}
                  onChange={(e) => setFormData({ ...formData, startingLocation: e.target.value })}
                />
              </div>
            </div>

            {/* Dates & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Duration (Days)</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl bg-surface-light border border-text/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-text"
                    value={formData.days}
                    onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Language</label>
                <select
                  className="w-full px-4 py-3 md:py-4 rounded-xl bg-surface-light border border-text/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-text appearance-none"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Japanese">Japanese</option>
                </select>
              </div>
            </div>

            {/* Budget Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Total Budget (INR)</label>
                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  ₹{formData.budgetRs.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min="5000"
                  max="1000000"
                  step="5000"
                  className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer accent-primary"
                  value={formData.budgetRs}
                  onChange={(e) => setFormData({ ...formData, budgetRs: parseInt(e.target.value) || 5000 })}
                />
                <div className="flex justify-between text-xs text-text/40 mt-2 font-medium">
                  <span>₹5K</span>
                  <span>₹10L+</span>
                </div>
              </div>

              {/* AI Budget Insight */}
              <AnimatePresence>
                {(budgetInsight || isAnalyzingBudget) && formData.startingLocation && formData.destination && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`mt-4 p-4 rounded-xl border flex gap-3 ${
                      isAnalyzingBudget 
                        ? "bg-surface-light border-text/10" 
                        : budgetInsight?.isSufficient 
                          ? "bg-green-500/10 border-green-500/20" 
                          : "bg-red-500/10 border-red-500/20"
                    }`}>
                      <div className="shrink-0 mt-0.5">
                        {isAnalyzingBudget ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full" />
                        ) : budgetInsight?.isSufficient ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className={`text-sm font-bold ${
                          isAnalyzingBudget ? "text-text" : budgetInsight?.isSufficient ? "text-green-500" : "text-red-500"
                        }`}>
                          {isAnalyzingBudget ? "Analyzing Budget..." : budgetInsight?.isSufficient ? "Budget Looks Good!" : "Budget Might Be Low"}
                        </h4>
                        {!isAnalyzingBudget && budgetInsight && (
                          <>
                            <p className="text-xs text-text/80 leading-relaxed">
                              {budgetInsight.message}
                            </p>
                            {!budgetInsight.isSufficient && (
                              <div className="mt-2 pt-2 border-t border-red-500/10 flex items-center justify-between">
                                <span className="text-xs font-medium text-text/60">AI Recommended:</span>
                                <button 
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, budgetRs: budgetInsight.recommendedBudget }))}
                                  className="text-xs font-bold text-primary hover:underline"
                                >
                                  Set to ₹{budgetInsight.recommendedBudget.toLocaleString('en-IN')}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Travelers Counter */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Travelers</label>
              <div className="flex items-center justify-between bg-surface-light border border-text/5 rounded-xl p-2 md:p-3">
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, travelers: Math.max(1, f.travelers - 1) }))}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-surface hover:bg-surface/80 rounded-lg text-text transition-colors"
                >
                  <Minus className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-xl md:text-2xl font-bold text-text">{formData.travelers}</span>
                  <span className="text-xs text-text/50 uppercase tracking-widest">
                    {formData.travelers === 1 ? 'Person' : 'People'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, travelers: Math.min(20, f.travelers + 1) }))}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-surface hover:bg-surface/80 rounded-lg text-text transition-colors"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Travel Type / Interests */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Travel Vibe & Interests</label>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {[
                  { id: "Adventure", icon: Mountain },
                  { id: "Relax", icon: Coffee },
                  { id: "Cultural", icon: Landmark },
                  { id: "Food", icon: Utensils },
                  { id: "Nature", icon: TreePine },
                  { id: "Romantic", icon: Heart },
                  { id: "Photography", icon: Camera },
                  { id: "Road Trip", icon: Car },
                  { id: "Luxury", icon: Sparkles },
                ].map((interest) => {
                  const Icon = interest.icon;
                  const isSelected = interests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg border text-xs md:text-sm font-medium transition-colors ${
                        isSelected 
                          ? "bg-primary/10 border-primary text-primary" 
                          : "bg-surface-light border-text/5 text-text/60 hover:text-text hover:border-text/20"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      {interest.id.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className={`w-full py-4 mt-4 rounded-xl text-base md:text-lg font-bold text-surface transition-all ${
                isLoading ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full"
                  />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Activity className="w-5 h-5" />
                  Run Diagnostics
                </span>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
