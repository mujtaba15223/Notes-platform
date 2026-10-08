import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notesAPI, subjectsAPI, topicsAPI } from "../services/api";
import { FileUploader } from "../components/FileUploader";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export function UploadNote() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const topicsRequestId = useRef(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    topic: "",
    tags: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSubjects();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    else if (formData.title.length > 200) newErrors.title = "Title must be less than 200 characters";
    
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.topic) newErrors.topic = "Topic is required";
    if (!selectedFile) newErrors.file = "Please select a file";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getSubjects({ limit: 50 });
      setSubjects(response.data.data);
    } catch (error) {
      toast.error("Failed to load subjects");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchTopics = async (subjectId) => {
    const requestId = ++topicsRequestId.current;
    if (!subjectId) {
      setTopics([]);
      setLoadingTopics(false);
      return;
    }

    setLoadingTopics(true);
    try {
      const response = await topicsAPI.getTopics({ subject: subjectId, limit: 50 });
      if (requestId === topicsRequestId.current) {
        setTopics(response.data.data);
      }
    } catch (error) {
      if (requestId === topicsRequestId.current) {
        setTopics([]);
        toast.error(error.response?.data?.message || "Failed to load topics");
      }
    } finally {
      if (requestId === topicsRequestId.current) {
        setLoadingTopics(false);
      }
    }
  };

  const handleFileSelect = (files) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      if (!formData.title) {
        const name = files[0].name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({ ...prev, title: name }));
      }
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", selectedFile);
      uploadData.append("title", formData.title);
      uploadData.append("description", formData.description);
      uploadData.append("subject", formData.subject);
      uploadData.append("topic", formData.topic);
      uploadData.append("tags", formData.tags);

      await notesAPI.createNote(uploadData);
      toast.success("Note uploaded successfully!");
      navigate("/dashboard/my-notes");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to upload note";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Upload New Note</h1>
        <p className="text-gray-600 mt-1">Share your study materials with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div>
          <label htmlFor="title" className="label">Title *</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`input ${errors.title ? "border-red-500 focus:ring-red-500" : ""}`}
            placeholder="e.g., Array Basics and Operations"
            maxLength={200}
            disabled={submitting}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="input min-h-[100px] resize-y"
            placeholder="Brief description of what this note covers..."
            maxLength={2000}
            disabled={submitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="subject" className="label">Subject *</label>
            <select
              id="subject"
              value={formData.subject}
              onChange={(e) => {
                const subjectId = e.target.value;
                setFormData(prev => ({ ...prev, subject: subjectId, topic: "" }));
                setErrors(prev => ({ ...prev, subject: "", topic: "" }));
                fetchTopics(subjectId);
              }}
              className={`input ${errors.subject ? "border-red-500 focus:ring-red-500" : ""}`}
              disabled={loadingSubjects || submitting}
            >
              <option value="">Select a subject</option>
              {loadingSubjects ? (
                <option disabled>Loading...</option>
              ) : (
                subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </option>
                ))
              )}
            </select>
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
          </div>

          <div>
            <label htmlFor="topic" className="label">Topic *</label>
            <select
              id="topic"
              key={formData.subject || "no-subject"}
              value={formData.topic}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, topic: e.target.value }));
                setErrors(prev => ({ ...prev, topic: "" }));
              }}
              className={`input ${errors.topic ? "border-red-500 focus:ring-red-500" : ""}`}
              disabled={loadingTopics || !formData.subject || submitting}
              required
              aria-describedby="topic-help"
            >
              <option value="">Select a topic</option>
              {loadingTopics ? (
                <option disabled>Loading...</option>
              ) : formData.subject ? (
                topics.length > 0 ? topics.map((topic) => (
                  <option key={topic._id} value={topic._id}>{topic.name}</option>
                )) : (
                  <option disabled>No topics available for this subject</option>
                )
              ) : (
                <option disabled>Select a subject first</option>
              )}
            </select>
            {errors.topic && <p className="mt-1 text-sm text-red-600">{errors.topic}</p>}
            <p id="topic-help" className="mt-1 text-sm text-gray-500" aria-live="polite">
              {loadingTopics
                ? "Loading topics..."
                : !formData.subject
                  ? "Choose a subject first to load its topics."
                  : topics.length > 0
                    ? `${topics.length} topics available for this subject.`
                    : "No topics are available for this subject yet."}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="label">Tags (comma separated)</label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            className="input"
            placeholder="algorithms, arrays, time-complexity, basics"
            disabled={submitting}
          />
          <p className="mt-1 text-sm text-gray-500">Add relevant tags to help others find your note</p>
        </div>

        <div>
          <label className="label">File *</label>
          <FileUploader
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            maxFiles={1}
          />
          {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <Link to="/dashboard" className="btn-secondary flex-1">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </span>
            ) : (
              "Upload Note"
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 card p-6 bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-3">Supported File Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
          <span className="badge badge-gray">PDF</span>
          <span className="badge badge-gray">DOC/DOCX</span>
          <span className="badge badge-gray">PPT/PPTX</span>
          <span className="badge badge-gray">TXT/MD</span>
          <span className="badge badge-gray">JPG/PNG</span>
          <span className="badge badge-gray">GIF/WebP</span>
          <span className="badge badge-gray">SVG</span>
        </div>
        <p className="mt-3 text-sm text-gray-500">Maximum file size: 10MB</p>
      </div>
    </div>
  );
}