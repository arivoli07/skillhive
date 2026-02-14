import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Explore from "./pages/Explore.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ClientFreelancers from "./pages/ClientFreelancers.jsx";
import ClientProjects from "./pages/ClientProjects.jsx";
import FreelancerDashboard from "./pages/FreelancerDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import Requests from "./pages/Requests.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const RequireAuth = ({ children, role }) => {
  const { auth } = useAuth();
  if (!auth) return children;
  if (role && auth.role !== role) return children;
  return children;
};

const App = () => {
  const { auth } = useAuth();
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            auth
              ? auth.role === "CLIENT"
                ? <Navigate to="/client/freelancers" replace />
                : <Navigate to="/freelancer" replace />
              : <Home />
          }
        />
        <Route path="/explore" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/client"
          element={<Navigate to="/client/freelancers" replace />}
        />
        <Route
          path="/client/freelancers"
          element={
            <RequireAuth role="CLIENT">
              <ClientFreelancers />
            </RequireAuth>
          }
        />
        <Route
          path="/client/projects"
          element={
            <RequireAuth role="CLIENT">
              <ClientProjects />
            </RequireAuth>
          }
        />
        <Route
          path="/freelancer"
          element={
            <RequireAuth role="FREELANCER">
              <FreelancerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/requests"
          element={
            <RequireAuth role="FREELANCER">
              <Requests />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
