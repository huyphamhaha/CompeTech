import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import StudentManagement from "./components/StudentManagement.jsx";
import RulesManagement from "./components/RulesManagement.jsx";
import StudentPointsManagement from "./components/StudentPointsManagement.jsx";
import StudentDetail from "./components/StudentDetail.jsx";
import EvidenceManagement from "./components/EvidenceManagement.jsx";
import Navigation from "./components/Navigation.jsx";
import EventManagement from "./components/EventManagement.jsx";
import EventApprovals from "./components/EventApprovals.jsx";
import Login from "./components/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UserInfoPanel from "./components/UserInfoPanel.jsx";
import "./App.css";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="App">
      <Navigation />
      <div className="pt-16">
        <UserInfoPanel />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute requiredRole="teacher">
                <StudentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rules"
            element={
              <ProtectedRoute requiredRole="admin">
                <RulesManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/points"
            element={
              <ProtectedRoute requiredRole="teacher">
                <StudentPointsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evidence"
            element={
              <ProtectedRoute requiredRole="admin">
                <EvidenceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute requiredRole="admin">
                <EventManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <ProtectedRoute requiredRole="admin">
                <EventApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/:studentId"
            element={
              <ProtectedRoute requiredRole="teacher">
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
