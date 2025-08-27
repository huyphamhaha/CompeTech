import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentManagement from "./components/StudentManagement.jsx";
import RulesManagement from "./components/RulesManagement.jsx";
import StudentPointsManagement from "./components/StudentPointsManagement.jsx";
import StudentDetail from "./components/StudentDetail.jsx";
import EvidenceManagement from "./components/EvidenceManagement.jsx";
import Navigation from "./components/Navigation.jsx";
import EventManagement from "./components/EventManagement.jsx";
import EventApprovals from "./components/EventApprovals.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<StudentManagement />} />
          <Route path="/rules" element={<RulesManagement />} />
          <Route path="/points" element={<StudentPointsManagement />} />
          <Route path="/evidence" element={<EvidenceManagement />} />
          <Route path="/events" element={<EventManagement />} />
          <Route path="/approvals" element={<EventApprovals />} />
          <Route path="/student/:studentId" element={<StudentDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
