/// <reference types="@types/google.maps" />
import { Itinerary, Place } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { APIProvider, Map, AdvancedMarker, useMap, InfoWindow, ControlPosition, MapControl } from "@vis.gl/react-google-maps";
import { useState, useEffect, useCallback, useRef } from "react";
import { Clock, IndianRupee, Navigation, Trash2, Route, Maximize, Target, Filter, Search as SearchIcon, X } from "lucide-react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBoW3Y5kJu5x_YWuud7okWMwqbiyOaSyTo";

function MapPolyline({ positions }: { positions: google.maps.LatLngLiteral[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const lineSymbol = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 3,
      strokeColor: "#0284C7",
    };

    const polyline = new google.maps.Polyline({
      path: positions,
      geodesic: true,
      strokeColor: "#0284C7", // Ocean Blue
      strokeOpacity: 0.8,
      strokeWeight: 4,
      icons: [
        {
          icon: lineSymbol,
          offset: "100%",
          repeat: "100px",
        },
      ],
    });

    polyline.setMap(map);

    return () => {
      polyline.setMap(null);
    };
  }, [map, positions]);

  return null;
}

function MapInstanceHandler({ onMapLoad }: { onMapLoad: (map: google.maps.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (map) onMapLoad(map);
  }, [map, onMapLoad]);
  return null;
}

interface MapDisplayProps {
  itinerary: Itinerary | null;
  onUpdate?: (itinerary: Itinerary) => void;
}

export function MapDisplay({ itinerary, onUpdate }: MapDisplayProps) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<google.maps.Map | null>(null);

  const allPlaces = itinerary?.days.flatMap((day) => day.places) || [];
  
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleFitBounds = useCallback(() => {
    if (!mapRef.current || allPlaces.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    allPlaces.forEach(place => bounds.extend({ lat: place.lat, lng: place.lng }));
    mapRef.current.fitBounds(bounds);
  }, [allPlaces]);

  const handleCenterOnPlace = useCallback((place: Place) => {
    if (!mapRef.current) return;
    mapRef.current.panTo({ lat: place.lat, lng: place.lng });
    mapRef.current.setZoom(15);
    setSelectedPlace(place);
  }, []);

  if (!itinerary || allPlaces.length === 0) return null;

  const center = { lat: allPlaces[0].lat, lng: allPlaces[0].lng };
  const polylinePositions = allPlaces.map(place => ({ lat: place.lat, lng: place.lng }));

  const filteredPlaces = allPlaces.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    setSelectedPlace(null);
  };

  const handleOptimizeRoute = () => {
    if (!onUpdate) return;

    const calculateDistance = (p1: Place, p2: Place) => {
      const dx = p1.lng - p2.lng;
      const dy = p1.lat - p2.lat;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const optimizedDays = itinerary.days.map(day => {
      if (day.places.length <= 2) return day;

      const places = [...day.places];
      const optimized: Place[] = [places.shift()!]; // Start with the first place

      while (places.length > 0) {
        const last = optimized[optimized.length - 1];
        let nearestIdx = 0;
        let minDist = calculateDistance(last, places[0]);

        for (let i = 1; i < places.length; i++) {
          const d = calculateDistance(last, places[i]);
          if (d < minDist) {
            minDist = d;
            nearestIdx = i;
          }
        }

        optimized.push(places.splice(nearestIdx, 1)[0]);
      }

      return { ...day, places: optimized };
    });

    onUpdate({ ...itinerary, days: optimizedDays });
  };

  return (
    <section className="py-24 bg-background relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-serif font-bold text-text mb-4">Interactive Explorer</h2>
          <p className="text-text/60 mb-8 max-w-2xl mx-auto">Visualize your journey across {itinerary.destination}. Click markers to view details, search specific spots, or optimize your route.</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {onUpdate && (
              <button
                onClick={handleOptimizeRoute}
                className="inline-flex items-center gap-2 bg-primary text-surface px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20"
              >
                <Route className="w-5 h-5" />
                Optimize Route
              </button>
            )}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40" />
              <input 
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface border border-text/10 rounded-xl pl-11 pr-4 py-3 text-sm text-text focus:outline-none focus:border-primary/50 w-64"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar List */}
          <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text/40 mb-4">Itinerary Stops</h3>
            {filteredPlaces.map((place, idx) => (
              <motion.button
                key={`${place.name}-${idx}`}
                whileHover={{ x: 4 }}
                onClick={() => handleCenterOnPlace(place)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedPlace?.name === place.name 
                    ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/5" 
                    : "bg-surface border-text/5 hover:border-text/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-surface text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text leading-tight mb-1">{place.name}</h4>
                    <p className="text-[10px] text-text/50 uppercase tracking-wider font-medium">{place.type}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Map Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-3 h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-text/10 relative"
          >
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
              <Map
                defaultZoom={11}
                defaultCenter={center}
                mapId="DEMO_MAP_ID"
                gestureHandling={'greedy'}
                disableDefaultUI={true}
              >
                <MapInstanceHandler onMapLoad={handleMapLoad} />
                <MapPolyline positions={polylinePositions} />

                {filteredPlaces.map((place, index) => (
                  <AdvancedMarker
                    key={`${place.name}-${index}`}
                    position={{ lat: place.lat, lng: place.lng }}
                    onClick={() => setSelectedPlace(place)}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.2 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 shadow-xl text-sm cursor-pointer transition-all ${
                        selectedPlace?.name === place.name 
                          ? "bg-white text-primary border-primary scale-125 z-50" 
                          : "bg-primary text-surface border-surface"
                      }`}
                    >
                      {index + 1}
                    </motion.div>
                  </AdvancedMarker>
                ))}

                {selectedPlace && (
                  <InfoWindow
                    position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                    onCloseClick={() => setSelectedPlace(null)}
                  >
                    <div className="p-2 max-w-[240px] bg-white text-slate-900">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-sm leading-tight pr-4">
                          {selectedPlace.name}
                        </h3>
                        {onUpdate && (
                          <button 
                            onClick={() => handleRemovePlace(selectedPlace)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                          {selectedPlace.type}
                        </span>
                        <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {selectedPlace.time_required}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-2 line-clamp-3">
                        {selectedPlace.description}
                      </p>
                      {selectedPlace.address && (
                        <p className="text-[9px] text-slate-400 flex items-start gap-1 italic">
                          <Navigation className="w-2.5 h-2.5 shrink-0 mt-0.5" />
                          {selectedPlace.address}
                        </p>
                      )}
                    </div>
                  </InfoWindow>
                )}

                <MapControl position={ControlPosition.TOP_RIGHT}>
                  <div className="flex flex-col gap-2 m-4">
                    <button
                      onClick={handleFitBounds}
                      className="p-3 bg-surface border border-text/10 rounded-xl shadow-xl text-text hover:bg-surface-light transition-all"
                      title="Fit all stops"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (allPlaces.length > 0) {
                          handleCenterOnPlace(allPlaces[0]);
                        }
                      }}
                      className="p-3 bg-surface border border-text/10 rounded-xl shadow-xl text-text hover:bg-surface-light transition-all"
                      title="Center on start"
                    >
                      <Target className="w-5 h-5" />
                    </button>
                  </div>
                </MapControl>
              </Map>
            </APIProvider>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
