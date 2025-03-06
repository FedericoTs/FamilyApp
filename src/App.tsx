import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import Sidebar from "./components/Sidebar";
import MapHeader from "./components/MapHeader";

// Lazy load pages for better performance
const Discover = lazy(() => import("./pages/Discover"));
const Community = lazy(() => import("./pages/Community"));
const Family = lazy(() => import("./pages/Family"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      }
    >
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/discover"
            element={
              <AppLayout>
                <Discover />
              </AppLayout>
            }
          />
          <Route
            path="/community"
            element={
              <AppLayout>
                <Community />
              </AppLayout>
            }
          />
          <Route
            path="/family"
            element={
              <AppLayout>
                <Family />
              </AppLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <AppLayout>
                <Settings />
              </AppLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <AppLayout>
                <Profile />
              </AppLayout>
            }
          />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar with nearbyOpen set to false for non-map pages */}
      <Sidebar nearbyOpen={false} />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <MapHeader />

        <main className="flex-1 relative overflow-auto bg-gray-50 p-6">
          {children}
        </main>

        <footer className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center py-2 text-xs">
          <p>© 2025 FamilyApp - Find family-friendly places near you</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
