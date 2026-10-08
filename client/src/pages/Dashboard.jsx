import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notesAPI, usersAPI } from "../services/api";
import { BookOpen, Eye, Download, Upload, Clock, TrendingUp, FileText, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { NoteGrid } from "../components/NoteGrid";
import toast from "react-hot-toast";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalUploads: 0, totalViews: 0, totalDownloads: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [notesRes, userRes] = await Promise.all([
        notesAPI.getMyNotes({ limit: 5 }),
        usersAPI.getProfile(),
      ]);
      
      setRecentNotes(notesRes.data.data);
      setStats({
        totalUploads: userRes.data.data.stats.totalUploads,
        totalViews: userRes.data.data.stats.totalViews,
        totalDownloads: userRes.data.data.stats.totalDownloads,
      });
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Total Uploads", value: stats.totalUploads, icon: FileText, color: "text-blue-600 bg-blue-100" },
    { label: "Total Views", value: stats.totalViews, icon: Eye, color: "text-green-600 bg-green-100" },
    { label: "Total Downloads", value: stats.totalDownloads, icon: Download, color: "text-purple-600 bg-purple-100" },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="card p-6">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2].map(i => (
              <div key={i} className="card p-6 h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-600 mt-1">Here's an overview of your notes activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to="/dashboard/my-notes"
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Recently Uploaded
            </h2>
            <Link to="/dashboard/my-notes" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentNotes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Upload className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No notes uploaded yet</p>
                <Link to="/upload" className="text-primary-600 hover:underline mt-2 inline-block">Upload your first note</Link>
              </div>
            ) : (
              recentNotes.map((note) => (
                <div key={note._id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{note.title}</p>
                    <p className="text-sm text-gray-500">
                      {note.subject?.name} → {note.topic?.name}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</p>
                    <p>{note.views} views · {note.downloads} downloads</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              Popular This Week
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentNotes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No popular notes yet</p>
              </div>
            ) : (
              recentNotes
                .sort((a, b) => (b.views + b.downloads) - (a.views + a.downloads))
                .slice(0, 5)
                .map((note, index) => (
                  <div key={note._id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <span className="w-8 text-center text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{note.title}</p>
                      <p className="text-sm text-gray-500">{note.subject?.name}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{note.views} views</p>
                      <p>{note.downloads} downloads</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Recent Notes</h2>
          <Link to="/upload" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Upload New
          </Link>
        </div>
        <NoteGrid notes={recentNotes} emptyMessage="You haven't uploaded any notes yet" />
      </div>
    </div>
  );
}