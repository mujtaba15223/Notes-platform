import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { subjectsAPI, topicsAPI, notesAPI } from "../services/api";
import { BookOpen, Tag, FileText, ChevronRight, Loader2, Eye, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function SubjectDetails() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjectDetails();
  }, [id]);

  const fetchSubjectDetails = async () => {
    try {
      const [subjectRes, topicsRes] = await Promise.all([
        subjectsAPI.getSubject(id),
        topicsAPI.getTopics({ subject: id, limit: 50 }),
      ]);
      setSubject(subjectRes.data.data.subject);
      setTopics(topicsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch subject details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 h-40"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Subject not found</h1>
        <Link to="/subjects" className="btn-primary inline-block">Back to Subjects</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/subjects" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ChevronRight className="w-5 h-5 rotate-180" />
        Back to Subjects
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
            <p className="text-gray-600">{subject.code} • Semester {subject.semester}</p>
          </div>
        </div>
        {subject.description && (
          <p className="text-gray-600 max-w-2xl">{subject.description}</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-gray-500" />
          Topics ({topics.length})
        </h2>
        
        {topics.length === 0 ? (
          <div className="card p-8 text-center">
            <Tag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No topics added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <Link
                key={topic._id}
                to={`/notes?topic=${topic._id}`}
                className="card p-5 hover:shadow-md hover:border-primary-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{topic.name}</h3>
                    {topic.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{topic.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      View notes →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          Recent Notes
        </h2>
        <RecentNotes subjectId={id} />
      </div>
    </div>
  );
}

function RecentNotes({ subjectId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notesAPI.getNotes({ subject: subjectId, limit: 6, sortBy: "createdAt", sortOrder: "desc" })
      .then(res => {
        setNotes(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subjectId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse p-5 h-48"></div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="card p-8 text-center">
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No notes in this subject yet</p>
        <Link to="/upload" className="btn-primary inline-block mt-4">Upload First Note</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <Link key={note._id} to={`/notes/${note._id}`} className="card p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
              {note.topic && (
                <p className="text-sm text-gray-500 mt-1">{note.topic.name}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {note.views}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {note.downloads}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}