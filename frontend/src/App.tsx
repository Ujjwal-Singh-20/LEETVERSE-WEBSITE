import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BracketBuddy } from './components/mascot/BracketBuddy';
import { TriangleMeshBackground } from './components/background/TriangleMeshBackground';
import { Home } from './pages/Home';
import { Members } from './pages/Members';
import { BusinessCard } from './pages/BusinessCard';
import { Projects } from './pages/Projects';
import { Gallery } from './pages/Gallery';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <TriangleMeshBackground />}
      {!isAdmin && <Navbar />}
      {!isAdmin && <BracketBuddy />}

      <main style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/u/:username" element={<BusinessCard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route
            path="/admin/*"
            element={
              <AuthProvider>
                <AdminDashboard />
              </AuthProvider>
            }
          />
          {/* Catch-all 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isAdmin && <Footer />}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
