import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase.js";
import { signOut } from "firebase/auth";
import {
  FaBars,
  FaHome,
  FaBook,
  FaFileAlt,
  FaFolder,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaPlusSquare,
} from "react-icons/fa";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-blue-600 text-white shadow-lg transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300">
          {/* Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-blue-700">
            <h2 className="text-lg font-bold">Smart Teaching Scheduler</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white text-xl focus:outline-none hover:text-blue-300 transition"
              aria-label="Close sidebar"
            >
              ✖
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex flex-col mt-5 space-y-3 px-3">
            <SidebarLink to="/dashboard" icon={<FaHome />} label="Dashboard" />
            <SidebarLink to="/quiz" icon={<FaBook />} label="Assessment & Quiz Generator" />
            <SidebarLink to="/lesson-plan" icon={<FaFileAlt />} label="Lesson Plan" />
            <SidebarLink to="/file-manager" icon={<FaFolder />} label="File Manager" />

            {/* Curriculum Generator Section */}
            <div className="border-t border-blue-700 my-4"></div>
            <span className="px-3 text-sm text-blue-200 block uppercase tracking-wide font-semibold">Curriculum Generator</span>
            <SidebarLink to="/curriculum/custom" icon={<FaPlusSquare />} label="Custom Curriculum" />
            <SidebarLink to="/curriculum/standards" icon={<FaPlusSquare />} label="By Standards" />

            {/* Profile and Settings */}
            <div className="border-t border-blue-700 my-4"></div>
            <SidebarLink to="/profile" icon={<FaUser />} label="Profile" />
            <SidebarLink to="/settings" icon={<FaCog />} label="Settings" />
          </nav>

          {/* Sign Out Button */}
          <div className="mt-auto mb-6 px-4">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 text-white hover:bg-blue-700 p-3 rounded-md w-full transition"
              aria-label="Sign out"
            >
              <FaSignOutAlt className="text-lg" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <nav className="bg-white shadow-lg px-6 py-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-4 focus:outline-none text-blue-600 hover:text-blue-800 transition"
            aria-label="Open sidebar"
          >
            <FaBars className="text-2xl" />
          </button>

          <h2 className="text-indigo-600 text-lg font-semibold">Dashboard</h2>
        </nav>

        <main className="p-6">
          <h2 className="text-2xl font-semibold text-indigo-600">Welcome back!</h2>
          <p className="mt-1 text-sm text-gray-600">
            Here's an overview of your teaching schedule and tasks.
          </p>

          {/* Stats Section */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Classes Today" value="4" />
            <StatCard title="Total Students" value="120" />
            <StatCard title="Pending Tasks" value="7" />
            <StatCard title="Resources" value="25" />
          </div>
        </main>
      </div>
    </div>
  );
};

// Sidebar Link Component
const SidebarLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center space-x-2 text-white hover:bg-blue-700 p-3 rounded-md"
  >
    <span className="text-lg">{icon}</span>
    <span className="text-base">{label}</span>
  </Link>
);

// Stat Card Component
const StatCard = ({ title, value }) => (
  <div className="bg-white shadow rounded-lg p-5 flex items-center">
    <div className="ml-5">
      <dt className="text-sm font-medium text-indigo-500 truncate">{title}</dt>
      <dd className="text-2xl font-semibold text-gray-600">{value}</dd>
    </div>
  </div>
);

export default Dashboard;