import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Chatbot } from "./components/Chatbot";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { CommunityFeed } from "./pages/CommunityFeed";
import { Toaster } from "sonner";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans text-text selection:bg-accent/30 relative pb-20 md:pb-0">
        <Toaster position="top-center" theme="dark" />
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/community" element={<CommunityFeed />} />
        </Routes>

        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}

