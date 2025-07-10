import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/login";
import Profile from "./Pages/profile";
import SignUp from "./Pages/Signup";
import HomePage from "./Pages/homepage";
import CurriculumForm from "./Pages/CurriculumForm";
import StandardsForm from "./Pages/StandardsForm";
import CurriculumDisplay from "./Pages/CurriculumDisplay";
import CurriculumPreview from "./Pages/Curriculumpreview";
import LessonPlan from "./Pages/LessonPlan";
import QuizGenerator from "./Pages/QuizGenerator";
import FileManager from './Pages/FileManager';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/curriculum/custom" element={<CurriculumForm />} />
      <Route path="/curriculum/standards" element={<StandardsForm />} />
      <Route path="/curriculum/display" element={<CurriculumDisplay />} />
      <Route path="/curriculum/preview/:id" element={<CurriculumPreview />} />
      <Route path="/lesson-plan" element={<LessonPlan />} />
      <Route path="/quiz" element={<QuizGenerator />} />
      <Route path="/file-manager" element={<FileManager />} />
    </Routes>
  );
}

export default App;