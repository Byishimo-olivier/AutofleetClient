import React, { useState, useEffect } from "react";
import { Search, UploadCloud, ChevronUp, ChevronDown as ArrowDown } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useSettings } from '@/contexts/SettingContxt';

// Declare Intercom on the Window interface for TypeScript
declare global {
  interface Window {
    Intercom?: (...args: any[]) => void;
  }
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  order_index: number;
}

interface SupportRequest {
  id: number;
  ticket_id: string;
  subject: string;
  status: string;
  created_at: string;
  response_count: number;
}

interface GroupedFAQs {
  [category: string]: FAQ[];
}

const statusColor: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  waiting_for_support: "bg-orange-100 text-orange-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

const SupportPage: React.FC = () => {
  const { settings, formatPrice, t } = useSettings();
  
  const [expanded, setExpanded] = useState<number | null>(null);
  const [subject, setSubject] = useState("booking");
  const [bookingId, setBookingId] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for API data
  const [faqs, setFaqs] = useState<GroupedFAQs>({});
  const [faqCategories, setFaqCategories] = useState<string[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [searchResults, setSearchResults] = useState<FAQ[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFAQs();
    fetchSupportRequests();
  }, []);

  // Search FAQs when search query changes
  useEffect(() => {
    if (searchQuery.length >= 3) {
      searchFAQs();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchFAQs = async () => {
    try {
      const response = await apiClient.get('/support/faq');
      if (response && response.success) {
        const data = response.data as { faqs: GroupedFAQs; categories: string[] };
        setFaqs(data.faqs);
        setFaqCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportRequests = async () => {
    try {
      const response = await apiClient.get('/support/requests?limit=5');
      if (response && response.success) {
        setSupportRequests((response.data as { requests: SupportRequest[] }).requests);
      }
    } catch (error) {
      console.error('Error fetching support requests:', error);
    }
  };

  const searchFAQs = async () => {
    try {
      const response = await apiClient.get(`/support/faq/search?q=${encodeURIComponent(searchQuery)}`);
      if (response && response.success) {
        setSearchResults(response.data as FAQ[]);
      }
    } catch (error) {
      console.error('Error searching FAQs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || description.length < 10) {
      alert('Please provide a description of at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('description', description);
      formData.append('category', subject);
      
      if (bookingId.trim()) {
        formData.append('booking_id', bookingId);
      }
      
      if (file) {
        formData.append('attachment', file);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/support/requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('autofleet_token') || localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alert(`Support request submitted successfully! Ticket ID: ${result.data.ticketId}`);
        
        // Reset form
        setDescription("");
        setBookingId("");
        setFile(null);
        
        // Refresh support requests
        fetchSupportRequests();
      } else {
        alert(result.message || 'Failed to submit support request');
      }
    } catch (error) {
      console.error('Error submitting support request:', error);
      alert('Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    });
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading support page...</div>
      </div>
    );
  }

  return (
    <div className={settings.darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-2">Search Results:</h3>
                  {searchResults.map((faq) => (
                    <div key={faq.id} className="mb-3 p-3 bg-white rounded border">
                      <div className="font-medium text-gray-800 mb-1">{faq.question}</div>
                      <div className="text-sm text-gray-600">{faq.answer}</div>
                      <div className="text-xs text-blue-600 mt-1">Category: {faq.category}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* FAQ Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faqCategories.map((category, i) => (
                  <div key={category} className="border rounded-lg px-4 py-3 bg-blue-50">
                    <button
                      className="flex items-center justify-between w-full font-semibold text-blue-900"
                      onClick={() => setExpanded(expanded === i ? null : i)}
                    >
                      <span>{category}</span>
                      {expanded === i ? <ChevronUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    </button>
                    {expanded === i && (
                      <div className="mt-2 text-sm text-gray-600 space-y-2">
                        {faqs[category]?.map((faq) => (
                          <div key={faq.id} className="border-l-2 border-blue-300 pl-3">
                            <div className="font-medium text-gray-800">{faq.question}</div>
                            <div className="text-gray-600 mt-1">{faq.answer}</div>
                          </div>
                        ))}
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
              <form onSubmit={handleSubmit}>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">Subject</label>
                    <select
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      required
                    >
                      <option value="booking">Booking Issue</option>
                      <option value="payment">Payment Issue</option>
                      <option value="vehicle">Vehicle Issue</option>
                      <option value="account">Account Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">Booking ID (Optional)</label>
                    <input
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="e.g., 39"
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
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    minLength={10}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters required ({description.length}/10)
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Attachments (Optional)</label>
                  <label className="w-full border-2 border-dashed rounded flex flex-col items-center justify-center py-6 cursor-pointer text-gray-400 hover:border-blue-400">
                    <UploadCloud className="w-8 h-8 mb-2" />
                    <span>Drag files here or browse</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                      onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                    />
                    {file && (
                      <span className="mt-2 text-xs text-green-700">{file.name}</span>
                    )}
                  </label>
                  <div className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, PDF, DOC, DOCX, TXT (Max: 10MB)
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim() || description.length < 10}
                  className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
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
                <a 
                  href="tel:+250783227490"
                  className="border rounded px-3 py-2 flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <span className="font-semibold">Call Support</span>
                  <span className="ml-auto text-blue-700">+250 (783) 227-490</span>
                </a>
                <a 
                  href="mailto:oliverbyo34@gmail.com?subject=Support Request - AutoFleet&body=Hello AutoFleet Support Team,%0D%0A%0D%0AI need assistance with:%0D%0A%0D%0APlease describe your issue here..."
                  className="border rounded px-3 py-2 flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <span className="font-semibold">Email Support</span>
                  <span className="ml-auto text-blue-700 text-xs">support@autofleet.com</span>
                </a>
                <button 
                  onClick={() => window.Intercom && window.Intercom('show')}
                  className="w-full border rounded px-3 py-2 flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <span className="font-semibold">Live Chat</span>
                  <span className="ml-auto text-blue-700 text-xs">Chat with our team</span>
                </button>
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
              {supportRequests.length > 0 ? (
                <div className="space-y-2 text-sm">
                  {supportRequests.map((req) => (
                    <div key={req.id} className="border rounded p-2">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold text-blue-700">{req.ticket_id}</div>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor[req.status]}`}>
                          {formatStatus(req.status)}
                        </span>
                      </div>
                      <div className="text-gray-700 mb-1">{req.subject}</div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatDate(req.created_at)}</span>
                        <span>{req.response_count} responses</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  No support requests yet
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupportPage;