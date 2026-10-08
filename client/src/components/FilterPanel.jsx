import { useEffect, useState } from "react";
import { CalendarDays, ChevronDown, FileType, Filter, Folder, Tag } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { subjectsAPI, topicsAPI } from "../services/api";

export function FilterPanel({ subjects: initialSubjects = [], topics: initialTopics = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    subject: true,
    topic: true,
    fileType: true,
    sort: true,
  });
  const [subjects, setSubjects] = useState(initialSubjects);
  const [topics, setTopics] = useState(initialTopics);
  const [loadingSubjects, setLoadingSubjects] = useState(!initialSubjects.length);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const params = new URLSearchParams(location.search);
  const selectedSubject = params.get("subject") || "";
  const selectedTopic = params.get("topic") || "";
  const selectedFileType = params.get("fileType") || "";
  const sortBy = params.get("sortBy") || "createdAt";
  const sortOrder = params.get("sortOrder") || "desc";

  useEffect(() => {
    setSubjects(initialSubjects);
    if (initialSubjects.length) setLoadingSubjects(false);
  }, [initialSubjects]);

  useEffect(() => {
    setTopics(initialTopics);
  }, [initialTopics]);

  useEffect(() => {
    if (initialSubjects.length) return undefined;

    let active = true;
    subjectsAPI.getSubjects({ limit: 50 })
      .then((response) => {
        if (active) setSubjects(response.data.data);
      })
      .catch((error) => {
        console.error("Failed to fetch filter subjects:", error);
      })
      .finally(() => {
        if (active) setLoadingSubjects(false);
      });

    return () => {
      active = false;
    };
  }, [initialSubjects]);

  useEffect(() => {
    if (!selectedSubject || initialTopics.length) {
      setLoadingTopics(false);
      return undefined;
    }

    let active = true;
    setLoadingTopics(true);
    topicsAPI.getTopics({ subject: selectedSubject, limit: 50 })
      .then((response) => {
        if (active) setTopics(response.data.data);
      })
      .catch((error) => {
        console.error("Failed to fetch filter topics:", error);
      })
      .finally(() => {
        if (active) setLoadingTopics(false);
      });

    return () => {
      active = false;
    };
  }, [initialTopics, selectedSubject]);

  const updateParams = (updates) => {
    const nextParams = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    });
    nextParams.delete("page");
    navigate(`/notes?${nextParams.toString()}`);
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams(location.search);
    ["subject", "topic", "fileType", "uploadedBy", "sortBy", "sortOrder", "page"].forEach((key) => {
      nextParams.delete(key);
    });
    navigate(`/notes?${nextParams.toString()}`);
  };

  const hasActiveFilters = Boolean(
    selectedSubject ||
    selectedTopic ||
    selectedFileType ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc"
  );

  const fileTypes = [
    { value: "pdf", label: "PDF documents" },
    { value: "doc", label: "Word documents (DOC)" },
    { value: "docx", label: "Word documents (DOCX)" },
    { value: "ppt", label: "Presentations (PPT)" },
    { value: "pptx", label: "Presentations (PPTX)" },
    { value: "txt", label: "Text files" },
    { value: "jpg", label: "JPG images" },
    { value: "jpeg", label: "JPEG images" },
    { value: "png", label: "PNG images" },
  ];

  const sortOptions = [
    { value: "createdAt:desc", label: "Newest first" },
    { value: "createdAt:asc", label: "Oldest first" },
    { value: "views:desc", label: "Most viewed" },
    { value: "downloads:desc", label: "Most downloaded" },
  ];

  const renderSelect = (options, value, onChange, placeholder) => (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );

  const renderSection = ({ id, label, Icon, active, children, onClear }) => {
    const isExpanded = expandedSections[id];

    return (
      <section className="border-t border-slate-100 py-3 first:border-t-0">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setExpandedSections((current) => ({ ...current, [id]: !current[id] }))}
            className="flex min-w-0 flex-1 items-center gap-2.5 py-1 text-left"
            aria-expanded={isExpanded}
            aria-controls={`filter-section-${id}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-slate-800">{label}</span>
            <ChevronDown className={`ml-auto h-4 w-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </button>
          {active && (
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 text-xs font-semibold text-primary-700 hover:text-primary-900"
            >
              Clear
            </button>
          )}
        </div>
        {isExpanded && <div id={`filter-section-${id}`} className="pb-1 pt-3">{children}</div>}
      </section>
    );
  };

  return (
    <aside className="order-first h-fit w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Filter className="h-4 w-4 text-primary-600" />
            Refine results
          </h2>
          <p className="mt-1 text-xs text-slate-500">Narrow down your search</p>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-50"
          >
            Clear all
          </button>
        )}
      </div>

      {renderSection({
        id: "subject",
        label: "Subject",
        Icon: Folder,
        active: selectedSubject,
        onClear: () => updateParams({ subject: "", topic: "" }),
        children: loadingSubjects ? (
          <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
        ) : (
          renderSelect(
            subjects.map((subject) => ({ value: subject._id, label: subject.name })),
            selectedSubject,
            (value) => updateParams({ subject: value, topic: "" }),
            "All subjects"
          )
        ),
      })}

      {renderSection({
        id: "topic",
        label: "Topic",
        Icon: Tag,
        active: selectedTopic,
        onClear: () => updateParams({ topic: "" }),
        children: loadingTopics ? (
          <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
        ) : selectedSubject ? (
          renderSelect(
            topics.map((topic) => ({ value: topic._id, label: topic.name })),
            selectedTopic,
            (value) => updateParams({ topic: value }),
            "All topics"
          )
        ) : (
          <p className="rounded-xl bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-500">
            Choose a subject to see its topics.
          </p>
        ),
      })}

      {renderSection({
        id: "fileType",
        label: "File type",
        Icon: FileType,
        active: selectedFileType,
        onClear: () => updateParams({ fileType: "" }),
        children: renderSelect(
          fileTypes,
          selectedFileType,
          (value) => updateParams({ fileType: value }),
          "Any file type"
        ),
      })}

      {renderSection({
        id: "sort",
        label: "Sort notes",
        Icon: CalendarDays,
        active: sortBy !== "createdAt" || sortOrder !== "desc",
        onClear: () => updateParams({ sortBy: "", sortOrder: "" }),
        children: renderSelect(
          sortOptions,
          `${sortBy}:${sortOrder}`,
          (value) => {
            const [nextSortBy, nextSortOrder] = value.split(":");
            updateParams({ sortBy: nextSortBy, sortOrder: nextSortOrder });
          },
          "Choose sort order"
        ),
      })}
    </aside>
  );
}
