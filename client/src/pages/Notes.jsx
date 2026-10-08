import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { notesAPI, subjectsAPI, topicsAPI } from "../services/api";
import { NoteGrid } from "../components/NoteGrid";
import { SearchBar } from "../components/SearchBar";
import { FilterPanel } from "../components/FilterPanel";
import { BookOpen, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export function Notes() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = 20;
  const search = searchParams.get("search") || "";
  const subject = searchParams.get("subject") || "";
  const topic = searchParams.get("topic") || "";
  const fileType = searchParams.get("fileType") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notesAPI.getNotes({
        page,
        limit,
        search,
        subject,
        topic,
        fileType,
        sortBy,
        sortOrder,
      });
      setNotes(response.data.data);
      setPagination(response.data.pagination);
      setFetchError("");
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setFetchError(error.response?.data?.message || "Unable to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, subject, topic, fileType, sortBy, sortOrder]);

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await subjectsAPI.getSubjects({ limit: 50 });
      setSubjects(response.data.data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  }, []);

  const fetchTopics = useCallback(async (subjectId) => {
    if (!subjectId) {
      setTopics([]);
      return;
    }
    try {
      const response = await topicsAPI.getTopics({ subject: subjectId, limit: 50 });
      setTopics(response.data.data);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchTopics(subject);
  }, [fetchTopics, subject]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount = [subject, topic, fileType].filter(Boolean).length;
  const heading = search ? "Search results" : "Explore study material";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-primary-800 px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-14 -top-24 h-72 w-72 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-1/3 h-56 w-56 rounded-full bg-sky-300/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-100">
            <Sparkles className="h-3.5 w-3.5" />
            YOUR COMMUNITY STUDY LIBRARY
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Browse Notes</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
            Find clear, useful study resources shared by students. Search by topic or filter the library to find what you need.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-sm font-medium text-white ring-1 ring-white/15">
            <BookOpen className="h-4 w-4 text-blue-200" />
            {pagination.total.toLocaleString()} {pagination.total === 1 ? "resource" : "resources"} available
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
        <FilterPanel subjects={subjects} topics={topics} />

        <main className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <SearchBar
              initialQuery={search}
              placeholder="Search by title, subject, description, or tag..."
              className="w-full"
            />
          </div>

          <div className="mb-4 mt-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-600">Study library</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{heading}</h2>
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
                  {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} applied
                </span>
              )}
              {!loading && !fetchError && (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {pagination.total} {pagination.total === 1 ? "note" : "notes"}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100" />
                    <div className="h-7 w-16 rounded-full bg-slate-100" />
                  </div>
                  <div className="mt-6 h-6 w-4/5 rounded bg-slate-100" />
                  <div className="mt-3 h-4 w-full rounded bg-slate-100" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
                  <div className="mt-7 h-9 rounded-xl bg-slate-100" />
                  <div className="mt-5 h-10 rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : (
            fetchError ? (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center" role="alert">
                <p className="text-red-700">{fetchError}</p>
                <button onClick={fetchNotes} className="btn-secondary mt-4">
                  Retry
                </button>
              </div>
            ) : (
            <>
              <NoteGrid
                notes={notes}
                emptyMessage={search ? `No notes found for "${search}"` : "No notes available"}
              />

              {pagination.pages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Notes pages">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn-secondary p-2 disabled:opacity-50"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          pageNum === pagination.page
                            ? "bg-primary-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary p-2 disabled:opacity-50"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              )}
            </>
            )
          )}
        </main>
      </div>
    </div>
  );
}