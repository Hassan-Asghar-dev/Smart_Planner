import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

function CurriculumPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const curriculumText = location.state?.curriculumText || 'No curriculum to preview.';

  const handleDownload = () => {
    const blob = new Blob([curriculumText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'curriculum.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white py-6 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <span className="ml-2">Back</span> {/* Removed icon until Font Awesome is added */}
            </button>
            <h1 className="text-xl font-bold text-indigo-600">Curriculum Preview</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <span className="mr-2">Download</span> {/* Removed icon until Font Awesome is added */}
            </button>
            <Link
              to="/curriculum/display"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
            >
              <span className="mr-2">View All Curriculums</span> {/* Removed icon until Font Awesome is added */}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {curriculumText === 'No curriculum to preview.' ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">{curriculumText}</p>
              <Link
                to="/curriculum/form"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create New Curriculum
              </Link>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Generated Curriculum:</h3>
              <div className="bg-gray-50 rounded-md p-6 border border-gray-200">
                {curriculumText.split('\n').map((line, index) => (
                  line.trim() ? (
                    <p
                      key={index}
                      className={`mb-2 ${
                        line.trim().endsWith(':') ? 'font-semibold text-indigo-600' : 'text-gray-700'
                      }`}
                    >
                      {line.trim()}
                    </p>
                  ) : <br key={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CurriculumPreview;