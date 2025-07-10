
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaDownload, FaArrowLeft } from 'react-icons/fa';

function CurriculumTemplate() {
  const { state } = useLocation();
  const curriculumText = state?.curriculumText || null;
  const curriculumId = state?.curriculumId || 'unknown';
  const educationSystem = state?.educationSystem || null;
  const courseTitle = state?.courseTitle || '[Course Name]';
  const courseCode = state?.courseCode || '[Course Code]';
  const creditHours = state?.creditHours || '3';
  const instructorName = state?.instructorName || '[Instructor Name]';
  const isFOP = state?.isFOP || false; // Flag to use FOP template

  // Standards metadata
  const standardsTemplates = {
    NQF: {
      name: 'National Qualifications Framework (NQF)',
      header: 'Curriculum Aligned with NQF Standards',
      footer: 'Compliant with National Qualifications Framework requirements.',
    },
    HEC: {
      name: 'Higher Education Commission (HEC)',
      header: 'Curriculum Aligned with HEC Guidelines',
      footer: 'Meets Higher Education Commission academic standards.',
    },
    IPES: {
      name: 'International Professional Education Standards (IPES)',
      header: 'Curriculum Aligned with IPES Framework',
      footer: 'Adheres to International Professional Education Standards.',
    },
  };

  // FOP Template (Fundamentals of Programming)
  const fopTemplate = [
    { week: 1, topics: 'Introduction to Programming\n- What is a program, compiler, interpreter', activities: 'Lecture, demo, lab setup', assignments: 'Install Python, IDE setup', resources: 'Python.org, VS Code, Slides' },
    { week: 2, topics: 'Data Types & Variables\n- Integers, floats, strings, type conversion', activities: 'Coding examples, lab exercises', assignments: 'Assignment 1: Basic input/output', resources: 'Code snippets, IDE' },
    { week: 3, topics: 'Operators & Expressions\n- Arithmetic, logical, comparison', activities: 'Quiz, practice problems', assignments: 'Quiz 1', resources: 'Exercise sheets' },
    { week: 4, topics: 'Conditional Statements\n- if, elif, else', activities: 'Decision making practice', assignments: 'Assignment 2: Condition-based problems', resources: 'Coding IDE, lab manual' },
    { week: 5, topics: 'Loops\n- for, while, break, continue', activities: 'Looping exercises in lab', assignments: 'Lab Task', resources: 'Slides + sample programs' },
    { week: 6, topics: 'Strings and String Operations\n- indexing, slicing, functions', activities: 'Lab on string manipulation', assignments: 'Assignment 3', resources: 'Python docs, string cheatsheet' },
    { week: 7, topics: 'Lists & Tuples\n- creation, iteration, slicing', activities: 'Hands-on session with lists', assignments: 'Group Activity', resources: 'Python tutorial examples' },
    { week: 8, topics: 'Midterm Exam + Review', activities: 'Review games, mock test', assignments: 'Midterm', resources: 'Midterm paper, review sheet' },
    { week: 9, topics: 'Functions\n- defining, parameters, return values', activities: 'Function writing lab', assignments: 'Assignment 4: Modular code', resources: 'Functions worksheet' },
    { week: 10, topics: 'Recursion (Intro)\n- Concept and base case', activities: 'Trace examples, dry-run', assignments: 'Quiz 2', resources: 'Recursion visuals/slides' },
    { week: 11, topics: 'Dictionaries & Sets\n- key-value pairs, usage', activities: 'Code along with real-life examples', assignments: 'Lab Exercise', resources: 'Python Docs, cheat sheet' },
    { week: 12, topics: 'File I/O\n- Reading from and writing to files', activities: 'Practice with .txt files', assignments: 'Assignment 5: File reader', resources: 'Text files, example inputs' },
    { week: 13, topics: 'Error Handling\n- try-except blocks, input validation', activities: 'Debugging session', assignments: 'Reflection: Code Debugging', resources: 'Sample buggy code' },
    { week: 14, topics: 'Intro to Object-Oriented Programming\n- Classes, objects', activities: 'Mini lab on class definition', assignments: 'Assignment 6: Simple Class', resources: 'OOP slides and diagrams' },
    { week: 15, topics: 'Project Presentations + Review', activities: 'Group presentations', assignments: 'Final Project Submission', resources: 'Project rubric' },
    { week: 16, topics: 'Final Exam', activities: 'Final exam', assignments: 'Graded exam', resources: 'Final paper' },
  ];

  // General Standard Template (e.g., for other NQF courses)
  const standardTemplate = educationSystem && standardsTemplates[educationSystem] ? [
    { week: 1, topics: 'Course Introduction & Overview', activities: 'Course briefing, syllabus discussion', assignments: 'Icebreaker activity, syllabus quiz', resources: 'Syllabus, intro slides' },
    { week: 2, topics: 'Fundamentals', activities: 'Lecture, class discussion', assignments: 'Short quiz', resources: 'Textbook Chapter 1, Slide deck' },
    { week: 3, topics: 'Core Concepts I', activities: 'Hands-on coding, tutorial', assignments: 'Assignment 1', resources: 'Lab handout, IDE' },
    { week: 4, topics: 'Core Concepts II', activities: 'Group activity, problem-solving', assignments: 'Quiz 2', resources: 'Sample problems' },
    { week: 5, topics: 'Applied Concepts I', activities: 'Lecture, example walkthroughs', assignments: 'Group assignment', resources: 'Slides, textbook' },
    { week: 6, topics: 'Applied Concepts II', activities: 'Case studies, pair programming', assignments: 'Lab task', resources: 'Case handouts' },
    { week: 7, topics: 'Review + Midterm Preparation', activities: 'Q&A, concept map review', assignments: 'Practice test', resources: 'Midterm guide' },
    { week: 8, topics: 'Midterm', activities: 'Midterm Exam', assignments: 'Graded exam', resources: 'Midterm paper' },
    { week: 9, topics: 'Advanced Concepts I', activities: 'Demonstration, simulation', assignments: 'Mini project proposal', resources: 'Software tool, article' },
    { week: 10, topics: 'Advanced Concepts II', activities: 'Lecture + interactive examples', assignments: 'Assignment 2', resources: 'Examples, research papers' },
    { week: 11, topics: 'Real-World Applications', activities: 'Case analysis, guest speaker', assignments: 'Short quiz', resources: 'Case study, guest notes' },
    { week: 12, topics: 'Project Work Week', activities: 'Group work, progress check-ins', assignments: 'Submit draft', resources: 'Project rubric' },
    { week: 13, topics: 'Ethics / Industry Trends', activities: 'Debate, reading discussions', assignments: 'Reflection essay', resources: 'Article, slides' },
    { week: 14, topics: 'Project Finalization', activities: 'Lab support, instructor feedback', assignments: 'Final project submission', resources: 'Project submission portal' },
    { week: 15, topics: 'Final Review Week', activities: 'Kahoot, flashcards, Q&A', assignments: 'Practice final', resources: 'Final guide' },
    { week: 16, topics: 'Final Exam', activities: 'Final Examination', assignments: 'Graded exam', resources: 'Exam paper' },
  ] : [];

  // Blank Template for Custom Curriculum
  const blankTemplate = [
    { week: 1, topics: '', activities: '', assignments: '', resources: '' },
    { week: 2, topics: '', activities: '', assignments: '', resources: '' },
    { week: 3, topics: '', activities: '', assignments: '', resources: '' },
    { week: 4, topics: '', activities: '', assignments: '', resources: '' },
    { week: 5, topics: '', activities: '', assignments: '', resources: '' },
    { week: 6, topics: '', activities: '', assignments: '', resources: '' },
    { week: 7, topics: '', activities: '', assignments: '', resources: '' },
    { week: 8, topics: 'Midterm', activities: 'Midterm Exam', assignments: '', resources: '' },
    { week: 9, topics: '', activities: '', assignments: '', resources: '' },
    { week: 10, topics: '', activities: '', assignments: '', resources: '' },
    { week: 11, topics: '', activities: '', assignments: '', resources: '' },
    { week: 12, topics: '', activities: '', assignments: '', resources: '' },
    { week: 13, topics: '', activities: '', assignments: '', resources: '' },
    { week: 14, topics: '', activities: '', assignments: '', resources: '' },
    { week: 15, topics: 'Review', activities: '', assignments: '', resources: '' },
    { week: 16, topics: 'Final Exam', activities: 'Final Examination', assignments: '', resources: '' },
  ];

  // Select curriculum data
  const curriculumData = curriculumText
    ? JSON.parse(curriculumText) // Assumes JSON string of array
    : isFOP
    ? fopTemplate
    : educationSystem
    ? standardTemplate
    : blankTemplate;

  // Format curriculum for display and download
  const formatCurriculumContent = () => {
    const template = educationSystem && standardsTemplates[educationSystem];
    let content = `${template ? template.header : 'Custom Curriculum'}\n\n`;
    content += `Course Title: ${courseTitle}\n`;
    content += `Course Code: ${courseCode}\n`;
    content += `Credit Hours: ${creditHours} ${isFOP ? '(2 hours lecture + 1 hour lab/week)' : ''}\n`;
    content += `Pre-requisite: ${isFOP ? 'None' : 'TBD'}\n`;
    content += `Language: ${isFOP ? 'Python' : 'TBD'}\n`;
    content += `Level: Undergraduate - ${isFOP ? 'First Year' : 'TBD'}\n`;
    content += `Duration: 16 Weeks\n`;
    content += `Instructor: ${instructorName}\n\n`;
    content += 'Weekly Breakdown\n';
    content += '| Week | Topics & Objectives | Activities/Instructional Methods | Assignments / Assessments | Resources/Materials |\n';
    content += '|------|---------------------|----------------------------------|---------------------------|---------------------|\n';
    curriculumData.forEach((row) => {
      content += `| ${row.week} | ${row.topics || ''} | ${row.activities || ''} | ${row.assignments || ''} | ${row.resources || ''} |\n`;
    });
    if (isFOP) {
      content += '\nLab Component (Every Week)\n';
      content += '- Reinforce lecture topics via hands-on programming\n';
      content += '- Progressive mini-tasks leading to project\n';
      content += '- Environment: Python 3.x, IDE (VS Code / PyCharm)\n\n';
      content += 'Assessments Overview\n';
      content += '| Type | Description | Weight |\n';
      content += '|------|-------------|--------|\n';
      content += '| Quizzes | 2 quizzes (Weeks 3 & 10) | 10% |\n';
      content += '| Assignments | 6 programming assignments | 25% |\n';
      content += '| Lab Tasks | Weekly mini-exercises | 10% |\n';
      content += '| Midterm Exam | Written + practical | 20% |\n';
      content += '| Final Project | Small group programming project | 10% |\n';
      content += '| Final Exam | Comprehensive | 25% |\n\n';
      content += 'Suggested Textbooks & Resources\n';
      content += '- “Python Programming: An Introduction to Computer Science” by John Zelle\n';
      content += '- w3schools.com/python/\n';
      content += '- docs.python.org/3/\n';
      content += '- Real Python tutorials\n';
    }
    if (template) {
      content += `\n${template.footer}`;
    }
    return content;
  };

  const formattedContent = formatCurriculumContent();

  const handleDownloadCurriculum = () => {
    if (formattedContent) {
      const blob = new Blob([formattedContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `curriculum_${curriculumId}${educationSystem ? `_${educationSystem}` : ''}${isFOP ? '_FOP' : ''}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert('No curriculum content to download.');
    }
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
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-6 py-12">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-5xl mx-auto transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
            Curriculum Preview
          </h2>
          {educationSystem && standardsTemplates[educationSystem] && (
            <div className="mb-6 text-center">
              <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
                Standard: {standardsTemplates[educationSystem].name} {isFOP ? '(FOP)' : ''}
              </span>
            </div>
          )}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Course Information
            </h3>
            <p className="text-gray-700"><strong>Course Title:</strong> {courseTitle}</p>
            <p className="text-gray-700"><strong>Course Code:</strong> {courseCode}</p>
            <p className="text-gray-700"><strong>Credit Hours:</strong> {creditHours} {isFOP ? '(2 hours lecture + 1 hour lab/week)' : ''}</p>
            <p className="text-gray-700"><strong>Pre-requisite:</strong> {isFOP ? 'None' : 'TBD'}</p>
            <p className="text-gray-700"><strong>Language:</strong> {isFOP ? 'Python' : 'TBD'}</p>
            <p className="text-gray-700"><strong>Level:</strong> Undergraduate - {isFOP ? 'First Year' : 'TBD'}</p>
            <p className="text-gray-700"><strong>Duration:</strong> 16 Weeks</p>
            <p className="text-gray-700"><strong>Instructor:</strong> {instructorName}</p>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Week-by-Week Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700 bg-gray-50 rounded-lg shadow-inner">
                <thead className="text-xs text-gray-800 uppercase bg-gray-200">
                  <tr>
                    <th scope="col" className="px-4 py-3">Week</th>
                    <th scope="col" className="px-4 py-3">Topics & Objectives</th>
                    <th scope="col" className="px-4 py-3">Activities/Instructional Methods</th>
                    <th scope="col" className="px-4 py-3">Assignments/Assessments</th>
                    <th scope="col" className="px-4 py-3">Resources/Materials</th>
                  </tr>
                </thead>
                <tbody>
                  {curriculumData.map((row) => (
                    <tr key={row.week} className="border-b hover:bg-gray-100">
                      <td className="px-4 py-3">{row.week}</td>
                      <td className="px-4 py-3 whitespace-pre-line">{row.topics || '-'}</td>
                      <td className="px-4 py-3">{row.activities || '-'}</td>
                      <td className="px-4 py-3">{row.assignments || '-'}</td>
                      <td className="px-4 py-3">{row.resources || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {isFOP && (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Lab Component (Every Week)
                </h3>
                <ul className="text-gray-700 list-disc list-inside">
                  <li>Reinforce lecture topics via hands-on programming</li>
                  <li>Progressive mini-tasks leading to project</li>
                  <li>Environment: Python 3.x, IDE (VS Code / PyCharm)</li>
                </ul>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Assessments Overview
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-700 bg-gray-50 rounded-lg shadow-inner">
                    <thead className="text-xs text-gray-800 uppercase bg-gray-200">
                      <tr>
                        <th scope="col" className="px-4 py-3">Type</th>
                        <th scope="col" className="px-4 py-3">Description</th>
                        <th scope="col" className="px-4 py-3">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-100">
                        <td className="px-4 py-3">Quizzes</td>
                        <td className="px-4 py-3">2 quizzes (Weeks 3 & 10)</td>
                        <td className="px-4 py-3">10%</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-100">
                        <td className="px-4 py-3">Assignments</td>
                        <td className="px-4 py-3">6 programming assignments</td>
                        <td className="px-4 py-3">25%</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-100">
                        <td className="px-4 py-3">Lab Tasks</td>
                        <td className="px-4 py-3">Weekly mini-exercises</td>
                        <td className="px-4 py-3">10%</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-100">
                        <td className="px-4 py-3">Midterm Exam</td>
                        <td className="px-4 py-3">Written + practical</td>
                        <td className="px-4 py-3">20%</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-100">
                        <td className="px-4 py-3">Final Project</td>
                        <td className="px-4 py-3">Small group programming project</td>
                        <td className="px-4 py-3">10%</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-100">
                        <td className="px-4 py-3">Final Exam</td>
                        <td className="px-4 py-3">Comprehensive</td>
                        <td className="px-4 py-3">25%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Suggested Textbooks & Resources
                </h3>
                <ul className="text-gray-700 list-disc list-inside">
                  <li>“Python Programming: An Introduction to Computer Science” by John Zelle</li>
                  <li>w3schools.com/python/</li>
                  <li>docs.python.org/3/</li>
                  <li>Real Python tutorials</li>
                </ul>
              </div>
            </>
          )}
          {educationSystem && standardsTemplates[educationSystem] && (
            <p className="text-gray-600 text-sm text-center">
              {standardsTemplates[educationSystem].footer}
            </p>
          )}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDownloadCurriculum}
              className="flex items-center bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-200"
            >
              <FaDownload className="mr-2" />
              Download Curriculum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurriculumTemplate;