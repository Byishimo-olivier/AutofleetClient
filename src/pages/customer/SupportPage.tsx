import React, { useState } from "react";
import { Bell, User, ChevronDown, Search, UploadCloud, ChevronUp, ChevronDown as ArrowDown } from "lucide-react";

const faqCategories = [
  { label: "Booking & Reservations" },
  { label: "Payments & Refunds" },
  { label: "Vehicle Issues" },
  { label: "Account & Profile" },
];

const supportRequests = [
  { id: "#3214", subject: "Payment Refund", date: "15 Aug 25", status: "Resolved" },
  { id: "#3210", subject: "Booking Issue", date: "14 Aug 25", status: "Pending" },
];

const statusColor: Record<string, string> = {
  Resolved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

const SupportPage: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [subject, setSubject] = useState("Booking Issue");
  const [bookingId, setBookingId] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Topbar */}
      <header className="bg-white shadow flex items-center px-8 py-3 justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo192.png" alt="AutoFleet Hub" className="w-10 h-10" />
          <span className="font-bold text-xl text-[#1746a2]">AutoFleet Hub</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-[400px]">
            <input
              type="text"
              placeholder="Search by vehicle, location..."
              className="w-full border rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white p-2 rounded-full shadow">
            <Bell className="w-5 h-5 text-gray-500" />
          </button>
          <div className="bg-white rounded-lg px-3 py-1 flex items-center gap-2 shadow">
            EN <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-500" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto py-8 flex flex-col md:flex-row gap-6">
        {/* Left: FAQ & Support Form */}
        <div className="flex-1 space-y-6">
          {/* FAQ Search & Categories */}
          <div className="bg-white rounded-xl shadow p-6 border border-blue-200">
            <div className="font-semibold text-lg mb-4 flex items-center gap-2 text-blue-700">
              <Search className="w-5 h-5" /> Find Answers Quickly
            </div>
            <input
              type="text"
              placeholder="Type your question..."
              className="w-full border rounded-lg px-4 py-2 mb-4 text-sm focus:outline-none focus:ring"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqCategories.map((cat, i) => (
                <div key={cat.label} className="border rounded-lg px-4 py-3 bg-blue-50">
                  <button
                    className="flex items-center justify-between w-full font-semibold text-blue-900"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <span>{cat.label}</span>
                    {expanded === i ? <ChevronUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </button>
                  {expanded === i && (
                    <div className="mt-2 text-sm text-gray-600">
                      {/* Example FAQ content */}
                      <div>- How do I make a booking?</div>
                      <div>- How do I cancel a reservation?</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support Form */}
          <div className="bg-white rounded-xl shadow p-6 border border-blue-200 mt-6">
            <div className="font-semibold text-lg mb-4 flex items-center gap-2 text-blue-700">
              <Search className="w-5 h-5" /> Contact Support
            </div>
            <form>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">Subject</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  >
                    <option>Booking Issue</option>
                    <option>Payment Issue</option>
                    <option>Vehicle Issue</option>
                    <option>Account Issue</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">Booking ID (Optional)</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g., BK0205001"
                    value={bookingId}
                    onChange={e => setBookingId(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Describe your issue in detail..."
                  rows={3}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Attachments (Optional)</label>
                <label className="w-full border-2 border-dashed rounded flex flex-col items-center justify-center py-6 cursor-pointer text-gray-400 hover:border-blue-400">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <span>Drag files here or browse</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                  {file && (
                    <span className="mt-2 text-xs text-green-700">{file.name}</span>
                  )}
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-900"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>

        {/* Right: Quick Contact, Hours, My Requests */}
        <div className="w-full md:w-80 flex flex-col gap-6">
          {/* Quick Contact */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold mb-2">Quick Contact</div>
            <div className="space-y-2 text-sm">
              <div className="border rounded px-3 py-2 flex items-center gap-2">
                <span className="font-semibold">Call Support</span>
                <span className="ml-auto text-blue-700">+1 (234) 567-890</span>
              </div>
              <div className="border rounded px-3 py-2 flex items-center gap-2">
                <span className="font-semibold">Email Support</span>
                <span className="ml-auto text-blue-700 text-xs">support@autofleet.com</span>
              </div>
              <div className="border rounded px-3 py-2 flex items-center gap-2">
                <span className="font-semibold">Live Chat</span>
                <span className="ml-auto text-blue-700 text-xs">Chat with our team</span>
              </div>
            </div>
          </div>
          {/* Support Hours */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold mb-2">Support Hours</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span>Monday - Friday:</span><span>8:00 AM - 10:00 PM</span></div>
              <div className="flex justify-between"><span>Saturday:</span><span>9:00 AM - 8:00 PM</span></div>
              <div className="flex justify-between"><span>Sunday:</span><span>10:00 AM - 6:00 PM</span></div>
              <div className="mt-2 text-green-700 flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Currently Online
              </div>
            </div>
          </div>
          {/* My Support Requests */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">My Support Requests</div>
              <button className="text-blue-700 text-xs font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-2 text-sm">
              {supportRequests.map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="font-semibold">{req.id}</div>
                  <div className="flex-1">{req.subject}</div>
                  <div className="text-gray-400 text-xs">{req.date}</div>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor[req.status]}`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportPage;