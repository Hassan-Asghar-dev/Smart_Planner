import React from "react";
import { Link } from "react-router-dom";
import { FaChalkboardTeacher, FaCalendarAlt, FaTasks, FaChartLine } from "react-icons/fa";

const HomePage = () => {
  return (
    <>
      <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <FaChalkboardTeacher className="text-indigo-600 text-3xl" />
                <span className="ml-3 text-2xl font-extrabold tracking-tight text-indigo-700">
                  Smart Teaching Planner
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md text-sm font-semibold transition"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-grow max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-20 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            <span className="block text-indigo-600 mb-1">Welcome to</span>
            <span className="block text-indigo-700">Smart Teaching Planner</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-sm text-gray-700 sm:text-base">
            Streamline your teaching workflow with our comprehensive planning tool. Manage your classes, schedule lessons, and track progress - all in one place.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md shadow-md hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-2 border border-indigo-600 text-indigo-600 text-sm font-semibold rounded-md hover:bg-indigo-50 transition"
            >
              Sign In
            </Link>
          </div>
        </main>

        {/* Features Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                <FaCalendarAlt className="text-indigo-600 text-5xl mb-4" />
                <h3 className="text-xl font-semibold mb-2">Efficient Scheduling</h3>
                <p className="text-gray-600 max-w-xs">
                  Easily plan and organize your lessons with our intuitive scheduling tools.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                <FaTasks className="text-indigo-600 text-5xl mb-4" />
                <h3 className="text-xl font-semibold mb-2">Task Management</h3>
                <p className="text-gray-600 max-w-xs">
                  Keep track of assignments, grading, and student progress all in one place.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
                <FaChartLine className="text-indigo-600 text-5xl mb-4" />
                <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                <p className="text-gray-600 max-w-xs">
                  Monitor student performance and adjust your teaching strategies effectively.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-indigo-600 text-white py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center text-sm">
            &copy; {new Date().getFullYear()} Smart Teaching Planner. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
