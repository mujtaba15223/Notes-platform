import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { notesAPI, adminAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Eye,
  Download,
  User,
  Calendar,
  Tag,
  Clock,
  ArrowLeft,
  Edit,
  Trash2,
  MoreVertical,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import toast from "react-hot-toast";

const fileTypeIcons = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  ppt: FileText,
  pptx: FileText,
  txt: FileText,
  jpg: FileText,
  jpeg: FileText,
  png: FileText,
  gif: FileText,
  webp: FileText,
};

const fileTypeColors = {
  pdf: "bg-red-100 text-red-700",
  doc: "bg-blue-100 text-blue-700",
  docx: "bg-blue-100 text-blue-700",
  ppt: "bg-orange-100 text-orange-700",
  pptx: "bg-orange-100 text-orange-700",
  txt: "bg-gray-100 text-gray-700",
  jpg: "bg-green-100 text-green-700",
  jpeg: "bg-green-100 text-green-700",
  png: "bg-green-100 text-green-700",
  gif: "bg-green-100 text-green-700",
  webp: "bg-green-100 text-green-700",
};

const previewableFileTypes = new Set([
  "pdf",
  "txt",
  "md",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
]);

export function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    tags: "",
  });

  const fetchedNoteId = useRef(null);

  useEffect(() => {
    if (fetchedNoteId.current === id) return;

    fetchedNoteId.current = id;
    setLoading(true);
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await notesAPI.getNote(id);
      setNote(response.data.data.note);
    } catch (error) {
      fetchedNoteId.current = null;
      toast.error("Note not found");
      navigate("/notes");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await notesAPI.downloadNote(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", note.fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download");
    }
  };

  const handleViewOnline = () => {
    if (!previewableFileTypes.has(note.fileType?.toLowerCase())) {
      toast.error(
        "This file type is kept private and cannot be previewed in the browser. Download it to open it."
      );
      return;
    }

    setPreviewOpen((open) => !open);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    setDeleting(true);

    try {
      if (isAdmin) {
        await adminAPI.deleteNote(id);
      } else {
        await notesAPI.deleteNote(id);
      }

      toast.success("Note deleted");
      navigate("/notes");
    } catch (error) {
      toast.error("Failed to delete note");
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      await notesAPI.updateNote(id, {
        title: editForm.title,
        description: editForm.description,
        tags: editForm.tags,
      });

      toast.success("Note updated");
      setEditing(false);
      fetchNote();
    } catch (error) {
      toast.error("Failed to update note");
    }
  };

  const canEdit = isAdmin || (user && note?.uploadedBy?._id === user._id);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>

          <div className="card p-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!note) return null;

  const FileIcon = fileTypeIcons[note.fileType] || FileText;

  const fileTypeColor =
    fileTypeColors[note.fileType] || "bg-gray-100 text-gray-700";

  if (editing) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleEditSubmit} className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Edit Note</h1>

            <button
              type="button"
              onClick={() => setEditing(false)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div>
            <label htmlFor="edit-title" className="label">
              Title
            </label>

            <input
              id="edit-title"
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="input"
              maxLength={200}
              required
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="label">
              Description
            </label>

            <textarea
              id="edit-description"
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="input min-h-[100px] resize-y"
              maxLength={2000}
            />
          </div>

          <div>
            <label htmlFor="edit-tags" className="label">
              Tags (comma separated)
            </label>

            <input
              id="edit-tags"
              type="text"
              value={editForm.tags}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  tags: e.target.value,
                }))
              }
              className="input"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary flex-1">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/notes"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Notes
      </Link>

      <article className="card overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-6 mb-6">
            <div
              className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 ${fileTypeColor}`}
            >
              <FileIcon className="w-10 h-10" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`badge ${fileTypeColor}`}>
                  {note.fileType.toUpperCase()}
                </span>

                {note.subject && (
                  <Link
                    to={`/notes?subject=${note.subject._id}`}
                    className="badge badge-primary hover:bg-primary-200"
                  >
                    {note.subject.name}
                  </Link>
                )}

                {note.topic && (
                  <Link
                    to={`/notes?topic=${note.topic._id}`}
                    className="badge badge-gray hover:bg-gray-200"
                  >
                    {note.topic.name}
                  </Link>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {note.title}
              </h1>

              {note.description && (
                <p className="text-gray-600 mb-4">{note.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {note.uploadedBy?.name || "Unknown"}
                </span>

                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(note.createdAt), "MMM d, yyyy")}
                </span>

                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {note.views.toLocaleString()} views
                </span>

                <span className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {note.downloads.toLocaleString()} downloads
                </span>

                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(note.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          {note.tags && note.tags.length > 0 && (
            <div className="mb-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Tag className="w-4 h-4" />
                <span>Tags:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span key={tag} className="badge badge-gray">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
            <button
              onClick={handleDownload}
              className="btn-primary flex-1 sm:flex-none"
            >
              <Download className="w-5 h-5 mr-2" />
              Download (
              {note.fileSize
                ? `${(note.fileSize / (1024 * 1024)).toFixed(1)} MB`
                : ""}
              )
            </button>

            <button
              type="button"
              onClick={handleViewOnline}
              className="btn-secondary flex-1 sm:flex-none"
            >
              <Eye className="w-5 h-5 mr-2" />
              {previewOpen ? "Hide Preview" : "View Online"}
            </button>

            {canEdit && (
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />

                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                      <button
                        onClick={() => {
                          setEditForm({
                            title: note.title,
                            description: note.description || "",
                            tags: note.tags?.join(", ") || "",
                          });

                          setEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {note.isApproved === false && (
          <div className="bg-yellow-50 border-t border-yellow-200 p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />

            <p className="text-yellow-800 text-sm">
              This note is pending admin approval.
            </p>
          </div>
        )}
      </article>

      {previewOpen && (
        <section
          className="card mt-6 overflow-hidden"
          aria-label="Note preview"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="font-semibold text-gray-900">{note.title}</h2>

            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Close preview
            </button>
          </div>

          <iframe
            title={`${note.title} preview`}
            src={`/api/notes/${id}/view`}
            className="h-[75vh] w-full bg-gray-100"
          />
        </section>
      )}
    </div>
  );
}