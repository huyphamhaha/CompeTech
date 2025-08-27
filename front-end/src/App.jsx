import { Routes, Route } from "react-router-dom";
import Register from "./components/Signpage/register.jsx";
import Login from "./components/Signpage/login.jsx";
import Profile from "./components/Signpage/profile.jsx";
import ForgotPasswordModal from "./components/Signpage/forgotPasswordModal.jsx";
import Home from "./components/Homepage/home.jsx";
import QuesticAdmissionAdvisor from "./components/Career/career.jsx";
import InterviewApp from "./components/pv/interviewai.jsx";
import QuesticHobbyAdvisor from "./components/Career/hobby.jsx";
import "./App.css";
import TestResultDetail from "./components/Signpage/TestResultDetail.jsx";
import Chatbot from "./components/chatbot/Chatbot.jsx";
import EvaluateCV from "./components/cv/EvaluateCV.jsx";
import UniversityPage from "./components/university/UniversityPage.jsx";
import ListJob from "./components/university/list_job/ListJob.jsx";
import ListUniversity from "./components/university/list_university/ListUniversity.jsx";
import MajorPage from "./components/major/major.jsx";
import AuthTestComponent from "./components/AuthTestComponent.jsx";
import TokenDebugger from "./components/TokenDebugger.jsx";
import ServiceStatusPanel from "./components/ServiceStatusPanel.jsx";
import Contact from "./components/contact/contact.jsx";
import ProGuard from "./components/ProGuard.jsx";
import RulesView from "./components/rules/RulesView.jsx";
import StudentPoints from "./components/points/StudentPoints.jsx";
import MinhChung from "./components/minhchung/MinhChung.jsx";
import RulesPDF from "./components/points/RulesPDF.jsx";
import Bloglist from "./components/forum/bloglist.jsx";
import BlogView from "./components/forum/show.jsx";
import CreateBlog from "./components/forum/create.jsx";
import BlogEdit from "./components/forum/edit.jsx";
import MyPost from "./components/forum/mypost.jsx";
import Events from "./components/events/Events.jsx";
import AIAnalysis from "./components/AIAnalysis/AIAnalysis.jsx";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpass" element={<ForgotPasswordModal />} />
        <Route
          path="/profile"
          element={
            <ProGuard>
              <Profile />
            </ProGuard>
          }
        />
        <Route
          path="/career"
          element={
            <ProGuard>
              <QuesticAdmissionAdvisor />
            </ProGuard>
          }
        />
        <Route
          path="/hobby"
          element={
            <ProGuard>
              <QuesticHobbyAdvisor />
            </ProGuard>
          }
        />
        <Route
          path="/interview"
          element={
            <ProGuard>
              <InterviewApp />
            </ProGuard>
          }
        />
        <Route
          path="/test-result/:testId"
          element={
            <ProGuard>
              <TestResultDetail />
            </ProGuard>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProGuard>
              <Chatbot />
            </ProGuard>
          }
        />
        <Route
          path="/evaluatecv"
          element={
            <ProGuard>
              <EvaluateCV />
            </ProGuard>
          }
        />
        <Route
          path="/university"
          element={
            <ProGuard>
              <UniversityPage />
            </ProGuard>
          }
        />
        <Route
          path="/university/list_job"
          element={
            <ProGuard>
              <ListJob />
            </ProGuard>
          }
        />
        <Route
          path="/major"
          element={
            <ProGuard>
              <MajorPage />
            </ProGuard>
          }
        />
        <Route
          path="/major/:majorSlug"
          element={
            <ProGuard>
              <MajorPage />
            </ProGuard>
          }
        />
        <Route
          path="/university/list_university"
          element={
            <ProGuard>
              <ListUniversity />
            </ProGuard>
          }
        />
        <Route
          path="/test-auth"
          element={
            <ProGuard>
              <AuthTestComponent />
            </ProGuard>
          }
        />
        <Route
          path="/debug-token"
          element={
            <ProGuard>
              <TokenDebugger />
            </ProGuard>
          }
        />
        <Route
          path="/service-status"
          element={
            <ProGuard>
              <ServiceStatusPanel />
            </ProGuard>
          }
        />
        <Route
          path="/contact"
          element={
            <ProGuard>
              <Contact />
            </ProGuard>
          }
        />
        <Route
          path="/rules"
          element={
            <ProGuard>
              <RulesView />
            </ProGuard>
          }
        />
        <Route
          path="/points"
          element={
            <ProGuard>
              <StudentPoints />
            </ProGuard>
          }
        />
        <Route
          path="/points/rules-pdf"
          element={
            <ProGuard>
              <RulesPDF />
            </ProGuard>
          }
        />
        <Route
          path="/minhchung"
          element={
            <ProGuard>
              <MinhChung />
            </ProGuard>
          }
        />

        <Route
          path="/blog"
          element={
            <ProGuard>
              <Bloglist />
            </ProGuard>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <ProGuard>
              <BlogView />
            </ProGuard>
          }
        />
        <Route
          path="/blogcreate"
          element={
            <ProGuard>
              <CreateBlog />
            </ProGuard>
          }
        />
        <Route
          path="/blog/edit/:id"
          element={
            <ProGuard>
              <BlogEdit />
            </ProGuard>
          }
        />
        <Route
          path="/mypost"
          element={
            <ProGuard>
              <MyPost />
            </ProGuard>
          }
        />

        <Route
          path="/activity"
          element={
            <ProGuard>
              <Events />
            </ProGuard>
          }
        />
        <Route
          path="/ai-analysis"
          element={
            <ProGuard>
              <AIAnalysis />
            </ProGuard>
          }
        />

        {/** Admin approval lives in admin/ccpad app, no route here */}

        <Route
          path="/"
          element={
            <ProGuard>
              <Home />
            </ProGuard>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
