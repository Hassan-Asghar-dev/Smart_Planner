import { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaUser, FaHashtag, FaCalendar, FaUpload, FaCheckCircle } from 'react-icons/fa';

const templateData = {
  FOP: {
    quiz: [
      {
        question: "What is the correct syntax for a 'for' loop in C?",
        options: ["for(i=0; i<5; i++)", "for(i=0, i<5, i++)", "for i=0 to 5", "loop(i=0; i<5; i++)"],
        correct: 0
      },
      {
        question: "Which of these is NOT a valid variable name in Python?",
        options: ["my_var", "_var", "2var", "varName"],
        correct: 2
      }
    ],
    assignment: {
      header: {
        courseTitle: 'Fundamentals of Programming',
        instructor: '',
        assignmentNumber: '',
        studentName: '',
        rollNumber: '',
        submissionDate: '',
      },
      questions: [
        {
          id: 1,
          text: 'Implement a singly linked list with insert and delete operations.',
        },
        {
          id: 2,
          text: 'Write a program to reverse a string without using built-in functions.',
        },
        {
          id: 3,
          text: 'Create a file reader to count the frequency of words in a text file.',
        },
      ],
      objective: 'Master data structures, string manipulation, and file I/O in programming.',
      instructions: 'Write programs in C, C++, or Python. Ensure code is modular, includes comments, and handles errors (e.g., invalid inputs, file not found). Test with multiple cases and provide output screenshots.',
      task: 'Develop and test three programs for the given problems. Submit code, outputs, and a report explaining your approach and test cases.',
      requirements: 'Use C/C++/Python. Include header comments with purpose and author. Follow modular design (functions/structs). Use standard libraries only. Ensure code runs without errors.',
      submissionFormat: ['Code files (.c/.cpp/.py)', 'Screenshots of output', 'Report (PDF/Word) explaining the code and test cases'],
      evaluationRubric: {
        Correctness: '40%',
        'Code Structure & Modularity': '20%',
        'Comments & Readability': '15%',
        'Output Accuracy': '15%',
        'Timely Submission': '10%',
      },
    }
  },
  DLD: {
    quiz: [
      {
        question: "What is the output of an AND gate with inputs 1 and 0?",
        options: ["0", "1", "Undefined", "Both 1 and 0"],
        correct: 0
      },
      {
        question: "Which of these is a universal gate?",
        options: ["AND", "OR", "NAND", "XOR"],
        correct: 2
      }
    ],
    assignment: {
      header: {
        courseTitle: 'Digital and Logic Design',
        instructor: '',
        assignmentNumber: '',
        studentName: '',
        rollNumber: '',
        submissionDate: '',
      },
      questions: [
        {
          id: 1,
          text: 'Design a 4-bit comparator circuit with truth table and gate-level diagram.',
        },
        {
          id: 2,
          text: 'Create a state diagram for a traffic light controller with three states.',
        },
        {
          id: 3,
          text: 'Simulate a 3-bit up-counter using D flip-flops and provide its timing diagram.',
        },
      ],
      objective: 'Apply combinational and sequential logic principles to design and simulate digital circuits.',
      instructions: 'Use Logisim or equivalent for simulations. Provide truth tables, state diagrams, and gate-level designs. Optimize circuits for minimal gates.',
      task: 'Create circuit designs and simulations for the given problems. Submit diagrams, simulation files, and a brief explanation of each design.',
      requirements: 'Use Logisim or similar. Include truth tables, K-maps (if applicable), and gate-level diagrams. Simulations must match expected outputs.',
      submissionFormat: ['PDF for diagrams (truth tables, state diagrams, circuits)', 'Simulation file (.circ/.sim)'],
      evaluationRubric: {
        'Logical Accuracy': '30%',
        'Simplification Technique': '20%',
        'Diagram Quality': '20%',
        'Simulation Output': '20%',
        Documentation: '10%',
      },
    }
  },
  DataMining: {
    quiz: [
      {
        question: "What is the purpose of the Apriori algorithm?",
        options: ["Classification", "Clustering", "Association rule mining", "Regression"],
        correct: 2
      },
      {
        question: "Which metric evaluates the quality of a clustering algorithm?",
        options: ["Accuracy", "Silhouette coefficient", "F1-score", "Mean squared error"],
        correct: 1
      }
    ],
    assignment: {
      header: {
        courseTitle: 'Data Mining',
        instructor: '',
        assignmentNumber: '',
        studentName: '',
        rollNumber: '',
        submissionDate: '',
      },
      questions: [
        {
          id: 1,
          text: 'Implement a decision tree classifier on a provided dataset and evaluate its accuracy.',
        },
        {
          id: 2,
          text: 'Perform feature selection on a dataset using mutual information or similar techniques.',
        },
        {
          id: 3,
          text: 'Apply DBSCAN clustering and compare its results with k-means on the same dataset.',
        },
      ],
      objective: 'Explore classification, feature engineering, and clustering techniques in data mining.',
      instructions: 'Use Python with pandas, scikit-learn, and matplotlib. Use public datasets (e.g., UCI Repository) or instructor-provided data. Include visualizations and detailed explanations.',
      task: 'Analyze datasets, apply the specified algorithms, and visualize results. Submit code and a report with methodology, results, and insights.',
      requirements: 'Use Python (pandas, scikit-learn, matplotlib). Include code comments and visualizations. Datasets must be referenced (source URL or description).',
      submissionFormat: ['Jupyter Notebook (.ipynb) or Python script (.py)', 'Report (PDF) with graphs and analysis'],
      evaluationRubric: {
        'Algorithm Implementation': '30%',
        'Data Handling': '20%',
        'Insight and Analysis': '30%',
        'Report Quality': '20%',
      },
    }
  },
  CommunicationSkills: {
    quiz: [
      {
        question: "What is the primary goal of active listening?",
        options: ["To interrupt effectively", "To understand the speaker’s message", "To prepare a response", "To dominate the conversation"],
        correct: 1
      },
      {
        question: "Which of these is a characteristic of professional email writing?",
        options: ["Casual tone", "Clear and concise language", "Extensive use of emojis", "Lengthy paragraphs"],
        correct: 1
      }
    ],
    assignment: {
      header: {
        courseTitle: 'Communication and Presentation Skills',
        instructor: '',
        assignmentNumber: '',
        studentName: '',
        rollNumber: '',
        submissionDate: '',
      },
      questions: [
        {
          id: 1,
          text: 'Present a 5-minute case study on effective workplace communication.',
        },
        {
          id: 2,
          text: 'Write a 500-word proposal for a community project, including objectives and benefits.',
        },
        {
          id: 3,
          text: 'Design an infographic on public speaking tips for university students.',
        },
      ],
      objective: 'Enhance professional communication, presentation, and organizational skills.',
      instructions: 'For presentations, use PowerPoint (max 5 slides, 5 minutes). For proposals, follow APA format, 500 words. Infographics should be visually clear (A4 size).',
      task: 'Complete one task (presentation, proposal, or infographic) with professional structure, clear content, and appropriate visuals or referencing.',
      requirements: 'Presentations: clear delivery, max 5 slides. Proposals: APA format, 500 words. Infographics: A4, created with Canva or similar, include visuals.',
      submissionFormat: ['Oral: MP4 video + slides (PPT/PDF)', 'Written: PDF/Word document', 'Infographic: PDF or image (PNG/JPG)'],
      evaluationRubric: {
        'Content Relevance': '25%',
        'Organization and Flow': '20%',
        'Delivery or Writing Style': '25%',
        'Clarity and Visuals': '20%',
        Formatting: '10%',
      },
    }
  }
};

// Modal Component for Popup
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-r from-indigo-50 to-teal-50 p-8 rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-indigo-800">Template Viewer</h2>
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-red-600 font-semibold hover:bg-red-100 p-2 rounded-full transition"
          >
            <FaTimes className="h-5 w-5" />
            <span>Close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Quiz Component
function QuizTemplate({ subject, questions }) {
  const [answers, setAnswers] = useState(new Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswer = (questionIndex, optionIndex) => {
    if (!submitted) {
      const newAnswers = [...answers];
      newAnswers[questionIndex] = optionIndex;
      setAnswers(newAnswers);
    }
  };

  const submitQuiz = () => {
    if (!submitted) {
      let correct = 0;
      answers.forEach((answer, index) => {
        if (answer === questions[index].correct) {
          correct++;
        }
      });
      setScore(correct);
      setSubmitted(true);
    }
  };

  const resetQuiz = () => {
    setAnswers(new Array(questions.length).fill(null));
    setSubmitted(false);
    setScore(0);
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold text-indigo-700 mb-6">{subject} Quiz</h3>
      {questions.map((q, qIndex) => (
        <div
          key={qIndex}
          className="mb-6 p-6 bg-white rounded-xl shadow-md border border-indigo-100 hover:shadow-lg transition"
        >
          <div className="flex items-center mb-4">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 font-semibold mr-3">
              {qIndex + 1}
            </span>
            <p className="font-semibold text-gray-800 text-lg">{q.question}</p>
          </div>
          <div className="space-y-3">
            {q.options.map((option, oIndex) => (
              <label
                key={oIndex}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  checked={answers[qIndex] === oIndex}
                  onChange={() => handleAnswer(qIndex, oIndex)}
                  disabled={submitted}
                  className="h-5 w-5 text-indigo-600 focus:ring-teal-500 mr-3"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          {submitted && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                answers[qIndex] === q.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {answers[qIndex] === q.correct ? (
                <span className="flex items-center">
                  <FaCheckCircle className="mr-2" /> Correct!
                </span>
              ) : (
                `Incorrect. Correct answer: ${q.options[q.correct]}`
              )}
            </div>
          )}
        </div>
      ))}
      <div className="flex space-x-4">
        <button
          onClick={submitQuiz}
          disabled={submitted || answers.includes(null)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 transition"
        >
          Submit Quiz
        </button>
        {submitted && (
          <div className="flex items-center space-x-4">
            <p className="text-lg font-medium text-gray-800">
              Score: {score}/{questions.length} ({((score / questions.length) * 100).toFixed(2)}%)
            </p>
            <button
              onClick={resetQuiz}
              className="bg-teal-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 transition"
            >
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Assessment Component (Enhanced for Assignment)
function AssessmentTemplate({ subject, assessment }) {
  const [header, setHeader] = useState({
    instructor: '',
    assignmentNumber: '',
    studentName: '',
    rollNumber: '',
    submissionDate: '',
  });
  const [submission, setSubmission] = useState('');
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleHeaderChange = (e) => {
    setHeader({ ...header, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.studentName || !header.rollNumber || !header.submissionDate) {
      setError('Please fill all header fields (Student Name, Roll Number, Submission Date).');
      return;
    }
    setError('');
    setSubmitted(true);
    console.log('Assignment Submission:', {
      header,
      submission,
      file: file ? file.name : null,
    });
    // Optional: Backend submission
    /*
    try {
      const formData = new FormData();
      formData.append('header', JSON.stringify(header));
      formData.append('submission', submission);
      if (file) formData.append('file', file);
      const headers = { Authorization: `Bearer ${localStorage.getItem('authToken')}` };
      await axios.post('/api/submissions/', formData, { headers });
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Failed to submit assignment.');
    }
    */
  };

  const resetSubmission = () => {
    setHeader({
      instructor: '',
      assignmentNumber: '',
      studentName: '',
      rollNumber: '',
      submissionDate: '',
    });
    setSubmission('');
    setFile(null);
    setSubmitted(false);
    setError('');
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold text-indigo-700 mb-6">{subject} Assignment</h3>
      {!submitted ? (
        <div className="space-y-8">
          {/* Assignment Header Form */}
          <div className="p-6 bg-indigo-50 rounded-lg shadow-sm">
            <h4 className="text-xl font-semibold text-indigo-700 mb-4">Assignment Header</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="courseTitle" className="flex items-center text-gray-700 font-medium mb-2">
                  <FaUser className="mr-2 text-indigo-600" /> Course Title
                </label>
                <input
                  id="courseTitle"
                  type="text"
                  value={assessment.header.courseTitle}
                  disabled
                  className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="instructor" className="flex items-center text-gray-700 font-medium mb-2">
                  <FaUser className="mr-2 text-indigo-600" /> Instructor
                </label>
                <input
                  id="instructor"
                  name="instructor"
                  type="text"
                  placeholder="Instructor Name"
                  value={header.instructor}
                  onChange={handleHeaderChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-teal-500 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="assignmentNumber" className="flex items-center text-gray-700 font-medium mb-2">
                  <FaHashtag className="mr-2 text-indigo-600" /> Assignment Number
                </label>
                <input
                  id="assignmentNumber"
                  name="assignmentNumber"
                  type="text"
                  placeholder="Assignment Number"
                  value={header.assignmentNumber}
                  onChange={handleHeaderChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-teal-500 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="studentName" className="flex items-center text-gray-700 font-medium mb-2">
                  <FaUser className="mr-2 text-indigo-600" /> Student Name
                </label>
                <input
                  id="studentName"
                  name="studentName"
                  type="text"
                  placeholder="Student Name"
                  value={header.studentName}
                  onChange={handleHeaderChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-teal-500 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="rollNumber" className="flex items-center text-gray-700 font-medium mb-2">
                  <FaHashtag className="mr-2 text-indigo-600" /> Roll Number
                </label>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  placeholder="Roll Number"
                  value={header.rollNumber}
                  onChange={handleHeaderChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-teal-500 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="submissionDate" className="flex items-center text-gray-700 font-medium mb-2">
                  <FaCalendar className="mr-2 text-indigo-600" /> Submission Date
                </label>
                <input
                  id="submissionDate"
                  name="submissionDate"
                  type="date"
                  value={header.submissionDate}
                  onChange={handleHeaderChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-teal-500 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Assignment Questions */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-indigo-700 mb-4">Assignment Questions</h4>
            {assessment.questions.map((q) => (
              <div
                key={q.id}
                className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm border border-indigo-100"
              >
                <p className="text-gray-700 font-medium">{q.text}</p>
              </div>
            ))}
          </div>

          {/* Objective */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-indigo-700 mb-4">Objective</h4>
            <p className="text-gray-600">{assessment.objective}</p>
          </div>

          {/* Instructions */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-indigo-700 mb-4">Instructions</h4>
            <p className="text-gray-600">{assessment.instructions}</p>
          </div>

          {/* Task */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-indigo-700 mb-4">Task</h4>
            <p className="text-gray-600">{assessment.task}</p>
          </div>

          {/* Requirements */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-indigo-700 mb-4">Requirements</h4>
            <p className="text-gray-600">{assessment.requirements}</p>
          </div>

          {/* Submission Format */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-indigo-700 mb-4">Submission Format</h4>
            <ul className="list-disc pl-5 text-gray-600">
              {assessment.submissionFormat.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Evaluation Rubric */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h4 className="text-xl font-semibold text-indigo-700 mb-4">Evaluation Rubric</h4>
            <ul className="list-disc pl-5 text-gray-600">
              {Object.entries(assessment.evaluationRubric).map(([criterion, weight]) => (
                <li key={criterion}>{criterion}: {weight}</li>
              ))}
            </ul>
          </div>

          {/* Submission Form */}
          <div className="p-6 bg-indigo-50 rounded-lg shadow-sm">
            <h4 className="text-xl font-semibold text-indigo-700 mb-4">Submit Assignment</h4>
            <textarea
              placeholder="Enter any additional text submission (e.g., report content, explanations)"
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              disabled={submitted}
              className="border border-gray-300 rounded-lg p-4 w-full h-36 focus:ring-2 focus:ring-teal-500 shadow-sm mb-4"
            />
            <label className="flex items-center text-gray-700 font-medium mb-2">
              <FaUpload className="mr-2 text-indigo-600" /> Upload File
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={submitted}
              className="border border-gray-300 rounded-lg p-3 w-full mb-4 shadow-sm"
            />
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md mb-4">
                {error}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-700 disabled:bg-gray-400 transition"
            >
              Submit Assignment
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <FaCheckCircle className="text-teal-500 text-4xl mx-auto mb-4" />
          <p className="text-green-600 text-lg font-semibold mb-4">Assignment submitted successfully!</p>
          <div className="text-gray-600 space-y-2 mb-6">
            <p><strong>Header:</strong> {JSON.stringify(header)}</p>
            <p><strong>Text:</strong> {submission || 'None'}</p>
            <p><strong>File:</strong> {file ? file.name : 'None'}</p>
          </div>
          <button
            onClick={resetSubmission}
            className="bg-teal-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 transition"
          >
            Resubmit
          </button>
        </div>
      )}
    </div>
  );
}

// Main Template Component
function SubjectTemplates({ selectedTemplate, onClose }) {
  console.log('SubjectTemplates: selectedTemplate =', selectedTemplate);
  const { subject, type } = selectedTemplate || {};
  const isOpen = !!selectedTemplate;

  if (!subject || !type) {
    console.warn('SubjectTemplates: Invalid selectedTemplate, subject or type missing');
    return null;
  }

  console.log(`Rendering template: subject=${subject}, type=${type}`);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {type === 'quiz' && subject && templateData[subject] && (
        <QuizTemplate subject={subject} questions={templateData[subject].quiz} />
      )}
      {(type === 'assignment' || type === 'assessment') && subject && templateData[subject] && (
        <AssessmentTemplate subject={subject} assessment={templateData[subject].assignment} />
      )}
      {type !== 'quiz' && type !== 'assignment' && type !== 'assessment' && (
        <div className="text-red-600">Error: Invalid template type '{type}'</div>
      )}
    </Modal>
  );
}

export default SubjectTemplates;