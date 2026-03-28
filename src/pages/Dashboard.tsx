import { useState, useEffect } from "react";
import { SavedItineraries } from "../components/SavedItineraries";
import { ItineraryDisplay } from "../components/ItineraryDisplay";
import { MapDisplay } from "../components/MapDisplay";
import { Itinerary } from "../types";
import { auth } from "../firebase";
import { User as UserIcon, Settings, Save, X, TrendingUp, DollarSign } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function Dashboard() {
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [user, setUser] = useState(auth.currentUser);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDisplayName(currentUser.displayName || "");
        setPhotoURL(currentUser.photoURL || "");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    setIsUpdating(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim() || null,
        photoURL: photoURL.trim() || null,
      });
      setUser({ ...auth.currentUser }); // Trigger re-render
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center">
        <UserIcon className="w-16 h-16 text-text/20 mb-6" />
        <h2 className="text-3xl font-serif font-bold text-text mb-4">Traveler's Dashboard</h2>
        <p className="text-text/60 text-center max-w-md">
          Please sign in to view your saved itineraries and manage your travel plans.
        </p>
      </div>
    );
  }

  const mockSpendingData = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 12000 },
    { month: 'Mar', amount: 78000 },
    { month: 'Apr', amount: 34000 },
    { month: 'May', amount: 92000 },
    { month: 'Jun', amount: 21000 },
  ];

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-surface/50 border border-text/10 rounded-[2rem] p-8 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-6">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full border-2 border-primary/50 object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center border-2 border-primary/50">
                <UserIcon className="w-10 h-10 text-text/50" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-serif font-bold text-text mb-2">Welcome back, {user.displayName || user.email?.split('@')[0]}</h1>
              <p className="text-text/60">Manage your upcoming journeys and past adventures.</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-light border border-text/10 rounded-xl text-sm font-medium hover:bg-text/5 transition-colors"
          >
            {isEditingProfile ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            {isEditingProfile ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {isEditingProfile && (
          <div className="mt-6 bg-surface/80 border border-text/10 rounded-2xl p-6 shadow-lg backdrop-blur-md max-w-2xl">
            <h3 className="text-xl font-bold text-text mb-4">Profile Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text/80 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-background border border-text/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text/80 mb-1">Profile Photo URL</label>
                <input 
                  type="url" 
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-background border border-text/10 rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 text-text"
                />
              </div>
              <button 
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="flex items-center gap-2 bg-primary text-surface px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* Spending History & Analysis */}
        <div className="mt-12 bg-surface/50 border border-text/10 rounded-[2rem] p-8 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-serif font-bold text-text">Spending History & Analysis</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-background p-6 rounded-2xl border border-text/5">
              <div className="flex items-center gap-2 text-text/60 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Total Spent (YTD)</span>
              </div>
              <div className="text-3xl font-bold text-text">₹2,82,000</div>
              <div className="text-sm text-green-500 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12% from last year
              </div>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-text/5">
              <div className="flex items-center gap-2 text-text/60 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Average Trip Cost</span>
              </div>
              <div className="text-3xl font-bold text-text">₹47,000</div>
              <div className="text-sm text-text/40 mt-2">Based on 6 trips</div>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-text/5">
              <div className="flex items-center gap-2 text-text/60 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Most Expensive Month</span>
              </div>
              <div className="text-3xl font-bold text-text">May</div>
              <div className="text-sm text-text/40 mt-2">₹92,000 spent</div>
            </div>
          </div>

          <div className="h-72 w-full mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)' }} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
                />
                <Bar dataKey="amount" fill="#ffffff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <SavedItineraries onSelect={setSelectedItinerary} />

      {selectedItinerary && (
        <div id="itinerary-display" className="mt-12">
          <ItineraryDisplay itinerary={selectedItinerary} onUpdate={setSelectedItinerary} />
          <MapDisplay itinerary={selectedItinerary} onUpdate={setSelectedItinerary} />
        </div>
      )}
    </div>
  );
}
