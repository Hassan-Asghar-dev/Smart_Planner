import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import OpenAI from 'openai';
import EditTemplateForm from './EditTemplateForm';
import axios from 'axios';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Backend API base URL
const API_BASE_URL = 'http://localhost:8000/api/';

// Axios instance with token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Sample Outline Data
const sampleOutline = {
  title: "Introduction to React",
  topics: [
    { id: 'topic-1', title: "What is React?" },
    { id: 'topic-2', title: "JSX Basics" },
    { id: 'topic-3', title: "Components (Functional & Class)" },
    { id: 'topic-4', title: "Props and State" },
    { id: 'topic-5', title: "Event Handling" },
  ],
};

// Subject-specific images
const subjectImages = {
  math: 'Maths.jpg',
  science: 'Science.jpg',
  english: 'English.jpg',
  history: 'History.jpg',
  physics: 'Physics.jpg',
  chemistry: 'Chemistry.jpg',
  art: 'Arts.jpg',
};

// Pre-built Templates with 4 weeks
const initialTemplates = {
  math: [
    {
      id: 'template-math-1',
      title: "Algebra: 9th Grade Curriculum",
      description: "Comprehensive algebra course covering foundational concepts.",
      standards: "CCSS.MATH.CONTENT.HSA.SSE.A.1",
      weeks: [
        {
          week: 1,
          topic: "Introduction to Algebra",
          objectives: "Understand variables, expressions, and basic operations.",
          activities: [
            { id: 'act-1', description: "Interactive lecture on variables (20 min)", type: 'lecture' },
            { id: 'act-2', description: "Group activity: Solve simple expressions (15 min)", type: 'group-work' },
          ],
          materials: ["Whiteboard", "Worksheets", "Calculators"],
          assessment: "Exit ticket: Write three expressions.",
          differentiation: "Provide visual aids for visual learners; pair advanced students with peers.",
          videos: ["Introduction to Variables (YouTube, 10 min)"],
          assignments: ["Worksheet: Simplify 10 expressions"],
          quizzes: ["Quiz: Identify variables vs. constants (5 questions)"],
        },
        {
          week: 2,
          topic: "Algebraic Formulas",
          objectives: "Learn and apply common algebraic formulas.",
          activities: [
            { id: 'act-1', description: "Practice session with formulas (30 min)", type: 'practice' },
            { id: 'act-2', description: "Peer review of formula applications (10 min)", type: 'group-work' },
          ],
          materials: ["Worksheets", "Formula cheat sheets"],
          assessment: "Quiz on formula identification.",
          differentiation: "Offer simplified versions of formulas for struggling students.",
          videos: ["Algebraic Formulas Explained (Khan Academy, 12 min)"],
          assignments: ["Homework: Apply formulas to 5 problems"],
          quizzes: ["Quiz: Match formulas to problems (6 questions)"],
        },
        {
          week: 3,
          topic: "Factorization",
          objectives: "Factor algebraic expressions effectively.",
          activities: [
            { id: 'act-1', description: "Group exercises on factoring (25 min)", type: 'group-work' },
            { id: 'act-2', description: "Whiteboard problem-solving (15 min)", type: 'activity' },
          ],
          materials: ["Textbook", "Whiteboard markers"],
          assessment: "Homework: Factor five expressions.",
          differentiation: "Use manipulatives for kinesthetic learners.",
          videos: ["Factoring Polynomials (YouTube, 15 min)"],
          assignments: ["Worksheet: Factor 8 polynomials"],
          quizzes: ["Quiz: Factor expressions (7 questions)"],
        },
        {
          week: 4,
          topic: "Linear Equations",
          objectives: "Solve linear equations and graph them.",
          activities: [
            { id: 'act-1', description: "Solve linear equations (40 min)", type: 'practice' },
            { id: 'act-2', description: "Graphing activity (20 min)", type: 'activity' },
          ],
          materials: ["Worksheets", "Graph paper"],
          assessment: "In-class graphing task.",
          differentiation: "Provide step-by-step guides for struggling students.",
          videos: ["Solving Linear Equations (Khan Academy, 10 min)"],
          assignments: ["Homework: Solve 5 linear equations"],
          quizzes: ["Quiz: Graph linear equations (5 questions)"],
        },
      ],
    },
  ],
  science: [
    {
      id: 'template-science-1',
      title: "Biology: 9th Grade Curriculum",
      description: "Introduction to biology with focus on cellular concepts.",
      standards: "NGSS.HS-LS1-1",
      weeks: [
        {
          week: 1,
          topic: "Cell Structure",
          objectives: "Identify and describe cell components and their functions.",
          activities: [
            { id: 'act-1', description: "Slideshow and discussion on cells (20 min)", type: 'lecture' },
            { id: 'act-2', description: "Draw and label cell diagram (15 min)", type: 'activity' },
          ],
          materials: ["Slides", "Notebooks", "Colored pencils"],
          assessment: "Cell diagram labeling task.",
          differentiation: "Use 3D cell models for tactile learners.",
          videos: ["Cell Structure Overview (YouTube, 12 min)"],
          assignments: ["Worksheet: Label cell parts"],
          quizzes: ["Quiz: Cell components (5 questions)"],
        },
        {
          week: 2,
          topic: "Cell Division",
          objectives: "Understand mitosis and its stages.",
          activities: [
            { id: 'act-1', description: "Diagram activity on mitosis (25 min)", type: 'activity' },
            { id: 'act-2', description: "Video analysis (15 min)", type: 'activity' },
          ],
          materials: ["Notebooks", "Projector"],
          assessment: "Mitosis stage identification worksheet.",
          differentiation: "Provide animated videos for visual learners.",
          videos: ["Mitosis Explained (Khan Academy, 10 min)"],
          assignments: ["Worksheet: Mitosis stages"],
          quizzes: ["Quiz: Mitosis phases (6 questions)"],
        },
        {
          week: 3,
          topic: "Photosynthesis",
          objectives: "Explain the photosynthesis process and its importance.",
          activities: [
            { id: 'act-1', description: "Lab experiment on plant pigments (30 min)", type: 'lab' },
            { id: 'act-2', description: "Group discussion (15 min)", type: 'discussion' },
          ],
          materials: ["Lab equipment", "Plant samples"],
          assessment: "Lab report submission.",
          differentiation: "Simplify lab instructions for struggling students.",
          videos: ["Photosynthesis Basics (YouTube, 15 min)"],
          assignments: ["Lab report: Photosynthesis"],
          quizzes: ["Quiz: Photosynthesis process (7 questions)"],
        },
        {
          week: 4,
          topic: "Respiration",
          objectives: "Understand cellular respiration and energy production.",
          activities: [
            { id: 'act-1', description: "Lecture on respiration (20 min)", type: 'lecture' },
            { id: 'act-2', description: "Diagram activity (15 min)", type: 'activity' },
          ],
          materials: ["Textbook", "Whiteboard"],
          assessment: "Respiration diagram quiz.",
          differentiation: "Use analogies for complex processes.",
          videos: ["Cellular Respiration (Khan Academy, 12 min)"],
          assignments: ["Worksheet: Respiration diagram"],
          quizzes: ["Quiz: Respiration steps (6 questions)"],
        },
      ],
    },
  ],
  english: [
    {
      id: 'template-english-1',
      title: "Literature: 9th Grade Curriculum",
      description: "Explores literary genres and writing skills.",
      standards: "CCSS.ELA-LITERACY.RL.9-10.1",
      weeks: [
        {
          week: 1,
          topic: "Literary Genres",
          objectives: "Identify and differentiate between literary genres.",
          activities: [
            { id: 'act-1', description: "Discussion on genres (20 min)", type: 'discussion' },
            { id: 'act-2', description: "Genre identification activity (15 min)", type: 'activity' },
          ],
          materials: ["Textbook", "Genre charts"],
          assessment: "Genre identification worksheet.",
          differentiation: "Provide genre examples for visual learners.",
          videos: ["Literary Genres Overview (YouTube, 10 min)"],
          assignments: ["Worksheet: Classify 5 texts"],
          quizzes: ["Quiz: Genre characteristics (5 questions)"],
        },
        {
          week: 2,
          topic: "Short Stories",
          objectives: "Analyze elements of short stories.",
          activities: [
            { id: 'act-1', description: "Read and discuss a short story (30 min)", type: 'activity' },
            { id: 'act-2', description: "Group analysis (15 min)", type: 'group-work' },
          ],
          materials: ["Short story anthology", "Notebooks"],
          assessment: "Short story analysis essay.",
          differentiation: "Offer audio versions for auditory learners.",
          videos: ["Short Story Elements (Khan Academy, 12 min)"],
          assignments: ["Essay: Analyze a short story"],
          quizzes: ["Quiz: Story elements (6 questions)"],
        },
        {
          week: 3,
          topic: "Poetry",
          objectives: "Understand poetic devices and forms.",
          activities: [
            { id: 'act-1', description: "Poetry reading and analysis (25 min)", type: 'activity' },
            { id: 'act-2', description: "Write a poem (15 min)", type: 'activity' },
          ],
          materials: ["Poetry anthology", "Notebooks"],
          assessment: "Poem submission.",
          differentiation: "Provide templates for struggling writers.",
          videos: ["Poetic Devices (YouTube, 10 min)"],
          assignments: ["Write a poem using 3 devices"],
          quizzes: ["Quiz: Identify poetic devices (7 questions)"],
        },
        {
          week: 4,
          topic: "Novels",
          objectives: "Analyze themes and characters in a novel.",
          activities: [
            { id: 'act-1', description: "Read novel excerpt (30 min)", type: 'activity' },
            { id: 'act-2', description: "Character map activity (15 min)", type: 'activity' },
          ],
          materials: ["Novel", "Character templates"],
          assessment: "Character analysis worksheet.",
          differentiation: "Use graphic organizers for visual learners.",
          videos: ["Novel Analysis (Khan Academy, 15 min)"],
          assignments: ["Worksheet: Character analysis"],
          quizzes: ["Quiz: Novel themes (6 questions)"],
        },
      ],
    },
  ],
  history: [
    {
      id: 'template-history-1',
      title: "World History: 9th Grade Curriculum",
      description: "Survey of world history from ancient civilizations.",
      standards: "C3.D2.His.1.9-12",
      weeks: [
        {
          week: 1,
          topic: "Ancient Civilizations",
          objectives: "Understand the development of early societies.",
          activities: [
            { id: 'act-1', description: "Lecture on ancient societies (20 min)", type: 'lecture' },
            { id: 'act-2', description: "Timeline activity (15 min)", type: 'activity' },
          ],
          materials: ["Textbook", "Timeline templates"],
          assessment: "Timeline completion task.",
          differentiation: "Use interactive timelines for tech-savvy students.",
          videos: ["Ancient Civilizations (YouTube, 12 min)"],
          assignments: ["Worksheet: Timeline of civilizations"],
          quizzes: ["Quiz: Ancient societies (5 questions)"],
        },
        {
          week: 2,
          topic: "Classical Greece",
          objectives: "Analyze Greek contributions to culture and politics.",
          activities: [
            { id: 'act-1', description: "Discussion on Greek philosophy (25 min)", type: 'discussion' },
            { id: 'act-2', description: "Map activity (15 min)", type: 'activity' },
          ],
          materials: ["Textbook", "Maps"],
          assessment: "Map annotation task.",
          differentiation: "Provide visual aids for spatial learners.",
          videos: ["Greek Philosophy (Khan Academy, 10 min)"],
          assignments: ["Worksheet: Greek contributions"],
          quizzes: ["Quiz: Greek culture (6 questions)"],
        },
        {
          week: 3,
          topic: "Roman Empire",
          objectives: "Understand the rise and fall of Rome.",
          activities: [
            { id: 'act-1', description: "Lecture on Roman history (20 min)", type: 'lecture' },
            { id: 'act-2', description: "Group project: Roman innovations (20 min)", type: 'group-work' },
          ],
          materials: ["Textbook", "Chart paper"],
          assessment: "Group project presentation.",
          differentiation: "Assign roles based on strengths.",
          videos: ["Roman Empire Overview (YouTube, 15 min)"],
          assignments: ["Project: Roman innovations"],
          quizzes: ["Quiz: Roman history (7 questions)"],
        },
        {
          week: 4,
          topic: "Middle Ages",
          objectives: "Explore feudalism and medieval life.",
          activities: [
            { id: 'act-1', description: "Role-play feudal system (30 min)", type: 'activity' },
            { id: 'act-2', description: "Discussion on medieval culture (15 min)", type: 'discussion' },
          ],
          materials: ["Costumes", "Textbook"],
          assessment: "Role-play reflection essay.",
          differentiation: "Provide scripts for shy students.",
          videos: ["Medieval Life (Khan Academy, 12 min)"],
          assignments: ["Essay: Feudal system"],
          quizzes: ["Quiz: Medieval terms (6 questions)"],
        },
      ],
    },
  ],
  physics: [
    {
      id: 'template-physics-1',
      title: "Physics: 9th Grade Curriculum",
      description: "Introduction to fundamental physics concepts.",
      standards: "NGSS.HS-PS2-1",
      weeks: [
        {
          week: 1,
          topic: "Motion",
          objectives: "Analyze motion using kinematic equations.",
          activities: [
            { id: 'act-1', description: "Lecture on motion (20 min)", type: 'lecture' },
            { id: 'act-2', description: "Motion graphing activity (15 min)", type: 'activity' },
          ],
          materials: ["Textbook", "Graph paper"],
          assessment: "Motion graph analysis.",
          differentiation: "Use simulations for visual learners.",
          videos: ["Kinematics Basics (YouTube, 12 min)"],
          assignments: ["Worksheet: Graph motion data"],
          quizzes: ["Quiz: Kinematic equations (5 questions)"],
        },
        {
          week: 2,
          topic: "Forces",
          objectives: "Understand Newton's laws of motion.",
          activities: [
            { id: 'act-1', description: "Lab on forces (30 min)", type: 'lab' },
            { id: 'act-2', description: "Discussion on applications (15 min)", type: 'discussion' },
          ],
          materials: ["Lab equipment", "Textbook"],
          assessment: "Lab report submission.",
          differentiation: "Simplify lab instructions for struggling students.",
          videos: ["Newton's Laws (Khan Academy, 10 min)"],
          assignments: ["Lab report: Forces"],
          quizzes: ["Quiz: Newton's laws (6 questions)"],
        },
        {
          week: 3,
          topic: "Energy",
          objectives: "Explore types and conservation of energy.",
          activities: [
            { id: 'act-1', description: "Lecture on energy (20 min)", type: 'lecture' },
            { id: 'act-2', description: "Energy calculation activity (20 min)", type: 'activity' },
          ],
          materials: ["Textbook", "Calculators"],
          assessment: "Energy calculation worksheet.",
          differentiation: "Use visual aids for conceptual understanding.",
          videos: ["Energy Conservation (YouTube, 12 min)"],
          assignments: ["Worksheet: Energy calculations"],
          quizzes: ["Quiz: Energy types (7 questions)"],
        },
        {
          week: 4,
          topic: "Momentum",
          objectives: "Understand momentum and collisions.",
          activities: [
            { id: 'act-1', description: "Lab on collisions (30 min)", type: 'lab' },
            { id: 'act-2', description: "Group problem-solving (15 min)", type: 'group-work' },
          ],
          materials: ["Lab equipment", "Worksheets"],
          assessment: "Lab report submission.",
          differentiation: "Provide step-by-step guides for labs.",
          videos: ["Momentum Basics (Khan Academy, 15 min)"],
          assignments: ["Lab report: Collisions"],
          quizzes: ["Quiz: Momentum calculations (6 questions)"],
        },
      ],
    },
  ],
  chemistry: [
    {
      id: 'template-chemistry-1',
      title: "Chemistry: 9th Grade Curriculum",
      description: "Explores the basics of chemical principles.",
      standards: "NGSS.HS-PS1-1",
      weeks: [
        {
          week: 1,
          topic: "Matter",
          objectives: "Understand the properties of matter.",
          activities: [
            { id: 'act-1', description: "Lecture on matter (20 min)", type: 'lecture' },
            { id: 'act-2', description: "Matter classification activity (15 min)", type: 'activity' },
          ],
          materials: ["Textbook", "Samples"],
          assessment: "Matter classification worksheet.",
          differentiation: "Use hands-on samples for tactile learners.",
          videos: ["Properties of Matter (YouTube, 12 min)"],
          assignments: ["Worksheet: Classify matter"],
          quizzes: ["Quiz: Matter types (5 questions)"],
        },
        {
          week: 2,
          topic: "Atomic Structure",
          objectives: "Explore the structure of atoms.",
          activities: [
            { id: 'act-1', description: "Model building activity (25 min)", type: 'activity' },
            { id: 'act-2', description: "Lecture on atomic theory (20 min)", type: 'lecture' },
          ],
          materials: ["Model kits", "Slides"],
          assessment: "Atomic model presentation.",
          differentiation: "Provide pre-built models for motor difficulties.",
          videos: ["Atomic Structure (Khan Academy, 10 min)"],
          assignments: ["Worksheet: Atomic components"],
          quizzes: ["Quiz: Atomic theory (6 questions)"],
        },
        {
          week: 3,
          topic: "Periodic Table",
          objectives: "Understand the organization of the periodic table.",
          activities: [
            { id: 'act-1', description: "Periodic table activity (25 min)", type: 'activity' },
            { id: 'act-2', description: "Group discussion (15 min)", type: 'discussion' },
          ],
          materials: ["Periodic table charts", "Textbook"],
          assessment: "Periodic table worksheet.",
          differentiation: "Use color-coded tables for visual learners.",
          videos: ["Periodic Table Basics (YouTube, 12 min)"],
          assignments: ["Worksheet: Element properties"],
          quizzes: ["Quiz: Periodic table (7 questions)"],
        },
        {
          week: 4,
          topic: "Chemical Bonds",
          objectives: "Analyze types of chemical bonds.",
          activities: [
            { id: 'act-1', description: "Lab on bonding (30 min)", type: 'lab' },
            { id: 'act-2', description: "Bonding diagram activity (15 min)", type: 'activity' },
          ],
          materials: ["Lab equipment", "Worksheets"],
          assessment: "Lab report submission.",
          differentiation: "Simplify lab instructions for struggling students.",
          videos: ["Chemical Bonds (Khan Academy, 15 min)"],
          assignments: ["Lab report: Bonding"],
          quizzes: ["Quiz: Bond types (6 questions)"],
        },
      ],
    },
  ],
  art: [
    {
      id: 'template-art-1',
      title: "Art: 9th Grade Curriculum",
      description: "Introduction to various art forms and techniques.",
      standards: "NCAS.VA.Cr1.1.HSI",
      weeks: [
        {
          week: 1,
          topic: "Drawing Basics",
          objectives: "Master basic drawing techniques.",
          activities: [
            { id: 'act-1', description: "Sketching practice (30 min)", type: 'activity' },
            { id: 'act-2', description: "Peer critique (15 min)", type: 'group-work' },
          ],
          materials: ["Pencils", "Sketchbooks"],
          assessment: "Sketch portfolio review.",
          differentiation: "Provide tracing templates for beginners.",
          videos: ["Drawing Techniques (YouTube, 12 min)"],
          assignments: ["Sketch 5 objects"],
          quizzes: ["Quiz: Drawing terms (5 questions)"],
        },
        {
          week: 2,
          topic: "Color Theory",
          objectives: "Understand color relationships and applications.",
          activities: [
            { id: 'act-1', description: "Color wheel activity (25 min)", type: 'activity' },
            { id: 'act-2', description: "Lecture on color theory (20 min)", type: 'lecture' },
          ],
          materials: ["Paints", "Paper"],
          assessment: "Color wheel submission.",
          differentiation: "Use digital tools for tech-savvy students.",
          videos: ["Color Theory Basics (Khan Academy, 10 min)"],
          assignments: ["Create a color wheel"],
          quizzes: ["Quiz: Color relationships (6 questions)"],
        },
        {
          week: 3,
          topic: "Painting",
          objectives: "Explore painting techniques and styles.",
          activities: [
            { id: 'act-1', description: "Painting practice (30 min)", type: 'activity' },
            { id: 'act-2', description: "Group critique (15 min)", type: 'group-work' },
          ],
          materials: ["Paints", "Canvases"],
          assessment: "Painting submission.",
          differentiation: "Provide simpler brushes for beginners.",
          videos: ["Painting Techniques (YouTube, 12 min)"],
          assignments: ["Paint a landscape"],
          quizzes: ["Quiz: Painting styles (7 questions)"],
        },
        {
          week: 4,
          topic: "Sculpture",
          objectives: "Create basic sculptures using various materials.",
          activities: [
            { id: 'act-1', description: "Sculpture workshop (30 min)", type: 'activity' },
            { id: 'act-2', description: "Material exploration (15 min)", type: 'activity' },
          ],
          materials: ["Clay", "Tools"],
          assessment: "Sculpture submission.",
          differentiation: "Offer pre-shaped molds for beginners.",
          videos: ["Sculpture Basics (Khan Academy, 15 min)"],
          assignments: ["Create a small sculpture"],
          quizzes: ["Quiz: Sculpture materials (6 questions)"],
        },
      ],
    },
  ],
};

// Flatten templates for dropdown and drag-and-drop
const flattenTemplates = (templates) =>
  Object.entries(templates).flatMap(([subjectKey, subjectTemplates]) =>
    subjectTemplates.flatMap(template => [
      { id: template.id, title: template.title, isFullPlan: true, template, subject: subjectKey },
      ...template.weeks.map(week => ({
        id: `week-${template.id}-${week.week}`,
        title: `${template.title} - Week ${week.week}: ${week.topic}`,
        isFullPlan: false,
        week,
        template,
        subject: subjectKey,
      })),
    ])
  );

const PreviewLessonPlan = ({ lessonTitle, lessonStructure }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-center">{lessonTitle}</h1>
      {lessonStructure.length === 0 ? (
        <p className="text-gray-500 text-center">No lesson content to preview.</p>
      ) : (
        lessonStructure.map((item, index) => (
          <div key={item.id} className="mb-6">
            <h2 className="text-lg font-semibold text-teal-600">
              {item.weekTopic ? `${item.weekTopic} - Activity ${index + 1}` : `Activity ${index + 1}: ${item.content}`}
            </h2>
            <div className="ml-4 mt-2 space-y-2">
              {item.activityType && (
                <p><strong>Type:</strong> {item.activityType}</p>
              )}
              {item.objectives && (
                <p><strong>Objectives:</strong> {item.objectives}</p>
              )}
              {item.materials && (
                <p><strong>Materials:</strong> {item.materials.join(', ')}</p>
              )}
              {item.assessment && (
                <p><strong>Assessment:</strong> {item.assessment}</p>
              )}
              {item.differentiation && (
                <p><strong>Differentiation:</strong> {item.differentiation}</p>
              )}
              {item.videos && item.videos.length > 0 && (
                <p><strong>Videos:</strong> {item.videos.join(', ')}</p>
              )}
              {item.assignments && item.assignments.length > 0 && (
                <p><strong>Assignments:</strong> {item.assignments.join(', ')}</p>
              )}
              {item.quizzes && item.quizzes.length > 0 && (
                <p><strong>Quizzes:</strong> {item.quizzes.join(', ')}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const LessonPlan = () => {
  const [lessonTitle, setLessonTitle] = useState("New Lesson Plan");
  const [lessonStructure, setLessonStructure] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replaceStructure, setReplaceStructure] = useState(false);
  const [activeSubject, setActiveSubject] = useState(null);
  const [templates, setTemplates] = useState(initialTemplates);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      console.warn('OpenAI API key is not set.');
    }
  }, []);

  // Load templates from backend on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.get('templates/');
        const backendTemplates = response.data.reduce((acc, template) => {
          if (!acc[template.subject]) {
            acc[template.subject] = [];
          }
          acc[template.subject].push(template);
          return acc;
        }, {});
        setTemplates(prev => ({ ...prev, ...backendTemplates }));
        addNotification('Templates loaded from server!', 'success');
      } catch (error) {
        addNotification('Failed to load templates: ' + error.message, 'error');
        console.error('Template fetch error:', error);
      }
    };
    fetchTemplates();
  }, []);

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const filteredTemplates = useMemo(() => {
    const allItems = Object.entries(templates).flatMap(([subjectKey, subjectTemplates]) =>
      subjectTemplates.flatMap(template => [
        { type: 'template', id: `template-${template.id}`, title: template.title, template, subject: subjectKey },
        ...template.weeks.map(week => ({
          type: 'week', id: `week-${template.id}-${week.week}`, title: `${template.title} - Week ${week.week}: ${week.topic}`, week, subject: subjectKey,
        })),
      ])
    );
    if (!searchQuery && !selectedSubject) return allItems;
    return allItems.filter(item => {
      const matchesSearch = item.type === 'template'
        ? item.title.toLowerCase().includes(searchQuery.toLowerCase())
        : (item.week.topic.toLowerCase().includes(searchQuery.toLowerCase()) || item.week.objectives.toLowerCase().includes(searchQuery.toLowerCase()) || item.title.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSubject = selectedSubject === '' || item.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [searchQuery, selectedSubject, templates]);

  const onDragStart = () => setIsDragging(true);
  const onDragEnd = useCallback((event) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over) return;

    if (active.data.current?.type === 'lesson-item' && over.data.current?.type === 'lesson-item') {
      setLessonStructure(prev => {
        const oldIndex = prev.findIndex(item => item.id === active.id);
        const newIndex = prev.findIndex(item => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const result = Array.from(prev);
        const [removed] = result.splice(oldIndex, 1);
        result.splice(newIndex, 0, removed);
        return result;
      });
      return;
    }

    if (over.id === 'lesson-structure') {
      if (active.data.current?.type === 'outline-topic') {
        const draggedTopic = sampleOutline.topics.find(topic => topic.id === active.id);
        if (draggedTopic) {
          const newItem = { id: `lesson-item-${Date.now()}`, type: 'topic', content: draggedTopic.title };
          setLessonStructure(prev => (replaceStructure ? [newItem] : [...prev, newItem]));
          addNotification('Topic added to lesson plan!', 'success');
        }
        return;
      }

      if (active.data.current?.type.startsWith('template-')) {
        const allTemplatesFlat = Object.values(templates).flat();
        if (active.data.current?.type === 'template-template') {
          const templateId = active.id.replace('template-', '');
          const template = allTemplatesFlat.find(t => t.id === templateId);
          if (template) {
            const activities = template.weeks.flatMap((week, weekIdx) =>
              week.activities.map((act, actIdx) => ({
                id: `activity-${templateId}-week${week.week}-${actIdx}-${Date.now()}`,
                type: 'activity',
                content: act.description,
                activityType: act.type,
                objectives: week.objectives,
                materials: week.materials,
                weekTopic: `Week ${week.week}: ${week.topic}`,
                assessment: week.assessment,
                differentiation: week.differentiation,
                videos: week.videos,
                assignments: week.assignments,
                quizzes: week.quizzes,
              }))
            );
            setLessonStructure(prev => (replaceStructure ? activities : [...prev, ...activities]));
            setLessonTitle(template.title);
            addNotification('Template applied successfully!', 'success');
          }
          return;
        }

        if (active.data.current?.type === 'template-week') {
          const [, , templateId, weekNum] = active.id.split('-');
          let draggedWeek = null;
          let templateTitle = '';
          for (const template of allTemplatesFlat) {
            if (template.id === templateId) {
              draggedWeek = template.weeks.find(w => w.week === parseInt(weekNum));
              templateTitle = template.title;
              break;
            }
          }
          if (draggedWeek) {
            const activities = draggedWeek.activities.map((act, idx) => ({
              id: `activity-${active.id}-${idx}-${Date.now()}`,
              type: 'activity',
              content: act.description,
              activityType: act.type,
              objectives: draggedWeek.objectives,
              materials: draggedWeek.materials,
              weekTopic: `Week ${draggedWeek.week}: ${draggedWeek.topic}`,
              assessment: draggedWeek.assessment,
              differentiation: draggedWeek.differentiation,
              videos: draggedWeek.videos,
              assignments: draggedWeek.assignments,
              quizzes: draggedWeek.quizzes,
            }));
            setLessonStructure(prev => (replaceStructure ? activities : [...prev, ...activities]));
            setLessonTitle(`${templateTitle} - Week ${draggedWeek.week}`);
            addNotification('Week added to lesson plan!', 'success');
          }
        }
      }
    }
  }, [replaceStructure, templates]);

  const handleFileChange = async (file) => {
    if (!file || !['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setErrorMessage(file ? 'File type or size invalid (PDF, TXT, DOCX up to 5MB)' : 'No file selected.');
      setSelectedFile(null);
      addNotification(file ? 'File type or size invalid (PDF, TXT, DOCX up to 5MB)' : 'No file selected.', 'error');
      return;
    }
    setSelectedFile(file);
    setErrorMessage('');
    addNotification('File selected successfully!', 'success');
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId || null);
    setErrorMessage('');
    addNotification(templateId ? 'Template selected successfully!' : 'Template selection cleared!', 'success');
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setSelectedTemplate(null);
    setErrorMessage('');
    fileInputRef.current.value = null;
    addNotification('Selection cleared!', 'success');
  };

  // Save lesson plan to backend
  const saveLessonPlan = async () => {
    try {
      const response = await api.post('lesson-plans/', {
        title: lessonTitle,
        structure: lessonStructure,
      });
      addNotification('Lesson plan saved successfully!', 'success');
      return response.data.id;
    } catch (error) {
      addNotification('Failed to save lesson plan: ' + error.message, 'error');
      console.error('Save lesson plan error:', error);
      throw error;
    }
  };

  const generateLessonPlan = async () => {
    if (!selectedFile && !selectedTemplate) {
      setErrorMessage('Please select a file or a template.');
      addNotification('Please select a file or a template.', 'error');
      return;
    }

    try {
      let result;
      if (selectedFile) {
        let extractedText = '';
        if (selectedFile.type === 'application/pdf') {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            text += (await page.getTextContent()).items.map(item => item.str).join(' ') + '\n';
          }
          extractedText = text;
        } else if (selectedFile.type === 'text/plain') {
          extractedText = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsText(selectedFile);
          });
        } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const arrayBuffer = await selectedFile.arrayBuffer();
          extractedText = (await mammoth.extractRawText({ arrayBuffer })).value;
        }

        if (selectedTemplate) {
          const allTemplatesFlat = Object.values(templates).flat();
          const template = allTemplatesFlat.find(t => t.id === selectedTemplate);
          if (!template) {
            setErrorMessage('Selected template not found.');
            addNotification('Selected template not found.', 'error');
            return;
          }

          const templateStructure = {
            title: template.title,
            weeks: template.weeks.map(week => ({
              week: week.week,
              topic: "string",
              objectives: "string",
              activities: week.activities.map(act => ({
                id: `act-${week.week}-${act.id}`,
                description: "string",
                type: act.type,
              })),
              materials: ["string"],
              assessment: "string",
              differentiation: "string",
              videos: ["string"],
              assignments: ["string"],
              quizzes: ["string"],
            })),
          };

          const prompt = `
Generate a detailed 4-week lesson plan based on the following content: "${extractedText}".
Use the provided template structure to format the lesson plan exactly, filling in the content based on the provided text.
The lesson plan must have the same fields and structure as the template, including a title, weekly topics, objectives, activities with types, materials, assessments, differentiation strategies, videos, assignments, and quizzes.
Template structure (JSON schema):
${JSON.stringify(templateStructure, null, 2)}
Format the output as JSON with the structure: 
{
  "title": "${template.title}",
  "weeks": [
    {
      "week": number,
      "topic": "string",
      "objectives": "string",
      "activities": [
        {
          "id": "string",
          "description": "string",
          "type": "string"
        }
      ],
      "materials": ["string"],
      "assessment": "string",
      "differentiation": "string",
      "videos": ["string"],
      "assignments": ["string"],
      "quizzes": ["string"]
    }
  ]
}
Ensure the content is derived from the provided text and aligns with the template's subject and standards.
`;
          const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
          });

          result = JSON.parse(response.choices[0].message.content);
        } else {
          const prompt = `
Generate a detailed 4-week lesson plan based on the following content: "${extractedText}".
Include a title, weekly topics, objectives, activities with types (e.g., lecture, activity), materials, assessments, differentiation strategies, videos, assignments, and quizzes.
Format as JSON with structure: 
{
  "title": "string",
  "weeks": [
    {
      "week": number,
      "topic": "string",
      "objectives": "string",
      "activities": [
        {
          "id": "string",
          "description": "string",
          "type": "string"
        }
      ],
      "materials": ["string"],
      "assessment": "string",
      "differentiation": "string",
      "videos": ["string"],
      "assignments": ["string"],
      "quizzes": ["string"]
    }
  ]
}
`;
          const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
          });

          result = JSON.parse(response.choices[0].message.content);
        }
      } else if (selectedTemplate) {
        const allTemplatesFlat = Object.values(templates).flat();
        const template = allTemplatesFlat.find(t => t.id === selectedTemplate);
        if (!template) {
          setErrorMessage('Selected template not found.');
          addNotification('Selected template not found.', 'error');
          return;
        }
        result = {
          title: template.title,
          weeks: template.weeks,
        };
      }

      setLessonTitle(result.title);
      const activities = result.weeks.flatMap((week, weekIdx) =>
        week.activities.map((act, actIdx) => ({
          id: `generated-${Date.now()}-${weekIdx}-${actIdx}`,
          type: 'activity',
          content: act.description,
          activityType: act.type,
          objectives: week.objectives,
          materials: week.materials,
          weekTopic: `Week ${week.week}: ${week.topic}`,
          assessment: week.assessment,
          differentiation: week.differentiation,
          videos: week.videos,
          assignments: week.assignments,
          quizzes: week.quizzes,
        }))
      );
      setLessonStructure(activities);
      setPreviewVisible(true);
      setErrorMessage('');

      // Save to backend
      await saveLessonPlan();
    } catch (error) {
      const errorMsg = 'Error generating lesson plan: ' + (error.message || 'Unknown error');
      setErrorMessage(errorMsg);
      addNotification(errorMsg, 'error');
      console.error('Generation error:', error);
    }
  };

  const downloadLessonPlan = async () => {
    if (lessonStructure.length === 0) {
      setErrorMessage('No lesson plan to download.');
      addNotification('No lesson plan to download.', 'error');
      return;
    }
    try {
      // Save to backend before downloading
      await saveLessonPlan();

      const doc = new jsPDF();
      let yOffset = 20;
      doc.setFontSize(16).setFont('helvetica', 'bold').text(lessonTitle, 20, yOffset);
      yOffset += 10;
      doc.setFontSize(12).setFont('helvetica', 'normal');
      lessonStructure.forEach((item, index) => {
        const titleText = item.weekTopic ? `${item.weekTopic} - ${item.content}` : item.content;
        const lines = doc.splitTextToSize(`${index + 1}. ${titleText}`, 170);
        doc.text(lines, 20, yOffset);
        yOffset += lines.length * 7;
        if (item.activityType) doc.text(`Type: ${item.activityType}`, 25, yOffset += 7);
        if (item.objectives) {
          const objLines = doc.splitTextToSize(`Objectives: ${item.objectives}`, 165);
          doc.text(objLines, 25, yOffset);
          yOffset += objLines.length * 7;
        }
        if (item.materials) {
          const matLines = doc.splitTextToSize(`Materials: ${item.materials.join(', ')}`, 165);
          doc.text(matLines, 25, yOffset);
          yOffset += matLines.length * 7;
        }
        if (item.assessment) {
          const assLines = doc.splitTextToSize(`Assessment: ${item.assessment}`, 165);
          doc.text(assLines, 25, yOffset);
          yOffset += assLines.length * 7;
        }
        if (item.differentiation) {
          const diffLines = doc.splitTextToSize(`Differentiation: ${item.differentiation}`, 165);
          doc.text(diffLines, 25, yOffset);
          yOffset += diffLines.length * 7;
        }
        if (item.videos && item.videos.length > 0) {
          const vidLines = doc.splitTextToSize(`Videos: ${item.videos.join(', ')}`, 165);
          doc.text(vidLines, 25, yOffset);
          yOffset += vidLines.length * 7;
        }
        if (item.assignments && item.assignments.length > 0) {
          const assigLines = doc.splitTextToSize(`Assignments: ${item.assignments.join(', ')}`, 165);
          doc.text(assigLines, 25, yOffset);
          yOffset += assigLines.length * 7;
        }
        if (item.quizzes && item.quizzes.length > 0) {
          const quizLines = doc.splitTextToSize(`Quizzes: ${item.quizzes.join(', ')}`, 165);
          doc.text(quizLines, 25, yOffset);
          yOffset += quizLines.length * 7;
        }
        if (yOffset > 270) { doc.addPage(); yOffset = 20; }
        yOffset += 5;
      });
      const sanitizedTitle = lessonTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`${sanitizedTitle}_lesson_plan.pdf`);
      setErrorMessage('');
      addNotification('Lesson plan downloaded successfully!', 'success');
    } catch (error) {
      const errorMsg = 'Error downloading lesson plan: ' + (error.message || 'Unknown error');
      setErrorMessage(errorMsg);
      addNotification(errorMsg, 'error');
      console.error('Download error:', error);
    }
  };

  const handleTemplateClick = (templateId) => {
    const selectedTemplate = flattenTemplates(templates).find(t => t.id === templateId);
    if (!selectedTemplate || !selectedTemplate.isFullPlan) return;
    setLessonTitle(selectedTemplate.title);
    setLessonStructure(
      selectedTemplate.template.weeks.flatMap((week, weekIdx) =>
        week.activities.map((act, actIdx) => ({
          id: `activity-${selectedTemplate.id}-week${week.week}-${actIdx}-${Date.now()}`,
          type: 'activity',
          content: act.description,
          activityType: act.type,
          objectives: week.objectives,
          materials: week.materials,
          weekTopic: `Week ${week.week}: ${week.topic}`,
          assessment: week.assessment,
          differentiation: week.differentiation,
          videos: week.videos,
          assignments: week.assignments,
          quizzes: week.quizzes,
        }))
      )
    );
    setErrorMessage('');
    addNotification('Template applied successfully!', 'success');
  };

  const toggleSubjectTemplates = (subject) => {
    setActiveSubject(activeSubject === subject ? null : subject);
  };

  const startEditing = (item) => { setEditingItemId(item.id); setEditContent(item.content); };
  const saveEdit = (itemId) => {
    setLessonStructure(prev => prev.map(item => item.id === itemId ? { ...item, content: editContent } : item));
    setEditingItemId(null);
    setEditContent('');
    addNotification('Lesson item updated successfully!', 'success');
  };
  const cancelEdit = () => { setEditingItemId(null); setEditContent(''); };

  const startEditingTemplate = (templateId, weekNum = null) => {
    const subject = Object.keys(templates).find(subj =>
      templates[subj].some(t => t.id === templateId)
    );
    const template = templates[subject].find(t => t.id === templateId);
    if (weekNum) {
      const week = template.weeks.find(w => w.week === weekNum);
      setEditingTemplate({
        subject,
        templateId,
        weekNum,
        data: { ...week },
      });
    } else {
      setEditingTemplate({
        subject,
        templateId,
        data: { ...template },
      });
    }
  };

  const updateTemplate = (e) => {
    e.preventDefault();
    setTemplates(prev => {
      const newTemplates = { ...prev };
      const subjectTemplates = [...newTemplates[editingTemplate.subject]];
      const templateIndex = subjectTemplates.findIndex(t => t.id === editingTemplate.templateId);
      if (editingTemplate.weekNum) {
        const weekIndex = subjectTemplates[templateIndex].weeks.findIndex(w => w.week === editingTemplate.weekNum);
        subjectTemplates[templateIndex].weeks[weekIndex] = { ...editingTemplate.data };
      } else {
        subjectTemplates[templateIndex] = { ...editingTemplate.data };
      }
      newTemplates[editingTemplate.subject] = subjectTemplates;
      return newTemplates;
    });
    setEditingTemplate(null);
    addNotification('Template updated successfully!', 'success');
  };

  const handleTemplateFieldChange = (field, value, activityId = null) => {
    setEditingTemplate(prev => {
      const newData = { ...prev.data };
      if (activityId) {
        const activityIndex = newData.activities.findIndex(act => act.id === activityId);
        newData.activities[activityIndex] = { ...newData.activities[activityIndex], [field]: value };
      } else if (field === 'videos' || field === 'assignments' || field === 'quizzes' || field === 'materials') {
        newData[field] = value.split(',').map(item => item.trim());
      } else {
        newData[field] = value;
      }
      return { ...prev, data: newData };
    });
  };

  const handleSubjectChange = (e) => { setSelectedSubject(e.target.value); setSearchQuery(''); };
  const togglePreview = () => setPreviewVisible(v => !v);
  const clearLessonStructure = () => {
    if (window.confirm('Are you sure?')) {
      setLessonStructure([]);
      addNotification('Lesson structure cleared!', 'success');
    }
  };

  const SortableItem = ({ id, children, type }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type } });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return <li ref={setNodeRef} style={style} {...attributes} {...listeners}>{children}</li>;
  };

  const DroppableLessonStructure = ({ children, id }) => {
    const { setNodeRef, isOver } = useDroppable({ id, data: { droppableId: id } });
    return <ul ref={setNodeRef} className={`space-y-4 min-h-[120px] p-4 rounded-lg ${isOver ? 'bg-teal-200' : 'bg-gray-50'}`}>{children}</ul>;
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-100 flex flex-col font-sans">
        <style>
          {`
            .swipe-in {
              transform: translateX(0);
              opacity: 1;
              transition: transform 0.3s ease-out, opacity 0.3s ease-out;
            }
            .swipe-out {
              transform: translateX(100%);
              opacity: 0;
              transition: transform 0.3s ease-in, opacity 0.3s ease-in;
            }
            .animate-fade-in {
              animation: fadeIn 0.5s ease-in;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}
        </style>

        {/* Notifications */}
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg text-white flex items-center space-x-2 animate-fade-in ${
                notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              <span>{notification.message}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <header className="bg-teal-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="text-xl font-bold bg-transparent border-b border-white focus:outline-none"
            />
            <div className="space-x-4">
              <button
                onClick={togglePreview}
                className="bg-white text-teal-600 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                {previewVisible ? 'Show Editor' : 'Show Preview'}
              </button>
              <button
                onClick={downloadLessonPlan}
                className="bg-white text-teal-600 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Download PDF
              </button>
              <button
                onClick={clearLessonStructure}
                className="bg-white text-teal-600 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Clear Plan
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto flex flex-1 p-6 space-x-6">
          {/* Sidebar */}
          <aside className="w-1/4 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Templates & Outlines</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Subject</label>
              <select
                value={selectedSubject}
                onChange={handleSubjectChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">All Subjects</option>
                {Object.keys(templates).map(subject => (
                  <option key={subject} value={subject}>{subject.charAt(0).toUpperCase() + subject.slice(1)}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
            />
            <div className="space-y-4">
              {Object.keys(templates).map(subject => (
                <div key={subject}>
                  <button
                    onClick={() => toggleSubjectTemplates(subject)}
                    className="w-full text-left font-semibold text-teal-600 hover:text-teal-800 flex items-center space-x-2"
                  >
                    <img src={subjectImages[subject]} alt={subject} className="w-8 h-8 rounded-full" />
                    <span>{subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                    <span>{activeSubject === subject ? '▼' : '▶'}</span>
                  </button>
                  {activeSubject === subject && (
                    <ul className="ml-4 mt-2 space-y-2">
                      {filteredTemplates
                        .filter(item => item.subject === subject)
                        .map(item => (
                          <SortableItem key={item.id} id={item.id} type={`template-${item.type}`}>
                            <li
                              className={`p-2 rounded-lg cursor-pointer hover:bg-teal-100 ${
                                item.type === 'template' ? 'font-semibold' : 'ml-4'
                              }`}
                              onClick={() => item.type === 'template' && handleTemplateClick(item.id.replace('template-', ''))}
                            >
                              {item.title}
                              {item.type === 'template' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingTemplate(item.id.replace('template-', ''));
                                  }}
                                  className="ml-2 text-blue-600 hover:underline"
                                >
                                  Edit
                                </button>
                              )}
                            </li>
                          </SortableItem>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
              <div>
                <h3 className="font-semibold text-teal-600">Sample Outline</h3>
                <ul className="ml-4 mt-2 space-y-2">
                  {sampleOutline.topics.map(topic => (
                    <SortableItem key={topic.id} id={topic.id} type="outline-topic">
                      <li className="p-2 rounded-lg cursor-pointer hover:bg-teal-100">
                        {topic.title}
                      </li>
                    </SortableItem>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Editor / Preview */}
          <main className="w-3/4">
            {previewVisible ? (
              <PreviewLessonPlan lessonTitle={lessonTitle} lessonStructure={lessonStructure} />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-lg font-semibold mb-4 text-teal-600">Lesson Plan Editor</h1>
                {/* Generate Lesson Plan Section */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-teal-700 mb-2">Create Lesson Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (PDF, TXT, DOCX)</label>
                      <input
                        type="file"
                        accept=".pdf,.txt,.docx"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                        ref={fileInputRef}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-teal-700 mb-2">Select Template</label>
                      <select
                        value={selectedTemplate || ''}
                        onChange={handleTemplateChange}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">Select a template</option>
                        {flattenTemplates(templates)
                          .filter(t => t.isFullPlan)
                          .map(t => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={generateLessonPlan}
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
                    >
                      Generate Lesson Plan
                    </button>
                    <button
                      onClick={clearSelection}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Clear
                    </button>
                  </div>
                  {errorMessage && (
                    <p className="text-red-600 mt-2">{errorMessage}</p>
                  )}
                </div>
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={replaceStructure}
                    onChange={(e) => setReplaceStructure(e.target.checked)}
                    className="mr-2"
                  />
                  Replace existing structure
                </label>
                <DroppableLessonStructure id="lesson-structure">
                  {lessonStructure.length === 0 ? (
                    <p className="text-gray-500 text-center">Drag and drop templates, weeks, or topics here.</p>
                  ) : (
                    <SortableContext items={lessonStructure.map(item => item.id)} strategy={verticalListSortingStrategy}>
                      {lessonStructure.map(item => (
                        <SortableItem key={item.id} id={item.id} type="lesson-item">
                          <li className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                            {editingItemId === item.id ? (
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full p-2 border rounded-lg"
                                />
                                <div className="mt-2 space-x-2">
                                  <button
                                    onClick={() => saveEdit(item.id)}
                                    className="bg-teal-600 text-white px-3 py-1 rounded-lg"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span>{item.weekTopic ? `${item.weekTopic} - ${item.content}` : item.content}</span>
                                <button
                                  onClick={() => startEditing(item)}
                                  className="text-blue-600 hover:underline"
                                >
                                  Edit
                                </button>
                              </>
                            )}
                          </li>
                        </SortableItem>
                      ))}
                    </SortableContext>
                  )}
                </DroppableLessonStructure>
              </div>
            )}
          </main>
        </div>

        {/* Edit Template Form */}
        {editingTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
              <EditTemplateForm
                template={editingTemplate.data}
                onSave={updateTemplate}
                onCancel={() => setEditingTemplate(null)}
                onFieldChange={handleTemplateFieldChange}
                isWeek={!!editingTemplate.weekNum}
              />
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
};

export default LessonPlan;