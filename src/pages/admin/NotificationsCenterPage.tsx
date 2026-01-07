import React, { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Megaphone,
  Trash2,
  Filter,
  Loader2,
  Shield,
} from "lucide-react";
import { useSettings } from "@/contexts/SettingContxt";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import {apiClient} from "@/services/apiClient"; // Import the apiClient

type NotificationType = "booking" | "payment" | "reminder" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Stats {
  totalNotifications: number;
  unreadNotifications: number;
  activeUsers: number;
  notificationsByType: { type: NotificationType; count: number }[];
}

const typeIcon = {
  booking: <CheckCircle className="text-blue-600" />,
  payment: <Shield className="text-green-600" />,
  reminder: <AlertCircle className="text-yellow-600" />,
  system: <Megaphone className="text-purple-600" />,
};

const typeLabel = {
  booking: "Booking",
  payment: "Payment",
  reminder: "Reminder",
  system: "System",
};

const NotificationsCenterPage: React.FC = () => {
  const { settings, t } = useSettings();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [filterRead, setFilterRead] = useState<string>("");
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bulkRole, setBulkRole] = useState<string>("owners");
  const [bulkType, setBulkType] = useState<NotificationType>("system");
  const [bulkTitle, setBulkTitle] = useState<string>("");
  const [bulkMessage, setBulkMessage] = useState<string>("");
  const [bulkSendEmail, setBulkSendEmail] = useState<boolean>(false);
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);
  const [bulkFeedback, setBulkFeedback] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = currentUser?.role === "admin";

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");
      if (filterType) params.append("type", filterType);
      if (filterRead) params.append("isRead", filterRead);

      const data = await apiClient.get(`/notifications?${params.toString()}`);
      if (data.success) {
        const responseData = data.data as { notifications: Notification[]; pagination: Pagination };
        setNotifications(responseData.notifications);
        setPagination(responseData.pagination);
      }
    } catch (err) {
      setNotifications([]);
    }
    setLoading(false);
  };

  // Fetch stats (admin only)
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/notifications/stats", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {}
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setUnreadCount(Number(data.data.unreadCount));
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    // Only fetch stats if user is admin (optional: check role)
    fetchStats();
    // eslint-disable-next-line
  }, [page, filterType, filterRead]);

  // Mark as read
  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: "PUT",
      credentials: "include",
    });
    fetchNotifications();
    fetchUnreadCount();
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchNotifications();
    fetchUnreadCount();
  };

  // Mark all as read
  const markAllRead = async () => {
    await fetch(`/api/notifications/mark-all-read`, {
      method: "PUT",
      credentials: "include",
    });
    fetchNotifications();
    fetchUnreadCount();
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkLoading(true);
    setBulkFeedback("");
    try {
      if (!bulkRole || !bulkType || !bulkTitle || !bulkMessage) {
        setBulkFeedback("Please fill all fields.");
        setBulkLoading(false);
        return;
      }
      const data = await apiClient.post('/notifications/bulk', {
        role: bulkRole, // send role instead of userIds
        type: bulkType,
        title: bulkTitle,
        message: bulkMessage,
        sendEmail: bulkSendEmail,
      });
      if (data.success) {
        const bulkData = data.data as { sentCount: number; emailsSent?: number };
        setBulkFeedback(`Sent to ${bulkData.sentCount} users. ${bulkSendEmail ? `Emails sent: ${bulkData.emailsSent}` : ""}`);
        setBulkTitle("");
        setBulkMessage("");
        setBulkSendEmail(false);
        fetchNotifications();
      } else {
        setBulkFeedback(data.message || "Failed to send notifications.");
      }
    } catch {
      setBulkFeedback("Failed to send notifications.");
    }
    setBulkLoading(false);
  };

  // Modal component
  const BulkNotificationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
          onClick={() => setShowModal(false)}
          aria-label="Close"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-4">Send Notification to Users</h2>
        <form className="flex flex-col gap-3" onSubmit={handleSendBulk}>
          <div>
            <label className="font-semibold mr-2">Role:</label>
            <select
              value={bulkRole}
              onChange={e => setBulkRole(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="owners">Owners</option>
              <option value="customers">Customers</option>
            </select>
          </div>
          <div>
            <label className="font-semibold mr-2">Type:</label>
            <select
              value={bulkType}
              onChange={e => setBulkType(e.target.value as NotificationType)}
              className="border rounded px-2 py-1"
            >
              <option value="booking">Booking</option>
              <option value="payment">Payment</option>
              <option value="reminder">Reminder</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label className="font-semibold mr-2">Title:</label>
            <input
              type="text"
              value={bulkTitle}
              onChange={e => setBulkTitle(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              maxLength={100}
            />
          </div>
          <div>
            <label className="font-semibold mr-2">Message:</label>
            <textarea
              value={bulkMessage}
              onChange={e => setBulkMessage(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              rows={3}
              maxLength={500}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={bulkSendEmail}
              onChange={e => setBulkSendEmail(e.target.checked)}
              id="bulkSendEmail"
            />
            <label htmlFor="bulkSendEmail" className="font-semibold">Send Email</label>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
            disabled={bulkLoading}
          >
            {bulkLoading ? "Sending..." : "Send Notification"}
          </button>
          {bulkFeedback && (
            <div className="mt-2 text-sm text-red-600">{bulkFeedback}</div>
          )}
        </form>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${settings.darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-bold">
              Notifications Center
            </h1>
            <span className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
              {unreadCount} Unread
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              onClick={markAllRead}
            >
              Mark All Read
            </button>
            <button
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
              onClick={() => fetchNotifications()}
            >
              Refresh
            </button>
            {isAdmin && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={() => setShowModal(true)}
              >
                <Megaphone className="w-5 h-5" />
                Send Notification
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div>
            <label className="text-sm font-semibold mr-2">Type:</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">All</option>
              <option value="booking">Booking</option>
              <option value="payment">Payment</option>
              <option value="reminder">Reminder</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold mr-2">Read:</label>
            <select
              value={filterRead}
              onChange={e => setFilterRead(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">All</option>
              <option value="true">Read</option>
              <option value="false">Unread</option>
            </select>
          </div>
        </div>

        {/* Stats (admin only) */}
        {stats && (
          <div className="mb-6 bg-white rounded shadow p-4 flex flex-wrap gap-6">
            <div>
              <span className="font-bold text-lg">{stats.totalNotifications}</span>
              <span className="ml-2 text-gray-500">Total</span>
            </div>
            <div>
              <span className="font-bold text-lg">{stats.unreadNotifications}</span>
              <span className="ml-2 text-gray-500">Unread</span>
            </div>
            <div>
              <span className="font-bold text-lg">{stats.activeUsers}</span>
              <span className="ml-2 text-gray-500">Active Users</span>
            </div>
            <div>
              <span className="font-bold text-lg">By Type:</span>
              {stats.notificationsByType.map(t => (
                <span key={t.type} className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                  {typeLabel[t.type]}: {t.count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded shadow">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
              <span className="ml-3 text-lg">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications found.
            </div>
          ) : (
            <ul>
              {notifications.map(n => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 border-b px-4 py-4 hover:bg-blue-50 transition ${
                    n.is_read ? "opacity-70" : "bg-blue-50"
                  }`}
                >
                  <div className="mt-1">{typeIcon[n.type]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{n.title}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        n.is_read ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-700"
                      }`}>
                        {n.is_read ? "Read" : "Unread"}
                      </span>
                    </div>
                    <div className="text-gray-700 mt-1">{n.message}</div>
                    <div className="flex gap-2 mt-2">
                      {!n.is_read && (
                        <button
                          className="text-green-600 hover:underline text-sm"
                          onClick={() => markAsRead(n.id)}
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => deleteNotification(n.id)}
                      >
                        <Trash2 className="inline w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 rounded bg-gray-200"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-200"
              disabled={!pagination.hasNext}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && ReactDOM.createPortal(<BulkNotificationModal />, document.body)}
      </div>
    </div>
  );
};

export default NotificationsCenterPage;