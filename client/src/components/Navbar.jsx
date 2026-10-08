import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard, Settings, Search } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/notes?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2" aria-label="Home">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">NotesHub</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/notes"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === "/notes" ? "text-primary-600" : "text-gray-600 hover:text-primary-600"
                }`}
              >
                Browse Notes
              </Link>
              <Link
                to="/subjects"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === "/subjects" ? "text-primary-600" : "text-gray-600 hover:text-primary-600"
                }`}
              >
                Subjects
              </Link>
              {isAuthenticated && (
                <Link
                  to="/upload"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === "/upload" ? "text-primary-600" : "text-gray-600 hover:text-primary-600"
                  }`}
                >
                  Upload
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                aria-label="Search notes"
              />
            </form>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 inline-block mr-1" /> Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="search"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </form>
            <div className="flex flex-col gap-2">
              <Link to="/notes" className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Browse Notes</Link>
              <Link to="/subjects" className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Subjects</Link>
              {isAuthenticated && (
                <Link to="/upload" className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Upload</Link>
              )}
              {isAuthenticated ? (
                <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
                  {isAdmin && <Link to="/admin" className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Admin</Link>}
                  <Link to="/dashboard" className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Dashboard</Link>
                  <Link to="/profile" className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Profile</Link>
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-red-600 hover:bg-gray-50 rounded-lg text-left flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-200 flex gap-2">
                  <Link to="/login" className="btn-secondary flex-1 text-center">Login</Link>
                  <Link to="/register" className="btn-primary flex-1 text-center">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}