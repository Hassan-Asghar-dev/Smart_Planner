import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase.js';
import { FaFolder } from 'react-icons/fa';

// Mock UUID generator for share links
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Mock initial files with enhanced permissions and shareLinks, including a generated curriculum
const initialFiles = [
  {
    id: 1,
    name: "Math_Curriculum.pdf",
    title: "Mathematics Curriculum",
    author: "Admin",
    uploadedBy: "Admin",
    date: "2025-05-01",
    permissions: {
      Admin: { read: true, write: true, delete: true },
      Teacher: { read: true, write: true, delete: false },
      Student: { read: true, write: false, delete: false },
    },
    history: [
      {
        version: 1,
        date: "2025-05-01",
        changes: "Initial upload",
        state: { name: "Math_Curriculum.pdf", title: "Mathematics Curriculum", type: "pdf", content: "This is a sample math curriculum covering algebra and geometry." },
      },
      {
        version: 2,
        date: "2025-05-02",
        changes: "Updated content",
        state: { name: "Math_Curriculum.pdf", title: "Mathematics Curriculum", type: "pdf", content: "Updated math curriculum with calculus." },
      },
      {
        version: 3,
        date: "2025-05-03",
        changes: "Added statistics",
        state: { name: "Math_Curriculum.pdf", title: "Mathematics Curriculum", type: "pdf", content: "Math curriculum with algebra, geometry, calculus, and statistics." },
      },
      {
        version: 4,
        date: "2025-05-04",
        changes: "Revised structure",
        state: { name: "Math_Curriculum.pdf", title: "Mathematics Curriculum", type: "pdf", content: "Revised curriculum structure with detailed sections." },
      },
      {
        version: 5,
        date: "2025-05-05",
        changes: "Added examples",
        state: { name: "Math_Curriculum.pdf", title: "Mathematics Curriculum", type: "pdf", content: "Curriculum with examples for algebra and calculus." },
      },
    ],
    type: "pdf",
    tags: ["Math", "Algebra"],
    content: "Math curriculum with algebra, geometry, calculus, and statistics.",
    course: "Math 101",
    department: "Mathematics",
    semester: "Fall 2025",
    subject: "Algebra",
    class: "Class A",
    category: "Curriculum",
    auditLogs: [{ timestamp: "2025-05-01T10:00:00Z", user: "Admin", action: "uploaded" }],
    shareLinks: [],
  },
  {
    id: 2,
    name: "Science_Quiz.docx",
    title: "Science Quiz",
    author: "Teacher",
    uploadedBy: "Teacher",
    date: "2025-05-02",
    permissions: {
      Admin: { read: true, write: true, delete: true },
      Teacher: { read: true, write: true, delete: false },
      Student: { read: true, write: false, delete: false },
    },
    history: [{
      version: 1,
      date: "2025-05-02",
      changes: "Initial upload",
      state: { name: "Science_Quiz.docx", title: "Science Quiz", type: "docx", content: "Science quiz including biology topics." },
    }],
    type: "docx",
    tags: ["Science", "Biology"],
    content: "Science quiz including biology topics.",
    course: "Biology 201",
    department: "Science",
    semester: "Spring 2025",
    subject: "Biology",
    class: "Class B",
    category: "Quizzes",
    auditLogs: [{ timestamp: "2025-05-02T12:00:00Z", user: "Teacher", action: "uploaded" }],
    shareLinks: [],
  },
  {
    id: 3,
    name: "History_Assignment.pdf",
    title: "World War II Assignment",
    author: "Teacher",
    uploadedBy: "Teacher",
    date: "2025-05-03",
    permissions: {
      Admin: { read: true, write: true, delete: true },
      Teacher: { read: true, write: true, delete: false },
      Student: { read: true, write: false, delete: false },
    },
    history: [{
      version: 1,
      date: "2025-05-03",
      changes: "Initial upload",
      state: { name: "History_Assignment.pdf", title: "World War II Assignment", type: "pdf", content: "Assignment on World War II events and impacts." },
    }],
    type: "pdf",
    tags: ["History", "World War II"],
    content: "Assignment on World War II events and impacts.",
    course: "History 101",
    department: "History",
    semester: "Fall 2025",
    subject: "World History",
    class: "Class A",
    category: "Assignments",
    auditLogs: [{ timestamp: "2025-05-03T14:00:00Z", user: "Teacher", action: "uploaded" }],
    shareLinks: [],
  },
  {
    id: 4,
    name: "Generated_Curriculum_1.pdf",
    title: "Generated Curriculum 1",
    author: "Admin",
    uploadedBy: "Admin",
    date: "2025-05-04",
    permissions: {
      Admin: { read: true, write: true, delete: true },
      Teacher: { read: true, write: true, delete: false },
      Student: { read: true, write: false, delete: false },
    },
    history: [{
      version: 1,
      date: "2025-05-04",
      changes: "Generated curriculum",
      state: { name: "Generated_Curriculum_1.pdf", title: "Generated Curriculum 1", type: "pdf", content: "Mock generated curriculum content for BSc in Computer Science covering topics: Algorithms, Data Structures." },
    }],
    type: "pdf",
    tags: ["Generated", "Curriculum"],
    content: "Mock generated curriculum content for BSc in Computer Science covering topics: Algorithms, Data Structures.",
    course: "General Studies",
    department: "General",
    semester: "Fall 2025",
    subject: "General",
    class: "Class A",
    category: "Curriculum",
    auditLogs: [{ timestamp: "2025-05-04T10:00:00Z", user: "Admin", action: "generated" }],
    shareLinks: [],
  },
];

// File History Component with Scrollbar
const FileHistory = ({ history, onRollback }) => {
  return (
    <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
      {history.map(entry => (
        <div key={entry.version} className="p-3 bg-gray-50 rounded border">
          <p className="font-semibold text-gray-800">Version {entry.version}</p>
          <p className="text-sm text-gray-600">Date: {entry.date}</p>
          <p className="text-sm text-gray-600">Changes: {entry.changes}</p>
          <p className="text-sm text-gray-600">File Name: {(entry.state && entry.state.name) || "Unknown"}</p>
          <p className="text-sm text-gray-600">Title: {(entry.state && entry.state.title) || "Untitled"}</p>
          <button
            onClick={() => onRollback(entry.version)}
            className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            Rollback to Version {entry.version}
          </button>
        </div>
      ))}
    </div>
  );
};

// Audit Logs Component
const AuditLogs = ({ logs }) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-800">Audit Logs</h3>
      {logs.map((log, index) => (
        <div key={index} className="p-3 bg-gray-50 rounded border">
          <p className="text-sm text-gray-600">Timestamp: {new Date(log.timestamp).toLocaleString()}</p>
          <p className="text-sm text-gray-600">User: {log.user}</p>
          <p className="text-sm text-gray-600">Action: {log.action}</p>
        </div>
      ))}
    </div>
  );
};

// Share File Component
const ShareFile = ({ file, onGenerateLink, onAccessLink }) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-800">Share File</h3>
      <button
        onClick={() => onGenerateLink(file.id)}
        className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600"
      >
        Generate Share Link
      </button>
      {file.shareLinks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Active Share Links</h4>
          {file.shareLinks.map(link => (
            <div key={link.linkId} className="p-3 bg-gray-50 rounded border">
              <p className="text-sm text-gray-600">Link: {link.url}</p>
              <p className="text-sm text-gray-600">
                Expires: {new Date(link.expiresAt).toLocaleString()}
                {new Date(link.expiresAt) < new Date() && " (Expired)"}
              </p>
              <button
                onClick={() => onAccessLink(file.id, link.linkId)}
                disabled={new Date(link.expiresAt) < new Date()}
                className={`mt-2 px-3 py-1 rounded text-white ${new Date(link.expiresAt) < new Date() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                Access Link
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Access Permissions Component
const AccessPermissions = ({ file, onUpdatePermissions }) => {
  const roles = ["Admin", "Teacher", "Student"];
  const permissions = ["read", "write", "delete"];

  const handleToggle = (role, permission) => {
    const updatedPermissions = {
      ...file.permissions,
      [role]: {
        ...file.permissions[role],
        [permission]: !file.permissions[role][permission],
      },
    };
    onUpdatePermissions(file.id, updatedPermissions);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="font-semibold text-gray-800 mb-2">Manage Permissions for {file.name}</h3>
      <div className="space-y-4">
        {roles.map(role => (
          <div key={role} className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium w-24">{role}</span>
            {permissions.map(permission => (
              <label key={permission} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={file.permissions[role][permission]}
                  onChange={() => handleToggle(role, permission)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700 capitalize">{permission}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const FileManager = () => {
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('files');
    const loadedFiles = saved ? JSON.parse(saved) : initialFiles;
    return loadedFiles.map(file => {
      const history = (file.history || [{ version: 1, date: file.date || new Date().toISOString().split('T')[0], changes: "Initial upload" }]).map(entry => ({
        ...entry,
        state: entry.state || {
          name: file.name || "Unknown",
          title: file.title || "Untitled",
          type: file.type || "pdf",
          content: file.content || `Mock content for ${file.name || "Unknown"}`,
        },
      }));
      const permissions = file.permissions || {
        Admin: { read: true, write: true, delete: true },
        Teacher: { read: (file.roleAccess || []).includes("Teacher"), write: (file.roleAccess || []).includes("Teacher"), delete: false },
        Student: { read: (file.roleAccess || []).includes("Student"), write: false, delete: false },
      };
      return {
        ...file,
        tags: file.tags || [],
        permissions,
        title: file.title || file.name || "Untitled",
        author: file.author || file.uploadedBy || "Unknown",
        type: file.type || (file.name ? file.name.split('.').pop().toLowerCase() : "pdf"),
        content: file.content || `Mock content for ${file.name || "Unknown"}`,
        course: file.course || "",
        department: file.department || "",
        semester: file.semester || "",
        subject: file.subject || "",
        class: file.class || "",
        category: file.category || "Curriculum",
        auditLogs: file.auditLogs || [],
        history,
        shareLinks: file.shareLinks || [],
      };
    });
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPermissions, setShowPermissions] = useState(null);
  const [userRole, setUserRole] = useState("Student");
  const [filters, setFilters] = useState({
    type: "",
    dateRange: "",
    uploader: "",
    tag: "",
    course: "",
    department: "",
    semester: "",
    subject: "",
    class: "",
    category: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    type: "",
    dateRange: "",
    uploader: "",
    tag: "",
    course: "",
    department: "",
    semester: "",
    subject: "",
    class: "",
    category: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    title: "",
    tags: "",
    course: "",
    department: "",
    semester: "",
    subject: "",
    class: "",
    category: "Curriculum",
  });
  const [showUploadedFiles, setShowUploadedFiles] = useState(false);

  // Get user role from Firebase auth
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const role = user.role || "Student";
      console.log("User Role:", role);
      setUserRole(role);
    } else {
      console.log("No user logged in, defaulting to Student");
      setUserRole("Student");
    }
  }, []);

  // Persist files to localStorage
  useEffect(() => {
    localStorage.setItem('files', JSON.stringify(files));
  }, [files]);

  // Log action to audit logs
  const logAction = (fileId, action) => {
    setFiles(files.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          auditLogs: [
            ...file.auditLogs,
            { timestamp: new Date().toISOString(), user: userRole, action },
          ],
        };
      }
      return file;
    }));
  };

  // Handle file upload form input changes
  const handleUploadFormChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    setUploadForm(prev => ({ ...prev, file: e.target.files[0] }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    e.preventDefault();
    const { file, title, tags, course, department, semester, subject, class: className, category } = uploadForm;
    if (!file) return;
    const newFile = {
      id: files.length + 1,
      name: file.name,
      title: title || file.name,
      author: userRole,
      uploadedBy: userRole,
      date: new Date().toISOString().split('T')[0],
      permissions: userRole === "Admin"
        ? {
            Admin: { read: true, write: true, delete: true },
            Teacher: { read: true, write: true, delete: false },
            Student: { read: true, write: false, delete: false },
          }
        : {
            Admin: { read: true, write: true, delete: true },
            Teacher: { read: true, write: true, delete: false },
            Student: { read: false, write: false, delete: false },
          },
      history: [{
        version: 1,
        date: new Date().toISOString().split('T')[0],
        changes: "Initial upload",
        state: { name: file.name, title: title || file.name, type: file.name.split('.').pop().toLowerCase(), content: `Mock content for ${file.name}` },
      }],
      type: file.name.split('.').pop().toLowerCase(),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      content: `Mock content for ${file.name}`,
      course,
      department,
      semester,
      subject,
      class: className,
      category,
      auditLogs: [{ timestamp: new Date().toISOString(), user: userRole, action: "uploaded" }],
      shareLinks: [],
    };
    setFiles([...files, newFile]);
    setUploadForm({
      file: null,
      title: "",
      tags: "",
      course: "",
      department: "",
      semester: "",
      subject: "",
      class: "",
      category: "Curriculum",
    });
  };

  // Handle file update
  const handleFileUpdate = (fileId, newFile) => {
    setFiles(files.map(file => {
      if (file.id === fileId) {
        const newVersion = file.history.length + 1;
        const updatedFile = {
          ...file,
          name: newFile.name,
          title: file.title || newFile.name,
          type: newFile.name.split('.').pop().toLowerCase(),
          content: `Mock content for ${newFile.name}`,
          history: [
            ...file.history,
            {
              version: newVersion,
              date: new Date().toISOString().split('T')[0],
              changes: `Updated to version ${newVersion}`,
              state: {
                name: file.name,
                title: file.title,
                type: file.type,
                content: file.content,
              },
            },
          ],
          auditLogs: [
            ...file.auditLogs,
            { timestamp: new Date().toISOString(), user: userRole, action: "edited" },
          ],
        };
        return updatedFile;
      }
      return file;
    }));
  };

  // Handle rollback to a previous version
  const handleRollback = (fileId, version) => {
    setFiles(files.map(file => {
      if (file.id === fileId) {
        const versionEntry = file.history.find(entry => entry.version === version);
        if (versionEntry && versionEntry.state) {
          const { name, title, type, content } = versionEntry.state;
          const newVersion = file.history.length + 1;
          return {
            ...file,
            name,
            title,
            type,
            content,
            history: [
              ...file.history,
              {
                version: newVersion,
                date: new Date().toISOString().split('T')[0],
                changes: `Rolled back to version ${version}`,
                state: { name, title, type, content },
              },
            ],
            auditLogs: [
              ...file.auditLogs,
              { timestamp: new Date().toISOString(), user: userRole, action: "rolled back" },
            ],
          };
        }
      }
      return file;
    }));
  };

  // Handle file download
  const handleDownload = (fileId) => {
    console.log(`Downloading file with ID: ${fileId}`);
    logAction(fileId, "downloaded");
  };

  // Handle permissions update
  const handlePermissionsUpdate = (fileId, updatedPermissions) => {
    setFiles(files.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          permissions: updatedPermissions,
          auditLogs: [
            ...file.auditLogs,
            { timestamp: new Date().toISOString(), user: userRole, action: "updated permissions" },
          ],
        };
      }
      return file;
    }));
  };

  // Handle file deletion
  const handleDeleteFile = (fileId) => {
    setFiles(files.filter(file => file.id !== fileId));
    logAction(fileId, "deleted");
  };

  // Handle generate share link
  const handleGenerateShareLink = (fileId) => {
    setFiles(files.map(file => {
      if (file.id === fileId) {
        const linkId = generateUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const url = `https://example.com/share/${linkId}`;
        return {
          ...file,
          shareLinks: [
            ...file.shareLinks,
            { linkId, url, expiresAt, createdBy: userRole, createdAt: new Date().toISOString() },
          ],
          auditLogs: [
            ...file.auditLogs,
            { timestamp: new Date().toISOString(), user: userRole, action: "generated share link" },
          ],
        };
      }
      return file;
    }));
  };

  // Handle access share link
  const handleAccessShareLink = (fileId, linkId) => {
    setFiles(files.map(file => {
      if (file.id === fileId) {
        const link = file.shareLinks.find(l => l.linkId === linkId);
        if (link && new Date(link.expiresAt) >= new Date()) {
          return {
            ...file,
            auditLogs: [
              ...file.auditLogs,
              { timestamp: new Date().toISOString(), user: userRole, action: `accessed share link ${linkId}` },
            ],
          };
        }
      }
      return file;
    }));
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  // Handle search button click
  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedFilters(filters);
  };

  // Generate auto-suggestions
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
      return;
    }
    const suggestionItems = files.flatMap(file => [
      file.name,
      file.title,
      ...(file.tags || []),
      file.course,
      file.department,
      file.semester,
      file.subject,
      file.class,
      file.category,
    ]).filter(item => item && item.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5);
    setSuggestions(suggestionItems);
  }, [searchTerm, files]);

  // Filter files based on applied search term and filters
  const filteredFiles = files.filter(file => {
    if (!file.permissions[userRole]?.read) return false;

    const searchMatch = appliedSearchTerm.trim() === "" ||
      file.name.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      (file.title || "").toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      (file.tags || []).some(tag => tag.toLowerCase().includes(appliedSearchTerm.toLowerCase())) ||
      (file.content || "").toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      (file.course || "").toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      (file.department || "").toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      (file.semester || "").toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      (file.subject || "").toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      (file.class || "").toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      (file.category || "").toLowerCase().includes(appliedSearchTerm.toLowerCase());

    const typeMatch = !appliedFilters.type || file.type === appliedFilters.type;
    const dateMatch = !appliedFilters.dateRange ||
      (appliedFilters.dateRange === "7days" && new Date(file.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (appliedFilters.dateRange === "30days" && new Date(file.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const uploaderMatch = !appliedFilters.uploader || file.uploadedBy === appliedFilters.uploader;
    const tagMatch = !appliedFilters.tag || (file.tags || []).includes(appliedFilters.tag);
    const courseMatch = !appliedFilters.course || file.course === appliedFilters.course;
    const departmentMatch = !appliedFilters.department || file.department === appliedFilters.department;
    const semesterMatch = !appliedFilters.semester || file.semester === appliedFilters.semester;
    const subjectMatch = !appliedFilters.subject || file.subject === appliedFilters.subject;
    const classMatch = !appliedFilters.class || file.class === appliedFilters.class;
    const categoryMatch = !appliedFilters.category || file.category === appliedFilters.category;

    return searchMatch && typeMatch && dateMatch && uploaderMatch && tagMatch &&
           courseMatch && departmentMatch && semesterMatch && subjectMatch && classMatch && categoryMatch;
  });

  // User's uploaded files
  const userUploadedFiles = files.filter(file => file.uploadedBy === userRole);

  // Recent files (last 3 uploaded)
  const recentFiles = [...files]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)
    .filter(file => file.permissions[userRole]?.read);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg px-6 py-4 flex items-center">
        <FaFolder className="text-2xl text-indigo-600 mr-2" />
        <h2 className="text-indigo-600 text-lg font-semibold">File Manager</h2>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600">File Manager</h1>

        {/* Debug User Role */}
        <p className="text-sm text-gray-600 mb-4">Current Role: {userRole}</p>

        {/* Search and Filters */}
        <div className="mb-6 relative">
          <div className="flex items-center space-x-4 mb-4">
            <input
              type="text"
              placeholder="Search by name, title, uploader, tags, course, etc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Search
            </button>
          </div>
          {/* Auto-suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setSearchTerm(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All File Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="ppt">PPT</option>
              <option value="pptx">PPTX</option>
            </select>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All Dates</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
            <select
              value={filters.uploader}
              onChange={(e) => handleFilterChange('uploader', e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All Uploaders</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
            </select>
            <select
              value={filters.tag}
              onChange={(e) => handleFilterChange('tag', e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All Tags</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Algebra">Algebra</option>
              <option value="Biology">Biology</option>
              <option value="World War II">World War II</option>
              <option value="Generated">Generated</option>
            </select>
            <select
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All Courses</option>
              <option value="Math 101">Math 101</option>
              <option value="Biology 201">Biology 201</option>
              <option value="History 101">History 101</option>
              <option value="General Studies">General Studies</option>
            </select>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All Departments</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="General">General</option>
            </select>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All Semesters</option>
              <option value="Fall 2025">Fall 2025</option>
              <option value="Spring 2025">Spring 2025</option>
            </select>
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All Subjects</option>
              <option value="Algebra">Algebra</option>
              <option value="Biology">Biology</option>
              <option value="World History">World History</option>
              <option value="General">General</option>
            </select>
            <select
              value={filters.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All Classes</option>
              <option value="Class A">Class A</option>
              <option value="Class B">Class B</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              <option value="Curriculum">Curriculum</option>
              <option value="Assignments">Assignments</option>
              <option value="Quizzes">Quizzes</option>
              <option value="Lesson Plan">Lesson Plan</option>
            </select>
          </div>
        </div>

        {/* Recent Files */}
        {appliedSearchTerm.trim() === "" && Object.values(appliedFilters).every(val => val === "") && recentFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Files</h3>
            <div className="grid gap-4">
              {recentFiles.map(file => (
                <div
                  key={file.id}
                  className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{file.title}</h2>
                    <p className="text-sm text-gray-600">File: {file.name}</p>
                    <p className="text-sm text-gray-600">Uploaded by: {file.uploadedBy} on {file.date}</p>
                    <p className="text-sm text-gray-600">Tags: {(file.tags || []).join(", ") || "None"}</p>
                    <p className="text-sm text-gray-600">Course: {file.course || "None"}</p>
                    <p className="text-sm text-gray-600">Category: {file.category || "None"}</p>
                  </div>
                  <div className="space-x-2">
                    {file.permissions[userRole].read && (
                      <button
                        onClick={() => {
                          setSelectedFile(file);
                          logAction(file.id, "accessed");
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        View History
                      </button>
                    )}
                    {file.permissions[userRole].read && (
                      <button
                        onClick={() => handleDownload(file.id)}
                        className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                      >
                        Download
                      </button>
                    )}
                    {file.permissions[userRole].delete && (
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Upload and View Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload or View Files</h3>
          {(userRole !== "Admin" && userRole !== "Teacher") && (
            <p className="text-red-500 mb-4">File upload is restricted to Admin and Teacher roles. Current role: {userRole}</p>
          )}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setShowUploadedFiles(false)}
              className={`px-4 py-2 rounded ${!showUploadedFiles ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Upload File
            </button>
            <button
              onClick={() => setShowUploadedFiles(true)}
              className={`px-4 py-2 rounded ${showUploadedFiles ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              View Uploaded Files
            </button>
          </div>
          {!showUploadedFiles ? (
            <form onSubmit={handleFileUpload} className="bg-white p-4 rounded-lg shadow-md border border-blue-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">File</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.ppt,.pptx"
                    onChange={handleFileSelect}
                    className="p-2 border rounded-lg w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={uploadForm.title}
                    onChange={handleUploadFormChange}
                    placeholder="Enter file title"
                    className="p-2 border rounded-lg w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Role</label>
                  <input
                    type="text"
                    value={userRole}
                    disabled
                    className="p-2 border rounded-lg w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Category</label>
                  <select
                    name="category"
                    value={uploadForm.category}
                    onChange={handleUploadFormChange}
                    className="p-2 border rounded-lg w-full"
                  >
                    <option value="Curriculum">Curriculum</option>
                    <option value="Assignments">Assignments</option>
                    <option value="Quizzes">Quizzes</option>
                    <option value="Lesson Plan">Lesson Plan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Semester</label>
                  <input
                    type="text"
                    name="semester"
                    value={uploadForm.semester}
                    onChange={handleUploadFormChange}
                    placeholder="e.g., Fall 2025"
                    className="p-2 border rounded-lg w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={uploadForm.subject}
                    onChange={handleUploadFormChange}
                    placeholder="e.g., Algebra"
                    className="p-2 border rounded-lg w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Date</label>
                  <input
                    type="text"
                    value={new Date().toISOString().split('T')[0]}
                    disabled
                    className="p-2 border rounded-lg w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={uploadForm.tags}
                    onChange={handleUploadFormChange}
                    placeholder="e.g., Math, Algebra"
                    className="p-2 border rounded-lg w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Course</label>
                  <input
                    type="text"
                    name="course"
                    value={uploadForm.course}
                    onChange={handleUploadFormChange}
                    placeholder="e.g., Math 101"
                    className="p-2 border rounded-lg w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={uploadForm.department}
                    onChange={handleUploadFormChange}
                    placeholder="e.g., Mathematics"
                    className="p-2 border rounded-lg w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Class</label>
                  <input
                    type="text"
                    name="class"
                    value={uploadForm.class}
                    onChange={handleUploadFormChange}
                    placeholder="e.g., Class A"
                    className="p-2 border rounded-lg w-full"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Upload File
              </button>
            </form>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Your Uploaded Files</h4>
              {userUploadedFiles.length === 0 ? (
                <p className="text-gray-600">No files uploaded yet.</p>
              ) : (
                <div className="grid gap-4">
                  {userUploadedFiles.map(file => (
                    <div
                      key={file.id}
                      className="p-4 bg-gray-50 rounded-lg border flex justify-between items-center"
                    >
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">{file.title}</h2>
                        <p className="text-sm text-gray-600">File: {file.name}</p>
                        <p className="text-sm text-gray-600">Category: {file.category || "None"}</p>
                        <p className="text-sm text-gray-600">Semester: {file.semester || "None"}</p>
                        <p className="text-sm text-gray-600">Subject: {file.subject || "None"}</p>
                        <p className="text-sm text-gray-600">Date: {file.date}</p>
                        <p className="text-sm text-gray-600">Course: {file.course || "None"}</p>
                        <p className="text-sm text-gray-600">Tags: {(file.tags || []).join(", ") || "None"}</p>
                      </div>
                      <div className="space-x-2">
                        {file.permissions[userRole].read && (
                          <button
                            onClick={() => {
                              setSelectedFile(file);
                              logAction(file.id, "accessed");
                            }}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            View History
                          </button>
                        )}
                        {file.permissions[userRole].read && (
                          <button
                            onClick={() => handleDownload(file.id)}
                            className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                          >
                            Download
                          </button>
                        )}
                        {file.permissions[userRole].delete && (
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        )}
                        {userRole === "Admin" && (
                          <button
                            onClick={() => setShowPermissions(file)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Edit Permissions
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* File List */}
        <div className="grid gap-4">
          {filteredFiles.map(file => (
            <div
              key={file.id}
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{file.title}</h2>
                  <p className="text-sm text-gray-600">File: {file.name}</p>
                  <p className="text-sm text-gray-600">Author: {file.author}</p>
                  <p className="text-sm text-gray-600">Uploaded by: {file.uploadedBy} on {file.date}</p>
                  <p className="text-sm text-gray-600">
                    Permissions: Admin({Object.entries(file.permissions.Admin).filter(([_, v]) => v).map(([k]) => k).join(", ") || "none"}),
                    Teacher({Object.entries(file.permissions.Teacher).filter(([_, v]) => v).map(([k]) => k).join(", ") || "none"}),
                    Student({Object.entries(file.permissions.Student).filter(([_, v]) => v).map(([k]) => k).join(", ") || "none"})
                  </p>
                  <p className="text-sm text-gray-600">Tags: {(file.tags || []).join(", ") || "None"}</p>
                  <p className="text-sm text-gray-600">Course: {file.course || "None"}</p>
                  <p className="text-sm text-gray-600">Department: {file.department || "None"}</p>
                  <p className="text-sm text-gray-600">Semester: {file.semester || "None"}</p>
                  <p className="text-sm text-gray-600">Subject: {file.subject || "None"}</p>
                  <p className="text-sm text-gray-600">Class: {file.class || "None"}</p>
                  <p className="text-sm text-gray-600">Category: {file.category || "None"}</p>
                </div>
                <div className="space-x-2">
                  {file.permissions[userRole].read && (
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        logAction(file.id, "accessed");
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      View History
                    </button>
                  )}
                  {file.permissions[userRole].read && (
                    <button
                      onClick={() => handleDownload(file.id)}
                      className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Download
                    </button>
                  )}
                  {file.permissions[userRole].delete && (
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                  {userRole === "Admin" && (
                    <button
                      onClick={() => setShowPermissions(file)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Edit Permissions
                    </button>
                  )}
                  {file.permissions[userRole].write && (
                    <input
                      type="file"
                      accept=".pdf,.docx,.ppt,.pptx"
                      onChange={(e) => handleFileUpdate(file.id, e.target.files[0])}
                      className="inline-block p-1 border rounded"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* File History, Audit Logs, Share File, and Curriculum Content Modal */}
        {selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">History for {selectedFile.title}</h2>
              <FileHistory
                history={selectedFile.history}
                onRollback={(version) => handleRollback(selectedFile.id, version)}
              />
              <AuditLogs logs={selectedFile.auditLogs} />
              <ShareFile
                file={selectedFile}
                onGenerateLink={handleGenerateShareLink}
                onAccessLink={handleAccessShareLink}
              />
              {selectedFile.category === 'Curriculum' && selectedFile.content && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <h3 className="text-lg font-semibold mb-2">Curriculum Content</h3>
                  <pre className="text-sm whitespace-pre-wrap break-words">
                    {selectedFile.content}
                  </pre>
                </div>
              )}
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Modal */}
        {showPermissions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
              <AccessPermissions
                file={showPermissions}
                onUpdatePermissions={handlePermissionsUpdate}
              />
              <button
                onClick={() => setShowPermissions(null)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;