import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, Upload, Users, Shield, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { subjectsAPI } from "../services/api";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Find notes instantly with full-text search across titles, descriptions, and tags",
  },
  {
    icon: BookOpen,
    title: "Organized by Subject",
    description: "Browse notes organized in a clear hierarchy: Subjects → Topics → Notes",
  },
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Drag-and-drop file upload with support for PDF, DOC, PPT, and more",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Share knowledge with fellow students and discover popular study materials",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "JWT authentication, role-based access control, and secure file handling",
  },
];

const stats = [
  { value: "10,000+", label: "Notes Shared" },
  { value: "500+", label: "Subjects" },
  { value: "5,000+", label: "Active Students" },
  { value: "50,000+", label: "Downloads" },
];

export function Home() {
  const { isAuthenticated } = useAuth();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    let isMounted = true;

    subjectsAPI.getSubjects({ limit: 6 })
      .then((response) => {
        if (isMounted) setSubjects(response.data.data);
      })
      .catch((error) => {
        console.error("Failed to fetch popular subjects:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              New: Real-time collaboration coming soon
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Share, Discover, and Learn with <span className="text-primary-600">NotesHub</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              The student notes sharing platform built for modern learning. Upload, organize, and discover study materials across all your subjects.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/upload" className="btn-primary text-lg px-8 py-3">
                  Upload Your First Note
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <Link to="/register" className="btn-primary text-lg px-8 py-3">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              )}
              <Link to="/notes" className="btn-outline text-lg px-8 py-3">
                Browse Notes
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Study Better</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Powerful features designed for students, by students</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Popular Subjects</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Explore notes across a wide range of computer science topics</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {subjects.map((subject) => (
              <Link
                key={subject._id}
                to={`/notes?subject=${subject._id}`}
                className="card p-6 text-center hover:border-primary-300 hover:shadow-md transition-all group"
              >
                <BookOpen className="w-10 h-10 mx-auto text-gray-400 group-hover:text-primary-600 transition-colors mb-3" />
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{subject.name}</h3>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/subjects" className="btn-outline">
              View All Subjects
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students sharing knowledge. Create your free account today.
          </p>
          <Link
            to={isAuthenticated ? "/upload" : "/register"}
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors"
          >
            {isAuthenticated ? "Upload Notes" : "Create Free Account"}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">NotesHub</span>
              </Link>
              <p className="text-sm">The student notes sharing platform for modern learning.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/notes" className="hover:text-white transition-colors">Browse Notes</Link></li>
                <li><Link to="/subjects" className="hover:text-white transition-colors">Subjects</Link></li>
                <li><Link to="/upload" className="hover:text-white transition-colors">Upload Notes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 NotesHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}