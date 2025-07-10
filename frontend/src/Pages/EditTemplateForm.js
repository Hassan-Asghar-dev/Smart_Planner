import React from 'react';

const EditTemplateForm = ({ editingTemplate, setEditingTemplate, updateTemplate, handleTemplateFieldChange }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          Edit {editingTemplate.weekNum ? `Week ${editingTemplate.weekNum}` : 'Template'}
        </h2>
        <form onSubmit={updateTemplate}>
          {editingTemplate.weekNum ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Topic</label>
                <input
                  type="text"
                  value={editingTemplate.data.topic}
                  onChange={(e) => handleTemplateFieldChange('topic', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Objectives</label>
                <textarea
                  value={editingTemplate.data.objectives}
                  onChange={(e) => handleTemplateFieldChange('objectives', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2"
                  rows="4"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Activities</label>
                {editingTemplate.data.activities.map(activity => (
                  <div key={activity.id} className="mb-2">
                    <input
                      type="text"
                      value={activity.description}
                      onChange={(e) => handleTemplateFieldChange('description', e.target.value, activity.id)}
                      className="w-full border border-gray-200 rounded-lg p-2 mb-1"
                      placeholder="Activity description"
                    />
                    <select
                      value={activity.type}
                      onChange={(e) => handleTemplateFieldChange('type', e.target.value, activity.id)}
                      className="w-full border border-gray-200 rounded-lg p-2"
                    >
                      <option value="lecture">Lecture</option>
                      <option value="activity">Activity</option>
                      <option value="group-work">Group Work</option>
                      <option value="practice">Practice</option>
                      <option value="discussion">Discussion</option>
                      <option value="lab">Lab</option>
                      <option value="review">Review</option>
                      <option value="assessment">Assessment</option>
                      <option value="presentation">Presentation</option>
                    </select>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Materials</label>
                <textarea
                  value={editingTemplate.data.materials.join(', ')}
                  onChange={(e) => handleTemplateFieldChange('materials', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2"
                  rows="2"
                  placeholder="Enter materials, separated by commas"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Assessment</label>
                <textarea
                  value={editingTemplate.data.assessment}
                  onChange={(e) => handleTemplateFieldChange('assessment', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2"
                  rows="2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Differentiation</label>
                <textarea
                  value={editingTemplate.data.differentiation}
                  onChange={(e) => handleTemplateFieldChange('differentiation', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2"
                  rows="2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Videos</label>
                <textarea
                  value={editingTemplate.data.videos.join(', ')}
                  onChange={(e) => handleTemplateFieldChange('videos', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2"
                  rows="2"
                  placeholder="Enter video titles/links, separated by commas"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Assignments</label>
                <textarea
                  value={editingTemplate.data.assignments.join(', ')}
                  onChange={(e) => handleTemplateFieldChange('assignments', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2"
                  rows="2"
                  placeholder="Enter assignments, separated by commas"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Quizzes</label>
                <textarea
                  value={editingTemplate.data.quizzes.join(', ')}
                  onChange={(e) => handleTemplateFieldChange('quizzes', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2"
                  rows="2"
                  placeholder="Enter quizzes, separated by commas"
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={editingTemplate.data.title}
                  onChange={(e) => handleTemplateFieldChange('title', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingTemplate.data.description}
                  onChange={(e) => handleTemplateFieldChange('description', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2"
                  rows="4"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Standards</label>
                <input
                  type="text"
                  value={editingTemplate.data.standards}
                  onChange={(e) => handleTemplateFieldChange('standards', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2"
                />
              </div>
            </>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setEditingTemplate(null)}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTemplateForm;