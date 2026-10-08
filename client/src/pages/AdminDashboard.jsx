import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { adminAPI } from "../services/api";
import { Users, BookOpen, Tag, FileText, Download, Eye, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AdminManagement } from "./AdminManagement";

export function AdminDashboard() {
  const location = useLocation();
  const section = location.pathname.split("/")[2];
  const [stats, setStats] = useState({});
  const [recentUploads, setRecentUploads] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [popularSubjects, setPopularSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    try {
      const [statsRes, uploadsRes, usersRes, subjectsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllNotes({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
        adminAPI.getUsers({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
        adminAPI.getAllNotes({ limit: 100 }), // For popular subjects
      ]);
      
      setStats(statsRes.data.data);
      setRecentUploads(uploadsRes.data.data);
      setRecentUsers(usersRes.data.data);
      
      // Calculate popular subjects
      const subjectCounts = {};
      subjectsRes.data.data.forEach(note => {
        if (note.subject) {
          const key = note.subject._id;
          if (!subjectCounts[key]) {
            subjectCounts[key] = { subject: note.subject, count: 0 };
          }
          subjectCounts[key].count++;
        }
      });
      const sorted = Object.values(subjectCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setPopularSubjects(sorted);
    } catch (error) {
      console.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!section) fetchAdminData();
  }, [fetchAdminData, section]);

  if (section) {
    return <AdminManagement section={section} />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6 h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statsData = [
    { label: "Total Students", value: stats.totalStudents || 0, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Total Subjects", value: stats.totalSubjects || 0, icon: BookOpen, color: "text-green-600 bg-green-100" },
    { label: "Total Topics", value: stats.totalTopics || 0, icon: Tag, color: "text-purple-600 bg-purple-100" },
    { label: "Total Notes", value: stats.totalNotes || 0, icon: FileText, color: "text-orange-600 bg-orange-100" },
    { label: "Total Downloads", value: stats.totalDownloads || 0, icon: Download, color: "text-pink-600 bg-pink-100" },
    { label: "Total Views", value: stats.totalViews || 0, icon: Eye, color: "text-indigo-600 bg-indigo-100" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <Link
            key={index}
            to={index === 0 ? "/admin/users" : index === 1 ? "/admin/subjects" : index === 2 ? "/admin/topics" : "/admin/notes"}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Recent Uploads
            </h2>
            <Link to="/admin/notes" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUploads.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No recent uploads</div>
            ) : (
              recentUploads.map((note) => (
                <Link
                  key={note._id}
                  to={`/notes/${note._id}`}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50"
                >
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
                  <span className={`badge ${note.isApproved ? "badge-success" : "badge-warning"}`}>
                    {note.isApproved ? "Approved" : "Pending"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              Popular Subjects
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {popularSubjects.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No data available</div>
            ) : (
              popularSubjects.map((item, index) => (
                <div key={item.subject._id} className="p-4 flex items-center gap-4">
                  <span className="w-8 text-center text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.subject.name}</p>
                    <p className="text-sm text-gray-500">{item.subject.code}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{item.count} notes</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 card">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            Recent Users
          </h2>
          <Link to="/admin/users" className="text-sm text-primary-600 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No recent users</div>
          ) : (
            recentUsers.map((user) => (
              <div key={user._id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span className={`badge ${user.role === "admin" ? "badge-purple" : "badge-gray"}`}>
                  {user.role}
                </span>
                <span className={`badge ${user.isActive ? "badge-success" : "badge-danger"}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}