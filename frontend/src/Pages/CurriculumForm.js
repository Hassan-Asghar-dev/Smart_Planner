
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner, FaBook, FaDownload, FaEye } from 'react-icons/fa';

function CurriculumForm() {
  const authContext = useAuth();
  const [degree, setDegree] = useState('');
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState('');
  const [error, setError] = useState('');
  const [generatedCurriculum, setGeneratedCurriculum] = useState('');
  const [curriculumId, setCurriculumId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false); // Added for loading state
  const navigate = useNavigate();

  // Check for auth context
  if (!authContext) {
    return (
      <div className="text-red-500 text-center mt-10 font-semibold" role="alert">
        Error: Authentication context not found. Ensure AuthProvider is set up correctly.
      </div>
    );
  }

  const { currentUser, loading } = authContext;

  // Loading state for auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
        <span className="ml-2 text-gray-600">Loading authentication...</span>
      </div>
    );
  }

  const bsDegrees = [
    'BS Computer Science',
    'BS Software Engineering',
    'BS Information Technology',
    'BS Data Science',
    'BS Artificial Intelligence',
    'BS Cybersecurity',
  ];

  const degreeSubjects = {
    'BS Computer Science': [
      'Programming Fundamentals',
      'Data Structures and Algorithms',
      'Operating Systems',
      'Database Systems',
      'Computer Networks',
      'Discrete Mathematics',
      'Calculus',
      'Linear Algebra',
      'Web Development',
      'Mobile Application Development',
      'Artificial Intelligence',
      'Machine Learning',
      'Computer Graphics',
      'Software Engineering Principles',
      'Technical Writing',
      'Communication Skills',
      'Pakistan Studies',
      'Islamic Studies',
    ],
    'BS Software Engineering': [
      'Software Requirements Engineering',
      'Software Design and Architecture',
      'Software Testing and Quality Assurance',
      'Object-Oriented Programming',
      'Database Systems',
      'Web Engineering',
      'Project Management',
      'Mobile Application Development',
      'Cloud Computing',
      'DevOps',
      'Human-Computer Interaction',
      'Software Evolution and Maintenance',
      'Technical Writing',
      'Communication Skills',
      'Pakistan Studies',
      'Islamic Studies',
    ],
    'BS Information Technology': [
      'Network Administration',
      'System Administration',
      'IT Project Management',
      'Database Management',
      'Information Security Fundamentals',
      'Web Development',
      'Operating Systems',
      'Cloud Computing',
      'Cybersecurity',
      'Data Analytics',
      'Enterprise Resource Planning (ERP)',
      'Virtualization Technologies',
      'Business Communication',
      'Professional Ethics',
      'Pakistan Studies',
      'Islamic Studies',
    ],
    'BS Data Science': [
      'Statistics',
      'Probability',
      'Linear Algebra',
      'Calculus',
      'Programming for Data Science (e.g., Python, R)',
      'Data Wrangling and Preprocessing',
      'Data Visualization',
      'Machine Learning Fundamentals',
      'Deep Learning',
      'Natural Language Processing',
      'Big Data Technologies (e.g., Hadoop, Spark)',
      'Time Series Analysis',
      'Data Mining',
      'Technical Writing',
      'Communication Skills',
      'Research Methodology',
      'Professional Development',
    ],
    'BS Artificial Intelligence': [
      'Linear Algebra',
      'Calculus',
      'Probability and Statistics',
      'Programming for AI (e.g., Python)',
      'Data Structures and Algorithms',
      'Machine Learning',
      'Deep Learning',
      'Natural Language Processing',
      'Computer Vision',
      'Robotics',
      'Reinforcement Learning',
      'Knowledge Representation and Reasoning',
      'AI Ethics',
      'Intelligent Agents',
      'Technical Writing',
      'Communication Skills',
      'Philosophy of Mind',
      'Cognitive Science',
    ],
    'BS Cybersecurity': [
      'Network Security',
      'Cryptography',
      'Operating System Security',
      'Database Security',
      'Web Application Security',
      'Digital Forensics',
      'Ethical Hacking',
      'Security Management and Governance',
      'Incident Response and Handling',
      'Malware Analysis',
      'Reverse Engineering',
      'Cloud Security',
      'Mobile Security',
      'Legal and Ethical Issues in Cybersecurity',
      'Risk Management',
      'Technical Writing',
      'Communication Skills',
    ],
  };

  const handleGenerateCurriculum = async () => {
    if (!degree || !subject || !topics) {
      setError('Please fill in all fields!');
      return;
    }

    if (!currentUser) {
      setError('Please log in to generate a curriculum!');
      return;
    }

    setIsGenerating(true);
    const uid = currentUser.uid;

    try {
      const response = await fetch('/api/generate-custom-curriculum/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          degree,
          subject,
          topics,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const curriculumId = data.curriculum.id;
        setGeneratedCurriculum(data.curriculum.generated_content);
        setCurriculumId(curriculumId);
        setError('');
        navigate(`/curriculum/preview/${curriculumId}`, {
          state: { curriculumText: data.curriculum.generated_content },
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate curriculum.');
      }
    } catch (error) {
      setError('Failed to generate curriculum. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCurriculum = () => {
    if (generatedCurriculum) {
      const blob = new Blob([generatedCurriculum], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `custom_curriculum_${degree.replace(/ /g, '_')}_${subject.replace(/ /g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert('Please generate a curriculum first.');
    }
  };

  const handlePreviewCurriculum = () => {
    if (generatedCurriculum && curriculumId) {
      navigate(`/curriculum/preview/${curriculumId}`, {
        state: { curriculumText: generatedCurriculum },
      });
    } else {
      alert('Please generate a curriculum first.');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    handleGenerateCurriculum();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Sticky Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Curriculum Generator
          </Link>
          <Link
            to="/dashboard"
            className="text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="flex-grow container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">
        {/* Form Section */}
        <div className="bg-white p-8 rounded-xl shadow-xl w-full lg:w-2/3 transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
            Generate Custom Curriculum
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Degree Select */}
            <div className="relative">
              <label
                htmlFor="degree"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Degree
              </label>
              <select
                id="degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                aria-required="true"
              >
                <option value="">Select Degree</option>
                {bsDegrees.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Select */}
            <div className="relative">
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject
              </label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                disabled={!degree}
                aria-required="true"
              >
                <option value="">Select Subject</option>
                {degree &&
                  degreeSubjects[degree] &&
                  degreeSubjects[degree].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                {!degree && <option disabled>Select a degree first</option>}
                {degree && !degreeSubjects[degree] && (
                  <option disabled>No subjects available</option>
                )}
              </select>
            </div>

            {/* Topics Input */}
            <div className="relative">
              <label
                htmlFor="topics"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Topics (comma-separated)
              </label>
              <input
                id="topics"
                type="text"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="e.g., Topic 1, Topic 2, Topic 3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                aria-required="true"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center text-red-500 text-sm" role="alert">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-indigo-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!degree || !subject || !topics || isGenerating}
              aria-busy={isGenerating}
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Generate Curriculum'
              )}
            </button>
          </form>

          {/* Generated Curriculum */}
          {generatedCurriculum && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg max-w-full">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Generated Curriculum
              </h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-white p-4 rounded-lg shadow-inner max-h-[400px] overflow-y-auto">
                {generatedCurriculum}
              </pre>
            </div>
          )}
        </div>

        {/* Standards Sidebar */}
        <div className="bg-white p-8 rounded-xl shadow-xl w-full lg:w-1/3 transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center mb-4">
            <FaBook className="text-indigo-600 text-2xl mr-2" />
            <h3 className="text-xl font-semibold text-gray-800">
              Generate by Standards
            </h3>
          </div>
          <p className="text-gray-600 mb-6">
            Create a curriculum based on predefined educational standards for a structured learning path.
          </p>
          <Link
            to="/curriculum/standards"
            className="inline-block bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-800 transition-all duration-200"
          >
            Go to Standards
          </Link>
        </div>
      </div>

      {/* Sticky Action Buttons */}
      {generatedCurriculum && (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4 flex justify-center gap-4">
          <button
            onClick={handleDownloadCurriculum}
            className="flex items-center bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-200"
          >
            <FaDownload className="mr-2" />
            Download
          </button>
          <button
            onClick={handlePreviewCurriculum}
            className="flex items-center bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-800 transition-all duration-200"
          >
            <FaEye className="mr-2" />
            Preview
          </button>
        </div>
      )}
    </div>
  );
}

export default CurriculumForm;