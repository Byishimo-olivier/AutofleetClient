import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2,
  Car,
  ClipboardList,
  MessageCircle,
  Users,
  User,
  LogOut,
  Star,
  CheckCircle,
  Calendar,
  FileText,
} from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useSettings } from "@/contexts/SettingContxt";

const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, formatPrice, t } = useSettings();
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [reply, setReply] = useState("");
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalFeedback: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch feedback stats and list
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Stats
      const statsRes = await apiClient.get<any>("/feedback/stats/overview");
      // Feedback list (first page, latest)
      const feedbackRes = await apiClient.get<any>(
        "/feedback?limit=5&sortBy=created_at&sortOrder=DESC"
      );
      if (statsRes.success && statsRes.data) {
        setStats({
          totalFeedback: statsRes.data.totalFeedback,
          resolvedIssues:
            feedbackRes.success && feedbackRes.data.feedback
              ? feedbackRes.data.feedback.filter(
                  (f: any) => f.status === "resolved"
                ).length
              : 0,
          pendingIssues:
            feedbackRes.success && feedbackRes.data.feedback
              ? feedbackRes.data.feedback.filter(
                  (f: any) => f.status !== "resolved"
                ).length
              : 0,
          avgRating: statsRes.data.averageRating || 0,
        });
      }
      if (feedbackRes.success && feedbackRes.data) {
        setFeedbackList(feedbackRes.data.feedback);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Example: show first feedback in card
  const feedback = feedbackList[0] || {
    name: "N/A",
    email: "",
    vehicle: "",
    rentalId: "",
    rating: 0,
    comment: "No feedback available.",
    date: "",
    branch: "",
    status: "",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Top search bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 flex items-center">
            <input
              type="text"
              placeholder="Search ..."
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring w-80 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-white p-2 rounded-full shadow">
              <span role="img" aria-label="bell">
                🔔
              </span>
            </button>
            <button className="bg-white p-2 rounded-full shadow">
              <span role="img" aria-label="language">
                🌐
              </span>
            </button>
            <div className="bg-white rounded-lg px-3 py-1 flex items-center gap-2 shadow">
              EN <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow flex items-center px-6 py-4 gap-4">
            <div className="bg-gray-100 rounded-full p-3">
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Feedback</div>
              <div className="text-xl font-bold">{stats.totalFeedback}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow flex items-center px-6 py-4 gap-4">
            <div className="bg-gray-100 rounded-full p-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Resolved Issues</div>
              <div className="text-xl font-bold">{stats.resolvedIssues}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow flex items-center px-6 py-4 gap-4">
            <div className="bg-gray-100 rounded-full p-3">
              <FileText className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Pending Issues</div>
              <div className="text-xl font-bold">{stats.pendingIssues}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow flex items-center px-6 py-4 gap-4">
            <div className="bg-gray-100 rounded-full p-3">
              <Star className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Avg Rating</div>
              <div className="text-xl font-bold">{stats.avgRating}</div>
            </div>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200 mb-8">
          <div className="font-semibold text-sm mb-3">Recent Feedback</div>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
              {feedback.customer_first_name
                ? (feedback.customer_first_name[0] +
                    (feedback.customer_last_name
                      ? feedback.customer_last_name[0]
                      : "")).toUpperCase()
                : "?"}
            </div>
            {/* Feedback Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {feedback.customer_first_name
                    ? feedback.customer_first_name +
                      " " +
                      (feedback.customer_last_name || "")
                    : feedback.name}
                </span>
                <span className="text-xs text-gray-500">
                  {feedback.make && feedback.model
                    ? `${feedback.make} ${feedback.model}`
                    : feedback.vehicle}{" "}
                  {feedback.license_plate
                    ? `• ${feedback.license_plate}`
                    : ""}
                </span>
                <span className="flex items-center ml-2">
                  {[...Array(feedback.rating || 0)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </span>
              </div>
              <div className="mt-2 text-gray-700 text-sm italic">
                "{feedback.comment}"
              </div>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs text-gray-400">
                  {feedback.created_at
                    ? new Date(feedback.created_at).toLocaleDateString()
                    : feedback.date}
                </span>
                {feedback.branch && (
                  <span className="text-xs text-gray-400">
                    • {feedback.branch}
                  </span>
                )}
              </div>
            </div>
            {/* Actions */}
            <div className="flex flex-col items-end gap-2">
              <button
                className="bg-blue-100 text-blue-700 px-4 py-1 rounded font-semibold text-xs hover:bg-blue-200"
                onClick={() => setShowReplyModal(true)}
                disabled={!feedback.id}
              >
                Reply
              </button>
              <span
                className={`px-3 py-1 rounded text-xs font-semibold ${
                  feedback.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {feedback.status || "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Reply Modal */}
        {showReplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto relative p-0">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <h3 className="font-semibold text-base">Reply to Customer</h3>
                <button
                  className="text-gray-400 hover:text-gray-700"
                  onClick={() => setShowReplyModal(false)}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 6L6 18M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form
                className="px-6 pb-6 pt-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  // handle reply submit here (e.g., POST /feedback/:id/reply)
                  setShowReplyModal(false);
                  setReply("");
                }}
              >
                <div className="mb-4">
                  <div className="font-semibold text-sm mb-2">
                    Replying to:{" "}
                    {(feedback.customer_first_name ||
                      feedback.name ||
                      "").toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Email: {feedback.customer_email || feedback.email}
                  </div>
                  <label className="block text-sm font-semibold mb-1">
                    Your Response
                  </label>
                  <textarea
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Type your response here ..."
                    rows={4}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-6 py-2 rounded border border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-200"
                    onClick={() => setShowReplyModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded bg-[#2c3e7d] text-white font-semibold shadow hover:bg-[#1e295c]"
                  >
                    Send Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sidebar nav item with navigation
function SidebarNavItem({
  icon,
  label,
  to,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div
      className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition text-sm ${
        active ? "bg-[#3d4f8f]" : "hover:bg-[#3d4f8f]/50"
      }`}
      onClick={() => navigate(to)}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </div>
  );
}

export default FeedbackPage;