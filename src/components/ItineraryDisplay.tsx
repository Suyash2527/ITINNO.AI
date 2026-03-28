import { motion, AnimatePresence } from "framer-motion";
import { Itinerary, Place } from "../types";
import { Clock, MapPin, Utensils, Bed, Navigation, IndianRupee, Languages, Info, Save, ExternalLink, Activity, Map as MapIcon, Trash2, ChevronDown, ChevronUp, Star, Phone, PieChart as PieChartIcon, CloudSun, Sun, Briefcase, Globe, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { saveItinerary } from "../services/dbService";
import { fetchPlaceDetails, generatePackingTips } from "../services/geminiService";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { toast } from "sonner";

interface ItineraryDisplayProps {
  itinerary: Itinerary | null;
  onUpdate?: (itinerary: Itinerary) => void;
}

export function ItineraryDisplay({ itinerary, onUpdate }: ItineraryDisplayProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [placeDetails, setPlaceDetails] = useState<Record<string, { openingHours: string; userReviews: string; contactInfo: string; photoUrl?: string }>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
  const [generatingTips, setGeneratingTips] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  // Auto-generate packing tips if missing
  useEffect(() => {
    if (!onUpdate || !itinerary) return;

    const fillMissingTips = async () => {
      let changed = false;
      const updatedDays = [...itinerary.days];

      for (let i = 0; i < updatedDays.length; i++) {
        const day = updatedDays[i];
        if (!day.macros?.packingTips || day.macros.packingTips.length < 10) {
          const activities = day.places.map(p => p.name);
          const weather = day.macros?.weatherForecast || "Unknown";
          
          try {
            const tips = await generatePackingTips(itinerary.destination, weather, activities);
            updatedDays[i] = {
              ...day,
              macros: {
                ...day.macros,
                packingTips: tips
              }
            };
            changed = true;
          } catch (error) {
            console.error("Failed to auto-generate tips for day", i + 1, error);
          }
        }
      }

      if (changed) {
        onUpdate({
          ...itinerary,
          days: updatedDays
        });
      }
    };

    fillMissingTips();
  }, [itinerary?.destination]); // Run when destination changes or on mount

  const handleRegenerateTips = async (dayIndex: number) => {
    if (!onUpdate || !itinerary) return;
    
    setGeneratingTips(prev => ({ ...prev, [dayIndex]: true }));
    const day = itinerary.days[dayIndex];
    const activities = day.places.map(p => p.name);
    const weather = day.macros?.weatherForecast || "Unknown";

    try {
      const tips = await generatePackingTips(itinerary.destination, weather, activities);
      const updatedDays = [...itinerary.days];
      updatedDays[dayIndex] = {
        ...day,
        macros: {
          ...day.macros,
          packingTips: tips
        }
      };
      onUpdate({
        ...itinerary,
        days: updatedDays
      });
      toast.success(`Updated packing tips for Day ${dayIndex + 1}`);
    } catch (error) {
      toast.error("Failed to regenerate tips");
    } finally {
      setGeneratingTips(prev => ({ ...prev, [dayIndex]: false }));
    }
  };

  useEffect(() => {
    setIsSaved(false);
  }, [itinerary]);

  if (!itinerary) return null;

  const budgetValue = typeof itinerary.budgetRs === 'string' ? parseInt((itinerary.budgetRs as string).replace(/[^0-9]/g, ''), 10) || 50000 : itinerary.budgetRs || 50000;
  
  const spendingData = [
    { name: 'Accommodation', value: Math.round(budgetValue * 0.4), color: '#38bdf8' },
    { name: 'Food & Dining', value: Math.round(budgetValue * 0.25), color: '#818cf8' },
    { name: 'Activities', value: Math.round(budgetValue * 0.2), color: '#34d399' },
    { name: 'Transport', value: Math.round(budgetValue * 0.15), color: '#fbbf24' },
  ];

  const handleSave = async () => {
    if (!userId || !itinerary) return;
    setIsSaving(true);
    try {
      await saveItinerary(userId, itinerary);
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to save itinerary:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePlace = (placeToRemove: Place) => {
    if (!onUpdate) return;

    const updatedDays = itinerary.days.map(day => ({
      ...day,
      places: day.places.filter(p => p.name !== placeToRemove.name)
    }));

    onUpdate({
      ...itinerary,
      days: updatedDays
    });
  };

  const toggleMoreInfo = async (place: Place, dayIndex: number, placeIndex: number) => {
    const key = `${dayIndex}-${placeIndex}`;
    
    // If we already have the details in the place object, just toggle visibility
    if (place.openingHours || place.userReviews || place.contactInfo) {
      if (placeDetails[key]) {
        const newDetails = { ...placeDetails };
        delete newDetails[key];
        setPlaceDetails(newDetails);
      } else {
        setPlaceDetails(prev => ({ 
          ...prev, 
          [key]: { 
            openingHours: place.openingHours || "Not available", 
            userReviews: place.userReviews || "Not available", 
            contactInfo: place.contactInfo || "Not available" 
          } 
        }));
      }
      return;
    }

    if (placeDetails[key]) {
      // Toggle off by removing from state
      const newDetails = { ...placeDetails };
      delete newDetails[key];
      setPlaceDetails(newDetails);
      return;
    }

    setLoadingDetails(prev => ({ ...prev, [key]: true }));
    try {
      const details = await fetchPlaceDetails(place.name, itinerary.destination);
      setPlaceDetails(prev => ({ ...prev, [key]: details }));
      
      // Optionally save back to itinerary if onUpdate is provided
      if (onUpdate) {
        const updatedDays = [...itinerary.days];
        updatedDays[dayIndex].places[placeIndex] = {
          ...place,
          ...details
        };
        onUpdate({
          ...itinerary,
          days: updatedDays
        });
      }
    } catch (error) {
      console.error("Failed to fetch place details:", error);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <section className="py-24 bg-background relative z-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-text mb-6 tracking-wide">
            Your Journey to <span className="text-primary">{itinerary.destination}</span>
          </h2>
          <p className="text-lg text-text/60 font-light max-w-2xl mx-auto">
            A perfectly crafted itinerary designed just for you.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-surface px-5 py-2.5 rounded-full border border-text/10">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text/80">From: {itinerary.startingLocation}</span>
            </div>
            <div className="flex items-center gap-2 bg-surface px-5 py-2.5 rounded-full border border-text/10">
              <IndianRupee className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text/80">Budget: ₹{itinerary.budgetRs}</span>
            </div>
            <div className="flex items-center gap-2 bg-surface px-5 py-2.5 rounded-full border border-text/10">
              <Languages className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text/80">{itinerary.language}</span>
            </div>
          </div>

          {userId && !itinerary.id && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className={`mt-10 flex items-center gap-2 mx-auto px-8 py-4 rounded-full text-surface font-bold transition-colors shadow-lg ${
                isSaved ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
              }`}
            >
              <Save className="w-5 h-5" />
              {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save Itinerary"}
            </motion.button>
          )}
        </motion.div>

        {itinerary.travelOptions && itinerary.travelOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 bg-surface rounded-[2rem] overflow-hidden border border-text/5 shadow-2xl"
          >
            <div className="bg-surface-light px-8 py-6 border-b border-text/5 flex items-center gap-3">
              <Navigation className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-serif font-bold text-text">Travel Options</h3>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {itinerary.travelOptions.map((option, idx) => (
                  <div key={idx} className="bg-background rounded-2xl p-6 border border-text/5 hover:border-text/10 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-text capitalize mb-1">{option.mode}</h4>
                        {option.provider && <p className="text-sm text-text/50">{option.provider}</p>}
                      </div>
                      <span className="flex items-center gap-1.5 text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                        <IndianRupee className="w-4 h-4" />
                        {option.cost}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text/60 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{option.duration}</span>
                    </div>
                    <p className="text-text/70 leading-relaxed text-sm flex items-start gap-2 mb-4">
                      <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary/70" />
                      {option.description}
                    </p>
                    {option.bookingLink && (
                      <a 
                        href={option.bookingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-3 rounded-xl font-bold transition-colors"
                      >
                        Book Now <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Spending Analysis Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 bg-surface rounded-[2rem] overflow-hidden border border-text/5 shadow-2xl"
        >
          <div className="bg-surface-light px-8 py-6 border-b border-text/5 flex items-center gap-3">
            <PieChartIcon className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-serif font-bold text-text">Spending Analysis</h3>
          </div>
          <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {spendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Estimated Cost']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <h4 className="text-xl font-bold text-text mb-4">Estimated Budget Breakdown</h4>
              {spendingData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-background rounded-xl border border-text/5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-text">{item.name}</span>
                  </div>
                  <span className="font-bold text-text">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20 flex justify-between items-center">
                <span className="font-bold text-primary">Total Estimated</span>
                <span className="text-xl font-bold text-primary">₹{budgetValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-12">
          {itinerary.days.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-surface rounded-[2rem] overflow-hidden border border-text/5 shadow-2xl"
            >
              <div className="bg-surface-light px-8 py-6 border-b border-text/5 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-xl font-serif font-bold text-primary">{day.day}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-text">Day {day.day}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-text/60 bg-background px-4 py-2 rounded-lg border border-text/5 text-sm">
                    <Navigation className="w-4 h-4" />
                    <span>{day.transport_mode}</span>
                  </div>
                  {day.macros?.vibe && (
                    <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 text-sm font-medium">
                      <Activity className="w-4 h-4" />
                      <span>{day.macros.vibe}</span>
                    </div>
                  )}
                </div>
              </div>

              {day.macros && (
                <div className="px-8 py-4 bg-background/50 border-b border-text/5 flex flex-wrap gap-6">
                  {day.macros.totalDistance && (
                    <div className="flex items-center gap-2 text-sm text-text/60">
                      <MapIcon className="w-4 h-4 text-primary/70" />
                      <span>Distance: {day.macros.totalDistance}</span>
                    </div>
                  )}
                  {day.macros.estimatedCost && (
                    <div className="flex items-center gap-2 text-sm text-text/60">
                      <IndianRupee className="w-4 h-4 text-primary/70" />
                      <span>Est. Cost: {day.macros.estimatedCost}</span>
                    </div>
                  )}
                  {day.macros.weatherForecast && (
                    <div className="flex items-center gap-2 text-sm text-text/60">
                      <CloudSun className="w-4 h-4 text-primary/70" />
                      <span>Weather: {day.macros.weatherForecast}</span>
                    </div>
                  )}
                  {day.macros.bestTimeToStart && (
                    <div className="flex items-center gap-2 text-sm text-text/60">
                      <Sun className="w-4 h-4 text-primary/70" />
                      <span>Start: {day.macros.bestTimeToStart}</span>
                    </div>
                  )}
                  {day.macros.packingTips && (
                    <div className="flex flex-col gap-3 w-full bg-primary/5 p-4 rounded-2xl border border-primary/10 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                          <Briefcase className="w-4 h-4" />
                          <span>Packing Strategy</span>
                        </div>
                        {onUpdate && (
                          <button
                            onClick={() => handleRegenerateTips(index)}
                            disabled={generatingTips[index]}
                            className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 hover:bg-primary/20 rounded-full transition-all text-[10px] font-bold text-primary uppercase"
                            title="Regenerate specific tips"
                          >
                            <RefreshCw className={`w-3 h-3 ${generatingTips[index] ? 'animate-spin' : ''}`} />
                            {generatingTips[index] ? 'Updating...' : 'Refresh'}
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-text/80 leading-relaxed italic">
                        "{day.macros.packingTips}"
                      </p>
                    </div>
                  )}
                  {day.macros.localCustoms && (
                    <div className="flex items-center gap-2 text-sm text-text/60 w-full">
                      <Globe className="w-4 h-4 text-primary/70 shrink-0" />
                      <span>Customs: {day.macros.localCustoms}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-8 space-y-8">
                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[1.35rem] before:w-px before:bg-text/10">
                  {day.places.map((place, pIndex) => (
                    <div key={pIndex} className="relative pl-14">
                      <div className="absolute left-4 top-6 w-3 h-3 rounded-full bg-primary ring-4 ring-surface" />
                      <div className="bg-background rounded-2xl p-6 border border-text/5 hover:border-text/10 transition-colors">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-text flex items-center gap-2 mb-1">
                              <MapPin className="w-5 h-5 text-primary" />
                              {place.name}
                            </h4>
                            {place.type && (
                              <span className="text-xs font-medium text-text/40 uppercase tracking-wider">
                                {place.type}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {place.price && (
                              <span className="flex items-center gap-1 text-sm font-medium text-text/80 bg-surface-light px-3 py-1.5 rounded-lg border border-text/5">
                                <IndianRupee className="w-3.5 h-3.5" />
                                {place.price}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5 text-sm font-medium text-text/80 bg-surface-light px-3 py-1.5 rounded-lg border border-text/5">
                              <Clock className="w-3.5 h-3.5" />
                              {place.time_required}
                            </span>
                            {onUpdate && (
                              <button 
                                onClick={() => handleRemovePlace(place)}
                                className="text-text/40 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-text/5"
                                title="Remove from itinerary"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-text/70 leading-relaxed mb-4 font-light">{place.description}</p>
                        
                        {place.address && (
                          <p className="text-sm text-text/40 mb-4 flex items-start gap-2">
                            <Navigation className="w-4 h-4 shrink-0 mt-0.5" />
                            {place.address}
                          </p>
                        )}

                        {place.bookingLink && (
                          <a 
                            href={place.bookingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 mt-4 bg-surface-light hover:bg-text/5 text-text border border-text/10 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                          >
                            Book Tickets / Reserve <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <div className="mt-4 pt-4 border-t border-text/5">
                          <button
                            onClick={() => toggleMoreInfo(place, index, pIndex)}
                            disabled={loadingDetails[`${index}-${pIndex}`]}
                            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                          >
                            {loadingDetails[`${index}-${pIndex}`] ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                Fetching details...
                              </span>
                            ) : placeDetails[`${index}-${pIndex}`] ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Hide Info
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                More Info
                              </>
                            )}
                          </button>

                          <AnimatePresence>
                            {placeDetails[`${index}-${pIndex}`] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 space-y-4 bg-surface-light/50 p-4 rounded-xl border border-text/5">
                                  {placeDetails[`${index}-${pIndex}`].photoUrl && (
                                    <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
                                      <img 
                                        src={placeDetails[`${index}-${pIndex}`].photoUrl} 
                                        alt={place.name} 
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  )}
                                  <div className="flex items-start gap-3">
                                    <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <h5 className="text-sm font-bold text-text mb-1">Opening Hours</h5>
                                      <p className="text-sm text-text/70 whitespace-pre-line">{placeDetails[`${index}-${pIndex}`].openingHours}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <Star className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <h5 className="text-sm font-bold text-text mb-1">User Reviews</h5>
                                      <p className="text-sm text-text/70 whitespace-pre-line">{placeDetails[`${index}-${pIndex}`].userReviews}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <h5 className="text-sm font-bold text-text mb-1">Contact Info</h5>
                                      <p className="text-sm text-text/70 whitespace-pre-line">{placeDetails[`${index}-${pIndex}`].contactInfo}</p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-8 border-t border-text/5">
                  <div className="flex items-start gap-4 bg-surface-light p-6 rounded-2xl border border-text/5">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <Utensils className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-bold text-text mb-2">Dining Suggestion</h5>
                      <p className="text-text/60 text-sm leading-relaxed">{day.food}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-surface-light p-6 rounded-2xl border border-text/5">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <Bed className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-bold text-text mb-2">Accommodation</h5>
                      <p className="text-text/60 text-sm leading-relaxed">{day.hotel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
