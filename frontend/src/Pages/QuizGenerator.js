import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { FaBook } from 'react-icons/fa';
import OpenAI from 'openai';
import axios from 'axios';
import SubjectTemplates from '../components/SubjectTemplates';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const QuizGenerator = () => {
  const [quiz, setQuiz] = useState({ title: '', questions: [] });
  const [manualQuiz, setManualQuiz] = useState({ title: '', questions: [] });
  const [error, setError] = useState('');
  const [mode, setMode] = useState('quiz');
  const [aiInputs, setAiInputs] = useState({
    topic: '',
    subject: '',
    grade: '',
    questionCount: 5,
    questionTypes: ['mcq', 'truefalse', 'shortanswer'],
    difficulty: 'Medium',
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [userUid, setUserUid] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [openai, setOpenai] = useState(null);
  const [openAIError, setOpenAIError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Image paths for subject templates (replace with actual paths)
  const subjectImages = {
    FOP: {
      quiz: 'FOP.jpg',
      assessment: 'FOP.jpg',
    },
    DLD: {
      quiz: 'DLD.jpg',
      assessment: 'DLD.jpg',
    },
    DataMining: {
      quiz: 'DM.jpg',
      assessment: 'DM.jpg',
    },
    CommunicationSkills: {
      quiz: 'CS.jpg',
      assessment: 'CS.jpg',
    },
  };

  console.log('API_BASE_URL:', API_BASE_URL);

  useEffect(() => {
    console.log('REACT_APP_OPENAI_API_KEY:', process.env.REACT_APP_OPENAI_API_KEY);
    try {
      if (process.env.REACT_APP_OPENAI_API_KEY) {
        const client = new OpenAI({
          apiKey: process.env.REACT_APP_OPENAI_API_KEY,
          dangerouslyAllowBrowser: true,
        });
        setOpenai(client);
      } else {
        setOpenAIError('OpenAI API key is missing. AI-generated questions are disabled.');
      }
    } catch (err) {
      setOpenAIError(`Failed to initialize OpenAI: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    const uid = localStorage.getItem('userUid') || null;
    const token = localStorage.getItem('authToken') || null;
    setUserUid(uid);
    setAuthToken(token);

    const fetchQuizzes = async () => {
      try {
        console.log('Fetching quizzes from:', '/api/quizzes/');
        const response = await axios.get('/api/quizzes/', {
          params: { uid: uid || '' },
        });
        console.log('Fetch quizzes response:', response.status, response.data);
        setSavedQuizzes(response.data);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err.response?.status, err.response?.data, err.message);
        setError('Failed to load quizzes. Using local storage.');
        const stored = localStorage.getItem('savedQuizzes');
        if (stored) {
          setSavedQuizzes(JSON.parse(stored));
        }
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));
  }, [savedQuizzes]);

  const addQuestion = (state, setState) => (type) => {
    const newQuestion = {
      id: Date.now(),
      type,
      text: '',
      options: type === 'mcq' ? ['', '', '', ''] : type === 'truefalse' ? ['True', 'False'] : [],
      correctAnswer: '',
      explanation: '',
    };
    setState({
      ...state,
      questions: [...state.questions, newQuestion],
    });
  };

  const updateQuestion = (state, setState) => (id, field, value, index = null) => {
    setState({
      ...state,
      questions: state.questions.map((q) => {
        if (q.id === id) {
          if (field === 'options' && index !== null) {
            const newOptions = [...q.options];
            newOptions[index] = value;
            return { ...q, options: newOptions };
          }
          return { ...q, [field]: value };
        }
        return q;
      }),
    });
  };

  const deleteQuestion = (state, setState) => (id) => {
    setState({
      ...state,
      questions: state.questions.filter((q) => q.id !== id),
    });
  };

  const validateQuiz = (quizData) => {
    if (!quizData.title) return 'Title is required.';
    if (quizData.questions.length === 0) return 'At least one question is required.';
    for (const q of quizData.questions) {
      if (!q.text) return 'All questions must have text.';
      if (q.type !== 'shortanswer' && q.type !== 'essay' && q.options.some((opt) => !opt)) {
        return 'All options must be filled.';
      }
      if (!q.correctAnswer) return 'All questions must have a correct answer.';
    }
    return '';
  };

  const saveQuiz = async (quizData) => {
    const validationError = validateQuiz(quizData);
    if (validationError) {
      setError(validationError);
      return false;
    }
    try {
      const quizPayload = {
        title: quizData.title || `${mode.charAt(0).toUpperCase() + mode.slice(1)}`,
        mode,
        difficulty: 'Manual',
        questions: quizData.questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
        })),
      };
      if (userUid) {
        quizPayload.uid = userUid;
      }
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      console.log('Saving quiz to:', '/api/quizzes/', 'Payload:', quizPayload, 'Headers:', headers);
      const response = await axios.post('/api/quizzes/', quizPayload, { headers });
      console.log('Save quiz response:', response.status, response.data);
      setSavedQuizzes([...savedQuizzes, response.data]);
      setError('');
      return true;
    } catch (err) {
      console.error('Failed to save quiz:', err.response?.status, err.response?.data, err.message);
      if (err.response?.status === 400) {
        setError('Invalid quiz data: ' + JSON.stringify(err.response.data));
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required to save quiz. Please log in.');
      } else {
        setError('Failed to save quiz. Saved locally.');
      }
      setSavedQuizzes([
        ...savedQuizzes,
        { ...quizData, mode, id: Date.now(), difficulty: 'Manual' },
      ]);
      return false;
    }
  };

  const exportAsJSON = (quizData) => {
    const validationError = validateQuiz(quizData);
    if (validationError) {
      setError(validationError);
      return;
    }
    const json = JSON.stringify(quizData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quizData.title || mode}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setError('');
  };

  const exportAsPDF = (quizData) => {
    const validationError = validateQuiz(quizData);
    if (validationError) {
      setError(validationError);
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(quizData.title || mode.charAt(0).toUpperCase() + mode.slice(1), 20, 20);
    doc.setFontSize(12);
    let y = 30;
    quizData.questions.forEach((q, index) => {
      doc.text(`${index + 1}. ${q.text} (${q.type.toUpperCase()})`, 20, y, { maxWidth: 160 });
      y += 10;
      if (q.options.length) {
        q.options.forEach((opt, i) => {
          doc.text(`   ${String.fromCharCode(97 + i)}. ${opt}`, 25, y, { maxWidth: 155 });
          y += 7;
        });
      }
      if (q.type === 'essay') {
        doc.text(`Suggested Answer: ${q.correctAnswer}`, 20, y, { maxWidth: 160 });
        y += 10;
      } else {
        doc.text(`Answer: ${q.correctAnswer}`, 20, y);
        y += 10;
      }
      doc.text(`Explanation: ${q.explanation}`, 20, y, { maxWidth: 160 });
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save(`${quizData.title || mode}.pdf`);
    setError('');
  };

  const generateAIQuestions = async () => {
    if (!openai) {
      setError(openAIError || 'OpenAI client is not initialized.');
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      const prompt = mode === 'quiz'
        ? `Generate a quiz with ${aiInputs.questionCount} questions for ${aiInputs.grade} students on ${aiInputs.subject} about ${aiInputs.topic} at ${aiInputs.difficulty} difficulty (Easy: recall, Medium: application, Hard: analysis). Include ${aiInputs.questionTypes.join(', ')}. For Multiple Choice, provide 4 options with 1 correct answer. For True/False, provide 2 options. For Short Answer, provide a concise correct answer. For each question, include a 1-2 sentence explanation justifying the correct answer. Output in JSON format with fields: text (question text), type (mcq, truefalse, shortanswer), options (array, empty for shortanswer), correctAnswer (string), explanation (string).`
        : `Generate an assessment with ${aiInputs.questionCount} questions for ${aiInputs.grade} students on ${aiInputs.subject} about ${aiInputs.topic} at ${aiInputs.difficulty} difficulty (Easy: recall, Medium: application, Hard: analysis). Include Short Answer and Essay questions (open-ended, problem-solving, or analytical tasks aligned with Bloom’s Taxonomy: knowledge, comprehension, analysis, evaluation). Do not include Multiple Choice or True/False. Provide a suggested answer for each question and a 1-2 sentence explanation justifying the answer. Output in JSON format with fields: text (question text), type (shortanswer, essay), options (empty array), correctAnswer (string), explanation (string).`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      let generated = JSON.parse(response.choices[0].message.content);
      if (!Array.isArray(generated)) {
        generated = generated.questions || [];
      }
      setGeneratedQuestions(
        generated.map((q) => ({
          ...q,
          id: Date.now() + Math.random(),
          correctAnswer: q.correctAnswer || q.correct_answer,
        }))
      );
      setStep(5);
    } catch (err) {
      setError('Failed to generate questions: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const addGeneratedQuestions = async () => {
    const updatedQuiz = {
      ...quiz,
      title: aiInputs.subject || quiz.title,
      questions: [...quiz.questions, ...generatedQuestions],
    };
    setQuiz(updatedQuiz);
    await saveQuiz(updatedQuiz);
    setGeneratedQuestions([]);
    setStep(1);
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz({
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        id: q.id || Date.now() + Math.random(),
        correctAnswer: q.correct_answer || q.correctAnswer,
      })),
    });
    setShowModal(true);
  };

  const saveEditedQuiz = async () => {
    const validationError = validateQuiz(editingQuiz);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const quizData = {
        title: editingQuiz.title,
        mode: editingQuiz.mode,
        difficulty: editingQuiz.difficulty,
        questions: editingQuiz.questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
        })),
      };
      if (userUid) {
        quizData.uid = userUid;
      }
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      console.log('Updating quiz at:', `/api/quizzes/${editingQuiz.id}/`, quizData, 'Headers:', headers);
      const response = await axios.patch(`/api/quizzes/${editingQuiz.id}/`, quizData, { headers });
      console.log('Update quiz response:', response.status, response.data);
      setSavedQuizzes(savedQuizzes.map((q) => (q.id === editingQuiz.id ? response.data : q)));
    } catch (err) {
      console.error('Failed to update quiz:', err.response?.status, err.response?.data, err.message);
      setError('Failed to update quiz. Updated locally.');
      setSavedQuizzes(savedQuizzes.map((q) => (q.id === editingQuiz.id ? editingQuiz : q)));
    }

    setEditingQuiz(null);
    setShowModal(false);
    setError('');
  };

  const handleNext = () => {
    if (step === 1 && !aiInputs.topic) {
      setError('Topic is required.');
      return;
    }
    if (step === 2 && !aiInputs.subject) {
      setError('Subject is required.');
      return;
    }
    if (step === 3 && !aiInputs.grade) {
      setError('Education Level is required.');
      return;
    }
    if (step === 4 && aiInputs.questionTypes.length === 0) {
      setError('At least one question type is required.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const openTemplate = (subject, type) => {
    setSelectedTemplate({ subject, type });
  };

  const closeTemplate = () => {
    setSelectedTemplate(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-teal-100 font-sans">
      <nav className="fixed top-0 w-full bg-white shadow-xl px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaBook className="text-indigo-600 text-3xl mr-3" />
            <h1 className="text-indigo-700 text-2xl font-bold">
              Quiz & Assessment Generator
            </h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition"
            >
              View Saved Quizzes
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 p-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-indigo-800 mb-8 text-center">
          {mode === 'quiz' ? 'Create Your Quiz' : 'Design Your Assessment'}
        </h2>

        {openAIError && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md mb-8 mx-auto max-w-2xl">
            {openAIError} Manual creation and templates are still available.
          </div>
        )}

        {/* Subject Templates Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-6">
            Explore Subject Templates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(subjectImages).map((subject) => (
              <div key={subject} className="flex flex-col items-center">
                <div className="text-lg font-medium text-gray-700 mb-4">{subject}</div>
                <div className="flex space-x-4">
                  <div className="group">
                    <img
                      src={subjectImages[subject].quiz}
                      alt={`${subject} Quiz`}
                      className="w-32 h-32 object-cover rounded-lg shadow-md cursor-pointer transform group-hover:scale-105 transition"
                      onClick={() => openTemplate(subject, 'quiz')}
                    />
                    <p className="text-center text-sm text-gray-600 mt-2">Quiz</p>
                  </div>
                  <div className="group">
                    <img
                      src={subjectImages[subject].assessment}
                      alt={`${subject} Assessment`}
                      className="w-32 h-32 object-cover rounded-lg shadow-md cursor-pointer transform group-hover:scale-105 transition"
                      onClick={() => openTemplate(subject, 'assessment')}
                    />
                    <p className="text-center text-sm text-gray-600 mt-2">Assessment</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-lg font-medium text-gray-700">Mode:</label>
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setAiInputs({
                    ...aiInputs,
                    questionTypes: e.target.value === 'quiz'
                      ? ['mcq', 'truefalse', 'shortanswer']
                      : ['shortanswer', 'essay'],
                  });
                  setStep(1);
                  setGeneratedQuestions([]);
                }}
                className="border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="quiz">Quiz</option>
                <option value="assessment">Assessment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Saved Quizzes Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-2xl font-semibold text-indigo-700 mb-6">
                Saved Quizzes & Assessments
              </h3>
              {savedQuizzes.length === 0 ? (
                <p className="text-gray-600">No quizzes or assessments saved yet.</p>
              ) : editingQuiz ? (
                <div>
                  <label htmlFor="edit-title" className="block text-gray-700 font-medium mb-2">
                    Quiz/Assessment Title
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    placeholder="Title"
                    value={editingQuiz.title}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                    className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:ring-2 focus:ring-indigo-500"
                  />
                  {editingQuiz.questions.map((q, index) => (
                    <div key={q.id} className="mb-4 p-4 border border-gray-200 rounded-lg shadow-sm">
                      <label htmlFor={`edit-question-${index}`} className="block text-gray-700 font-medium mb-2">
                        Question Text
                      </label>
                      <input
                        id={`edit-question-${index}`}
                        type="text"
                        placeholder="Question Text"
                        value={q.text}
                        onChange={(e) => {
                          const newQuestions = [...editingQuiz.questions];
                          newQuestions[index].text = e.target.value;
                          setEditingQuiz({ ...editingQuiz, questions: newQuestions });
                        }}
                        className="border border-gray-300 rounded-lg p-3 w-full mb-2 focus:ring-2 focus:ring-indigo-500"
                      />
                      {q.type !== 'shortanswer' && q.type !== 'essay' && (
                        <div className="mb-2">
                          {q.options.map((opt, optIndex) => (
                            <div key={optIndex}>
                              <label
                                htmlFor={`edit-option-${index}-${optIndex}`}
                                className="block text-gray-700 font-medium mb-2"
                              >
                                Option {String.fromCharCode(97 + optIndex)}
                              </label>
                              <input
                                id={`edit-option-${index}-${optIndex}`}
                                type="text"
                                placeholder={`Option ${String.fromCharCode(97 + optIndex)}`}
                                value={opt}
                                onChange={(e) => {
                                  const newQuestions = [...editingQuiz.questions];
                                  newQuestions[index].options[optIndex] = e.target.value;
                                  setEditingQuiz({ ...editingQuiz, questions: newQuestions });
                                }}
                                className="border border-gray-300 rounded-lg p-3 w-full mb-2 focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <label htmlFor={`edit-answer-${index}`} className="block text-gray-700 font-medium mb-2">
                        {q.type === 'essay' ? 'Suggested Answer' : 'Correct Answer'}
                      </label>
                      <input
                        id={`edit-answer-${index}`}
                        type="text"
                        placeholder={q.type === 'essay' ? 'Suggested Answer' : 'Correct Answer'}
                        value={q.correctAnswer}
                        onChange={(e) => {
                          const newQuestions = [...editingQuiz.questions];
                          newQuestions[index].correctAnswer = e.target.value;
                          setEditingQuiz({ ...editingQuiz, questions: newQuestions });
                        }}
                        className="border border-gray-300 rounded-lg p-3 w-full mb-2 focus:ring-2 focus:ring-indigo-500"
                      />
                      <label htmlFor={`edit-explanation-${index}`} className="block text-gray-700 font-medium mb-2">
                        Explanation
                      </label>
                      <input
                        id={`edit-explanation-${index}`}
                        type="text"
                        placeholder="Explanation"
                        value={q.explanation}
                        onChange={(e) => {
                          const newQuestions = [...editingQuiz.questions];
                          newQuestions[index].explanation = e.target.value;
                          setEditingQuiz({ ...editingQuiz, questions: newQuestions });
                        }}
                        className="border border-gray-300 rounded-lg p-3 w-full mb-2 focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => {
                          const newQuestions = editingQuiz.questions.filter((_, i) => i !== index);
                          setEditingQuiz({ ...editingQuiz, questions: newQuestions });
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
                      >
                        Delete Question
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-4">
                    <button
                      onClick={saveEditedQuiz}
                      className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingQuiz(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                savedQuizzes.map((saved, index) => (
                  <div key={saved.id} className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm">
                    <h4 className="font-medium text-indigo-700 text-lg">
                      {saved.title || `${saved.mode.charAt(0).toUpperCase() + saved.mode.slice(1)} ${index + 1}`}
                    </h4>
                    <p className="text-gray-600">Mode: {saved.mode.charAt(0).toUpperCase() + saved.mode.slice(1)}</p>
                    <p className="text-gray-600">Difficulty: {saved.difficulty}</p>
                    {saved.questions.map((q, qIndex) => (
                      <div key={q.id || qIndex} className="mt-2">
                        <p className="font-medium text-gray-700">{qIndex + 1}. {q.text} ({q.type.toUpperCase()})</p>
                        {q.options.length > 0 && (
                          <ul className="list-disc pl-5 text-gray-600">
                            {q.options.map((opt, i) => (
                              <li key={i}>{opt}</li>
                            ))}
                          </ul>
                        )}
                        <p className="mt-1 text-gray-600">
                          {q.type === 'essay' ? 'Suggested Answer' : 'Correct Answer'}: {q.correct_answer || q.correctAnswer}
                        </p>
                        <p className="mt-1 text-gray-600">Explanation: {q.explanation}</p>
                      </div>
                    ))}
                    <button
                      onClick={() => handleEditQuiz(saved)}
                      className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition mt-2"
                    >
                      Edit
                    </button>
                  </div>
                ))
              )}
              {!editingQuiz && (
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transition"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI Generation Steps */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-6">
            AI-Powered {mode === 'quiz' ? 'Quiz' : 'Assessment'} Creation
          </h3>
          <div className="flex items-center justify-center mb-8">
            {['Topic', 'Subject', 'Education Level', 'Questions'].map((label, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold
                    ${step > index + 1 ? 'bg-teal-500' : step === index + 1 ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                {index < 3 && (
                  <span className="mx-3 text-indigo-600 font-bold">→</span>
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <label htmlFor="ai-topic" className="block text-gray-700 font-medium mb-2">
                Topic
              </label>
              <input
                id="ai-topic"
                type="text"
                placeholder="Topic (e.g., World War II)"
                value={aiInputs.topic}
                onChange={(e) => setAiInputs({ ...aiInputs, topic: e.target.value })}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label htmlFor="ai-subject" className="block text-gray-700 font-medium mb-2">
                Subject
              </label>
              <input
                id="ai-subject"
                type="text"
                placeholder="Subject (e.g., History)"
                value={aiInputs.subject}
                onChange={(e) => setAiInputs({ ...aiInputs, subject: e.target.value })}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <label htmlFor="ai-grade" className="block text-gray-700 font-medium mb-2">
                Education Level
              </label>
              <input
                id="ai-grade"
                type="text"
                placeholder="Education Level (e.g., 8th Grade)"
                value={aiInputs.grade}
                onChange={(e) => setAiInputs({ ...aiInputs, grade: e.target.value })}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <label htmlFor="ai-question-count" className="block text-gray-700 font-medium mb-2">
                Number of Questions
              </label>
              <input
                id="ai-question-count"
                type="number"
                placeholder="Number of Questions"
                value={aiInputs.questionCount}
                onChange={(e) => setAiInputs({ ...aiInputs, questionCount: parseInt(e.target.value) || 5 })}
                min="1"
                className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:ring-2 focus:ring-indigo-500"
              />
              <label htmlFor="ai-difficulty" className="block text-gray-700 font-medium mb-2">
                Difficulty Level
              </label>
              <select
                id="ai-difficulty"
                value={aiInputs.difficulty}
                onChange={(e) => setAiInputs({ ...aiInputs, difficulty: e.target.value })}
                className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              {mode === 'quiz' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Question Types</label>
                  {['mcq', 'truefalse', 'shortanswer'].map((type) => (
                    <label key={type} className="inline-flex items-center mr-4">
                      <input
                        type="checkbox"
                        checked={aiInputs.questionTypes.includes(type)}
                        onChange={(e) => {
                          const types = e.target.checked
                            ? [...aiInputs.questionTypes, type]
                            : aiInputs.questionTypes.filter((t) => t !== type);
                          setAiInputs({ ...aiInputs, questionTypes: types });
                        }}
                        className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      {type === 'mcq' ? 'Multiple Choice' : type === 'truefalse' ? 'True/False' : 'Short Answer'}
                    </label>
                  ))}
                </div>
              )}
              {mode === 'assessment' && (
                <p className="text-gray-600">Includes: Short Answer, Essay (Assignment-type)</p>
              )}
            </div>
          )}

          {step === 5 && generatedQuestions.length > 0 && (
            <div>
              {generatedQuestions.map((q, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg shadow-sm">
                  <p className="font-medium text-gray-700">{q.text} ({q.type.toUpperCase()})</p>
                  {q.options.length > 0 && (
                    <ul className="list-disc pl-5 text-gray-600">
                      {q.options.map((opt, i) => (
                        <li key={i}>{opt}</li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-2 text-gray-600">
                    {q.type === 'essay' ? 'Suggested Answer' : 'Correct Answer'}: {q.correctAnswer}
                  </p>
                  <p className="mt-2 text-gray-600">Explanation: {q.explanation}</p>
                </div>
              ))}
              <button
                onClick={addGeneratedQuestions}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition"
              >
                Add to {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md mt-4">
              {error}
            </div>
          )}

          {step <= 4 && (
            <div className="mt-6 flex space-x-4">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transition"
                >
                  Back
                </button>
              )}
              {step < 4 && (
                <button
                  onClick={handleNext}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition"
                >
                  Next
                </button>
              )}
              {step === 4 && (
                <button
                  onClick={generateAIQuestions}
                  disabled={isGenerating || aiInputs.questionTypes.length === 0 || !openai}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 transition"
                >
                  {isGenerating ? 'Generating...' : 'Generate Questions'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Manual Creation Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-6">
            Manual {mode === 'quiz' ? 'Quiz' : 'Assessment'} Creation
          </h3>
          <div className="mb-4">
            <label htmlFor="manual-title" className="block text-gray-700 font-medium mb-2">
              Quiz/Assessment Title
            </label>
            <input
              id="manual-title"
              type="text"
              placeholder="Quiz/Assessment Title"
              value={manualQuiz.title}
              onChange={(e) => setManualQuiz({ ...manualQuiz, title: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="question-type" className="block text-gray-700 font-medium mb-2">
              Add Question Type
            </label>
            <select
              id="question-type"
              onChange={(e) => addQuestion(manualQuiz, setManualQuiz)(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Question Type</option>
              {mode === 'quiz' ? (
                <>
                  <option value="mcq">Multiple Choice</option>
                  <option value="truefalse">True/False</option>
                  <option value="shortanswer">Short Answer</option>
                </>
              ) : (
                <>
                  <option value="shortanswer">Short Answer</option>
                  <option value="essay">Essay</option>
                </>
              )}
            </select>
          </div>

          {manualQuiz.questions.map((question, index) => (
            <div key={question.id} className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm">
              <div className="mb-2">
                <label htmlFor={`question-text-${index}`} className="block text-gray-700 font-medium mb-2">
                  Question Text
                </label>
                <input
                  id={`question-text-${index}`}
                  type="text"
                  placeholder="Question Text"
                  value={question.text}
                  onChange={(e) => updateQuestion(manualQuiz, setManualQuiz)(question.id, 'text', e.target.value)}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {question.type !== 'shortanswer' && question.type !== 'essay' && (
                <div className="mb-4">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="mb-2">
                      <label
                        htmlFor={`option-${index}-${optIndex}`}
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Option {String.fromCharCode(97 + optIndex)}
                      </label>
                      <input
                        id={`option-${index}-${optIndex}`}
                        type="text"
                        placeholder={`Option ${String.fromCharCode(97 + optIndex)}`}
                        value={option}
                        onChange={(e) =>
                          updateQuestion(manualQuiz, setManualQuiz)(question.id, 'options', e.target.value, optIndex)
                        }
                        className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="mb-2">
                <label htmlFor={`correct-answer-${index}`} className="block text-gray-700 font-medium mb-2">
                  {question.type === 'essay' ? 'Suggested Answer' : 'Correct Answer'}
                </label>
                <input
                  id={`correct-answer-${index}`}
                  type="text"
                  placeholder={question.type === 'essay' ? 'Suggested Answer' : 'Correct Answer'}
                  value={question.correctAnswer}
                  onChange={(e) =>
                    updateQuestion(manualQuiz, setManualQuiz)(question.id, 'correctAnswer', e.target.value)
                  }
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-2">
                <label htmlFor={`explanation-${index}`} className="block text-gray-700 font-medium mb-2">
                  Explanation
                </label>
                <input
                  id={`explanation-${index}`}
                  type="text"
                  placeholder="Explanation"
                  value={question.explanation}
                  onChange={(e) =>
                    updateQuestion(manualQuiz, setManualQuiz)(question.id, 'explanation', e.target.value)
                  }
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => deleteQuestion(manualQuiz, setManualQuiz)(question.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          ))}

          {manualQuiz.questions.length > 0 && (
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => exportAsJSON(manualQuiz)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition"
              >
                Export as JSON
              </button>
              <button
                onClick={() => exportAsPDF(manualQuiz)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition"
              >
                Export as PDF
              </button>
              <button
                onClick={async () => {
                  const success = await saveQuiz(manualQuiz);
                  if (success) {
                    setManualQuiz({ title: '', questions: [] });
                  }
                }}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition"
              >
                Save to Generated Quizzes
              </button>
            </div>
          )}
        </div>

        {/* AI-Generated Quiz Section */}
        {quiz.questions.length > 0 && (
          <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-6">
              AI-Generated {mode === 'quiz' ? 'Quiz' : 'Assessment'}
            </h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => exportAsJSON(quiz)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition"
              >
                Export as JSON
              </button>
              <button
                onClick={() => exportAsPDF(quiz)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition"
              >
                Export as PDF
              </button>
              <button
                onClick={() => saveQuiz(quiz)}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition"
              >
                Save Quiz
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (quiz.questions.length > 0 || manualQuiz.questions.length > 0) && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md mb-8 mx-auto max-w-2xl">
            {error}
          </div>
        )}

        {/* Subject Templates Popup */}
        <SubjectTemplates selectedTemplate={selectedTemplate} onClose={closeTemplate} />
      </div>
    </div>
  );
};

export default QuizGenerator;