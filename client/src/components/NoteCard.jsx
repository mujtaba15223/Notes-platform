import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Tag,
  Trash2,
  UserRound,
} from "lucide-react";
import { formatDistanceToNow, isValid } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { notesAPI, adminAPI } from "../services/api";
import toast from "react-hot-toast";

const fileTypeColors = {
  pdf: "bg-rose-50 text-rose-700 ring-rose-100",
  doc: "bg-blue-50 text-blue-700 ring-blue-100",
  docx: "bg-blue-50 text-blue-700 ring-blue-100",
  ppt: "bg-orange-50 text-orange-700 ring-orange-100",
  pptx: "bg-orange-50 text-orange-700 ring-orange-100",
  txt: "bg-slate-100 text-slate-700 ring-slate-200",
  md: "bg-slate-100 text-slate-700 ring-slate-200",
  jpg: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  jpeg: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  png: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  gif: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  webp: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

export function NoteCard({ note, onDelete, onUpdate }) {
  const { user, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileType = note.fileType?.toLowerCase() || "file";
  const fileTypeColor = fileTypeColors[fileType] || "bg-violet-50 text-violet-700 ring-violet-100";
  const canEdit = isAdmin || Boolean(user && note.uploadedBy?._id === user._id);
  const createdAt = note.createdAt ? new Date(note.createdAt) : null;
  const uploadedAt = createdAt && isValid(createdAt)
    ? formatDistanceToNow(createdAt, { addSuffix: true })
    : "Recently added";

  const handleDownload = async () => {
    try {
      const response = await notesAPI.downloadNote(note._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = note.fileName || `${note.title || "study-note"}.${fileType}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      toast.success("Download started");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download note");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    setDeleting(true);
    try {
      if (isAdmin) {
        await adminAPI.deleteNote(note._id);
      } else {
        await notesAPI.deleteNote(note._id);
      }
      toast.success("Note deleted");
      onDelete?.(note._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete note");
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${fileTypeColor}`}>
          <FileText className="h-6 w-6" aria-hidden="true" />
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${fileTypeColor}`}>
            {fileType}
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((visible) => !visible)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Note options"
              aria-expanded={showMenu}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {showMenu && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close note options"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {canEdit && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdate?.(note);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit note
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deleting ? "Deleting..." : "Delete note"}
                      </button>
                    </>
                  )}
                  {!canEdit && (
                    <button
                      type="button"
                      onClick={() => setShowMenu(false)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Close
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex-1">
        <h2 className="line-clamp-2 min-h-14 text-lg font-bold leading-7 text-slate-900 transition-colors group-hover:text-primary-700">
          {note.title || "Untitled study note"}
        </h2>
        <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">
          {note.description?.trim() || "A study resource shared with the learning community."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {note.subject && (
            <Link
              to={`/notes?subject=${note.subject._id}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{note.subject.name}</span>
            </Link>
          )}
          {note.topic && (
            <Link
              to={`/notes?topic=${note.topic._id}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
            >
              <Tag className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{note.topic.name}</span>
            </Link>
          )}
        </div>

        {note.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500">
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5" />
            <span className="max-w-28 truncate">{note.uploadedBy?.name || "Student"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {Number(note.views || 0).toLocaleString()} views
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {uploadedAt}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <Link
            to={`/notes/${note._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            View note
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={`Download ${note.title || "note"}`}
          >
            <Download className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Save</span>
          </button>
        </div>
      </div>
    </article>
  );
}
