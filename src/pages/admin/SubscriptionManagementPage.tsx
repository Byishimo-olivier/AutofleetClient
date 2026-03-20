import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  FileText,
  Users,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from "lucide-react";
import { useSettings } from "@/contexts/SettingContxt";
import { apiClient } from '@/services/apiClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';

interface Subscription {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  plan_id: string;
  status: string;
  amount: number;
  payment_transaction_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

const SubscriptionManagementPage: React.FC = () => {
  const { settings, formatPrice } = useSettings();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pdfExportLoading, setPdfExportLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Subscription[]>('/subscriptions/admin/all');
      if (response.success && Array.isArray(response.data)) {
        setSubscriptions(response.data);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const fullName = `${sub.first_name} ${sub.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                         sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "" || sub.status === statusFilter;
    
    // Check for expiration
    if (statusFilter === "expired") {
      return matchesSearch && new Date(sub.end_date) < new Date();
    }
    if (statusFilter === "active") {
      return matchesSearch && sub.status === 'active' && new Date(sub.end_date) >= new Date();
    }
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (sub: Subscription) => {
    const now = new Date();
    const endDate = new Date(sub.end_date);
    
    if (sub.status === 'active' && endDate >= now) {
      return (
        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
          <CheckCircle className="w-3 h-3" /> Active
        </span>
      );
    } else if (sub.status === 'active' && endDate < now) {
      return (
        <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
          <Clock className="w-3 h-3" /> Expired
        </span>
      );
    } else if (sub.status === 'pending') {
      return (
        <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">
          <XCircle className="w-3 h-3" /> {sub.status}
        </span>
      );
    }
  };

  const handlePDFExport = () => {
    setPdfExportLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFillColor(44, 62, 125);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('Subscription Management Report', 20, 18);
      
      const tableData = filteredSubscriptions.map((sub, i) => [
        (i + 1).toString(),
        `${sub.first_name} ${sub.last_name}`,
        sub.plan_id.toUpperCase(),
        formatPrice(sub.amount),
        sub.status.toUpperCase(),
        new Date(sub.end_date).toLocaleDateString()
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['#', 'Owner', 'Plan', 'Amount', 'Status', 'Expiry Date']],
        body: tableData,
      });

      doc.save(`Subscriptions_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setPdfExportLoading(false);
    }
  };

  return (
    <div className={`flex-1 ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} p-8`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-600" /> Subscription Management
          </h1>
          <p className="text-gray-500 mt-1">Monitor and manage owner subscription plans and payments.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handlePDFExport}
            disabled={pdfExportLoading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow disabled:opacity-50"
          >
            <FileText className="w-5 h-5" /> {pdfExportLoading ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Subscriptions</p>
              <p className="text-2xl font-bold">{subscriptions.length}</p>
            </div>
            <CreditCard className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Subscriptions</p>
              <p className="text-2xl font-bold text-green-600">
                {subscriptions.filter(s => s.status === 'active' && new Date(s.end_date) >= new Date()).length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Expired</p>
              <p className="text-2xl font-bold text-red-600">
                {subscriptions.filter(s => new Date(s.end_date) < new Date()).length}
              </p>
            </div>
            <Clock className="w-10 h-10 text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by owner name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Owner</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Expiry Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Transaction ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10">Loading subscriptions...</td></tr>
            ) : filteredSubscriptions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10">No subscriptions found.</td></tr>
            ) : (
              filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{sub.first_name} {sub.last_name}</div>
                    <div className="text-xs text-gray-500">{sub.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold uppercase ${sub.plan_id === 'premium' ? 'text-purple-600' : 'text-blue-600'}`}>
                      {sub.plan_id}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {formatPrice(sub.amount)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(sub)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(sub.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">
                    {sub.payment_transaction_id}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionManagementPage;
