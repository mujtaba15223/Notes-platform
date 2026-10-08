import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usersAPI } from "../services/api";
import { User, Camera, Loader2, BookOpen, Eye, Download, Upload } from "lucide-react";
import toast from "react-hot-toast";

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [myNotes, setMyNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getProfile();
      setProfile(response.data.data.user);
      setFormData({
        name: response.data.data.user.name,
        bio: response.data.data.user.bio || "",
        avatar: response.data.data.user.avatar || "",
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyNotes = async () => {
    setNotesLoading(true);
    try {
      const response = await usersAPI.getUserNotes(user._id, { limit: 20 });
      setMyNotes(response.data.data);
    } catch (error) {
      toast.error("Failed to load notes");
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "notes") {
      fetchMyNotes();
    }
  }, [activeTab, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatar: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "notes", label: "My Notes", icon: BookOpen },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-r from-primary-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary-600" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload" />
              </label>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{formData.name || user?.name}</h1>
              <p className="text-gray-600 mt-1">{user?.email}</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${user?.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                {user?.role === "admin" ? "Administrator" : "Student"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100">
          <nav className="flex border-b border-gray-100" aria-label="Profile tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="p-6">
            {activeTab === "overview" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="label">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="bio" className="label">Bio</label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        className="input min-h-[100px] resize-y"
                        maxLength={500}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div>
                      <label htmlFor="avatar" className="label">Avatar URL</label>
                      <input
                        id="avatar"
                        type="url"
                        value={formData.avatar}
                        onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                        className="input"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "notes" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">My Notes</h2>
                  <a href="/upload" className="btn-primary text-sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </a>
                </div>
                
                {notesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="card animate-pulse p-5 h-40"></div>
                    ))}
                  </div>
                ) : myNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No notes yet</h3>
                    <p className="text-gray-500 mb-4">Start sharing your study materials</p>
                    <a href="/upload" className="btn-primary">Upload Your First Note</a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myNotes.map((note) => (
                      <div key={note._id} className="card p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {note.subject?.name} → {note.topic?.name}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "stats" && profile && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Total Uploads", value: profile.stats?.totalUploads || 0, icon: Upload, color: "text-blue-600 bg-blue-100" },
                  { label: "Total Views", value: profile.stats?.totalViews || 0, icon: Eye, color: "text-green-600 bg-green-100" },
                  { label: "Total Downloads", value: profile.stats?.totalDownloads || 0, icon: Download, color: "text-purple-600 bg-purple-100" },
                ].map((stat, index) => (
                  <div key={index} className="card p-6 text-center">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${stat.color}`}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}