import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "./layouts/MainLayout";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FutsalList from "./pages/FutsalList";
import FutsalDetail from "./pages/FutsalDetail";
import AdminCreateFutsal from "./pages/AdminCreateFutsal";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const Home = () => (
  <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
    <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight tracking-tighter">
      PLAY THE <br />
      <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-600 bg-clip-text text-transparent animate-gradient">
        FUTURE
      </span>
    </h1>
    <p className="text-gray-400 text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
      Experience Nepal's most sophisticated booking architecture. <br />
      Glass-tier performance. Millisecond-perfect scheduling.
    </p>
    <div className="flex flex-wrap justify-center gap-6">
      <a
        href="/futsals"
        className="btn-primary text-xl px-12 py-5 shadow-[0_0_50px_rgba(59,130,246,0.5)] active:scale-95 transition-all"
      >
        START EXPLORING
      </a>
      <a
        href="/signup"
        className="glass px-12 py-5 text-xl font-bold hover:bg-white/20 transition-all border-white/10 group"
      >
        BECOME A PRO{" "}
        <span className="inline-block group-hover:translate-x-2 transition-transform ml-2">
          →
        </span>
      </a>
    </div>

    <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
      {[
        {
          title: "PRO ANALYTICS",
          desc: "Every booking trackable. Monthly revenue insights for owners.",
          icon: "📊",
        },
        {
          title: "ULTRA FILTERING",
          desc: "Find your pitch by budget, city, or facilities in real-time.",
          icon: "🔍",
        },
        {
          title: "SECURE FLOW",
          desc: "JWT-protected sessions with industrial-grade encryption.",
          icon: "🔒",
        },
      ].map((feature, idx) => (
        <div
          key={idx}
          className="glass p-10 hover:border-primary/50 transition-all duration-500 group relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 opacity-5 text-8xl group-hover:opacity-10 transition-opacity">
            {feature.icon}
          </div>
          <div className="text-4xl mb-6">{feature.icon}</div>
          <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">
            {feature.title}
          </h3>
          <p className="text-gray-500 leading-relaxed font-medium group-hover:text-gray-300 transition-colors">
            {feature.desc}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(30, 41, 59, 0.8)",
            color: "#fff",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="futsals" element={<FutsalList />} />
            <Route path="futsals/:id" element={<FutsalDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />

            {/* User Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Owner Routes */}
            <Route
              path="owner/dashboard"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="owner/create-futsal"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <AdminCreateFutsal />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/create-futsal"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminCreateFutsal />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
