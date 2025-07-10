import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth } from '../firebase/auth';

function CurriculumDisplay() {
  const { id } = useParams();
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError("Please log in to view curriculums");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/get-user-curriculums/${currentUser.uid}/`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch curriculums');
        }

        const data = await response.json();
        if (data.status === 'success') {
          setCurriculums(data.curriculums);
        } else {
          throw new Error(data.message || 'Failed to fetch curriculums');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculums();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-indigo-600">Loading curriculums...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white py-6 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-indigo-500 text-xl font-bold">
            Curriculum Display
          </Link>
          <Link
            to="/curriculum/custom"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create New Curriculum
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curriculums.map((curriculum) => (
            <div
              key={curriculum.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-indigo-600 mb-2">
                {curriculum.degree}
              </h3>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Subject:</span> {curriculum.subject}
              </p>
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-1">Topics:</h4>
                <p className="text-gray-600">{curriculum.topics}</p>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-2">Generated Content:</h4>
                <pre className="whitespace-pre-wrap text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {typeof curriculum.generated_content === 'string' ? curriculum.generated_content : JSON.stringify(curriculum.generated_content)}
                </pre>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Created: {new Date(curriculum.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {curriculums.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No curriculums found.</p>
            <Link
              to="/curriculum/form"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Create Your First Curriculum
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default CurriculumDisplay;
