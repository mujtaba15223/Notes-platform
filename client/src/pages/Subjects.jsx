import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { subjectsAPI, topicsAPI } from "../services/api";
import { BookOpen, ChevronRight, Loader2, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Subjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const page = parseInt(searchParams.get("page")) || 1;

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await subjectsAPI.getSubjects({
        page,
        limit: 12,
        search,
      });
      setSubjects(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
        <p className="text-gray-600 mt-1">Browse all available subjects and their topics</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
          />
        </div>
      </form>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse p-6">
              <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No subjects found</h3>
          <p className="text-gray-500">Try adjusting your search</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects.map((subject) => (
              <Link
                key={subject._id}
                to={`/subjects/${subject._id}`}
                className="card p-6 hover:shadow-lg hover:border-primary-300 transition-all group"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <BookOpen className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">{subject.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{subject.code}</p>
                {subject.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{subject.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="badge badge-gray">Semester {subject.semester}</span>
                </div>
              </Link>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("page", pagination.page - 1);
                  setSearchParams(params);
                }}
                disabled={pagination.page === 1}
                className="btn-secondary p-2 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
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
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set("page", pageNum);
                      setSearchParams(params);
                    }}
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
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set("page", pagination.page + 1);
                  setSearchParams(params);
                }}
                disabled={pagination.page === pagination.pages}
                className="btn-secondary p-2 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}