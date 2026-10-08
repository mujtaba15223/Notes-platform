import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Check, FileText, Loader2, ShieldCheck, Trash2, UserRound, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI, subjectsAPI, topicsAPI } from "../services/api";

const sections = {
  users: { title: "User Management", description: "Manage student access to the platform.", icon: Users },
  subjects: { title: "Subject Management", description: "Review and manage the subjects in your library.", icon: BookOpen },
  topics: { title: "Topic Management", description: "Review and manage topics across subjects.", icon: ShieldCheck },
  notes: { title: "Note Moderation", description: "Review uploads and manage published study resources.", icon: FileText },
};

export function AdminManagement({ section }) {
  const config = sections[section];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState("");

  const fetchItems = useCallback(async () => {
    if (!config) {
      setError("Management section not found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      let response;
      if (section === "users") response = await adminAPI.getUsers({ limit: 100 });
      if (section === "subjects") response = await subjectsAPI.getSubjects({ limit: 100 });
      if (section === "topics") response = await topicsAPI.getTopics({ limit: 100 });
      if (section === "notes") response = await adminAPI.getAllNotes({ limit: 100 });
      setItems(response.data.data);
    } catch (requestError) {
      console.error(`Failed to load admin ${section}:`, requestError);
      setError(requestError.response?.data?.message || `Could not load ${section}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [config, section]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const performAction = async (item, action) => {
    setWorkingId(item._id);
    try {
      await action(item);
      await fetchItems();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "The action failed. Please try again.");
    } finally {
      setWorkingId("");
    }
  };

  if (!config) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">Admin section not found.</p>
        <Link className="btn-primary mt-4" to="/admin">Return to dashboard</Link>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/admin" className="text-sm font-medium text-primary-700 hover:underline">← Admin dashboard</Link>
      <header className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
              <Icon className="h-5 w-5" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{config.title}</h1>
          </div>
          <p className="mt-2 text-slate-600">{config.description}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
          {items.length} {items.length === 1 ? "record" : "records"}
        </span>
      </header>

      {loading ? (
        <div className="mt-8 flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 text-slate-500">
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          Loading {section}...
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center" role="alert">
          <p className="text-rose-700">{error}</p>
          <button type="button" className="btn-secondary mt-4" onClick={fetchItems}>Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center text-slate-500">
          No {section} to show yet.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const busy = workingId === item._id;
              return (
                <article key={item._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      {section === "users" ? <UserRound className="h-5 w-5" /> : section === "notes" ? <FileText className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0">
                      {section === "notes" ? (
                        <>
                          <Link to={`/notes/${item._id}`} className="font-semibold text-slate-900 hover:text-primary-700">{item.title}</Link>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description || "No description provided."}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.subject?.name || "No subject"}{item.topic?.name ? ` · ${item.topic.name}` : ""} · {item.uploadedBy?.name || "Unknown uploader"}
                          </p>
                        </>
                      ) : section === "subjects" ? (
                        <>
                          <h2 className="font-semibold text-slate-900">{item.name}</h2>
                          <p className="mt-1 text-sm text-slate-500">{item.code} · Semester {item.semester}</p>
                        </>
                      ) : section === "topics" ? (
                        <>
                          <h2 className="font-semibold text-slate-900">{item.name}</h2>
                          <p className="mt-1 text-sm text-slate-500">{item.subject?.name || "No subject"}{item.description ? ` · ${item.description}` : ""}</p>
                        </>
                      ) : (
                        <>
                          <h2 className="font-semibold text-slate-900">{item.name}</h2>
                          <p className="mt-1 text-sm text-slate-500">{item.email}</p>
                        </>
                      )}
                      {section === "notes" && (
                        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.isApproved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {item.isApproved ? "Published" : "Pending review"}
                        </span>
                      )}
                      {section === "users" && (
                        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {item.isActive ? "Active" : "Deactivated"} · {item.role}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    {section === "users" && (
                      <>
                        <button
                          type="button"
                          disabled={busy || item.role === "admin"}
                          onClick={() => performAction(item, (current) => adminAPI.updateUser(current._id, { isActive: !current.isActive }))}
                          className="btn-secondary text-sm"
                        >
                          {item.isActive ? "Deactivate" : "Activate"}
                        </button>
                        {item.role !== "admin" && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              if (window.confirm(`Delete ${item.name} and their uploaded notes?`)) {
                                performAction(item, (current) => adminAPI.deleteUser(current._id));
                              }
                            }}
                            className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                    {(section === "subjects" || section === "topics") && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          if (window.confirm(`Delete ${section === "subjects" ? "this subject and its topics and notes" : "this topic and its notes"}?`)) {
                            performAction(item, (current) => section === "subjects" ? subjectsAPI.deleteSubject(current._id) : topicsAPI.deleteTopic(current._id));
                          }
                        }}
                        className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    {section === "notes" && (
                      <>
                        <button
                          type="button"
                          disabled={busy || item.isApproved}
                          onClick={() => performAction(item, (current) => adminAPI.approveNote(current._id))}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busy || !item.isApproved}
                          onClick={() => performAction(item, (current) => adminAPI.rejectNote(current._id))}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          Unpublish
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            if (window.confirm("Permanently delete this note and its uploaded file?")) {
                              performAction(item, (current) => adminAPI.deleteNote(current._id));
                            }
                          }}
                          className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {busy && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
