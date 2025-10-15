import React, { useState, useEffect } from "react";
import {
  BarChart2,
  ClipboardList,
  Car,
  Users,
  User,
  LogOut,
  FileText,
  Settings,
  Bell,
  UserPlus,
  PieChart,
  MessageCircle,
  Shield,
  Sliders,
  AlertCircle,
  Edit,
  Trash2,
  Search,
  Download,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSettings } from "@/contexts/SettingContxt";
import { apiClient } from '@/services/apiClient';

const adminNav = [
  { icon: <BarChart2 className="w-5 h-5" />, label: "Dashboard", to: "/admin" },
  { icon: <Users className="w-5 h-5" />, label: "User Management", to: "/admin/users" },
  { icon: <Car className="w-5 h-5" />, label: "Vehicle Management", to: "/admin/vehicles" },
  { icon: <ClipboardList className="w-5 h-5" />, label: "Bookings Management", to: "/admin/bookings" },
  { icon: <PieChart className="w-5 h-5" />, label: "Reports & Analytics", to: "/admin/reports" },
  { icon: <MessageCircle className="w-5 h-5" />, label: "Disputes & Support", to: "/admin/disputes" },
  { icon: <Sliders className="w-5 h-5" />, label: "System Settings", to: "/admin/settings" },
  { icon: <AlertCircle className="w-5 h-5" />, label: "Notifications Center", to: "/admin/notifications" },
  { icon: <User className="w-5 h-5" />, label: "Profile & Account", to: "/profile" },
];

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface UserStats {
  total: number;
  admin: number;
  owner: number;
  customer: number;
  active: number;
  inactive: number;
}

interface NewUser {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
}

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, formatPrice, t } = useSettings();

  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    admin: 0,
    owner: 0,
    customer: 0,
    active: 0,
    inactive: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "customer"
  });

  // Fetch users with filters
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50", // Increased limit to see more users
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter && { role: roleFilter }),
      });

      console.log('Fetching users with params:', params.toString());
      const response = await apiClient.get(`/users/admin/all?${params}`);
      console.log('Users API Response:', response);
      
      if (response.success && response.data) {
        let usersData = [];
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
          usersData = response.data;
          setTotalPages(Math.ceil(response.data.length / 50));
        } else if (
          typeof response.data === 'object' &&
          response.data !== null &&
          'users' in response.data &&
          Array.isArray((response.data as any).users)
        ) {
          usersData = (response.data as any).users;
          setTotalPages((response.data as any).pagination?.totalPages || 1);
        } else if (
          typeof response.data === 'object' &&
          response.data !== null &&
          'data' in response.data &&
          Array.isArray((response.data as any).data)
        ) {
          usersData = (response.data as any).data;
          setTotalPages((response.data as any).pagination?.totalPages || 1);
        }
        
        console.log('Users data:', usersData);
        setUsers(usersData);
        
        // Calculate stats from users data as a backup
        setTimeout(() => {
          if (userStats.total === 0 && usersData.length > 0) {
            console.log('Stats are 0 but we have users, calculating stats...');
            interface StatsAccumulator {
              total: number;
              admin: number;
              owner: number;
              customer: number;
              active: number;
              inactive: number;
            }

            interface StatsUser {
              role: string;
              is_active: boolean;
            }

            const stats = usersData.reduce((acc: StatsAccumulator, user: StatsUser) => {
              acc.total++;
              if (user.role === 'admin') acc.admin++;
              else if (user.role === 'owner') acc.owner++;
              else if (user.role === 'customer') acc.customer++;
              
              if (user.is_active) acc.active++;
              else acc.inactive++;
              
              return acc;
            }, {
              total: 0,
              admin: 0,
              owner: 0,
              customer: 0,
              active: 0,
              inactive: 0
            });
            
            console.log('Calculated stats from users data:', stats);
            setUserStats(stats);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user stats - Updated with better handling
  const fetchUserStats = async () => {
    try {
      const response = await apiClient.get('/users/admin/stats/roles');
      console.log('User stats API response:', response);
      
      if (response.success && response.data) {
        // Handle different response structures
        let statsData = response.data as Partial<UserStats> ?? {};
        
        // If the response has a nested data property
        if (
          typeof response.data === 'object' &&
          response.data !== null &&
          'data' in response.data
        ) {
          statsData = ((response.data as any).data as Partial<UserStats>) ?? {};
        }
        
        console.log('Stats data:', statsData);
        
        setUserStats({
          total: statsData.total ?? 0,
          admin: statsData.admin ?? 0,
          owner: statsData.owner ?? 0,
          customer: statsData.customer ?? 0,
          active: statsData.active ?? 0,
          inactive: statsData.inactive ?? 0,
        });
      } else {
        // Fallback: calculate stats from users data if stats API fails
        console.warn('Stats API failed, calculating from users data');
        calculateStatsFromUsers();
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Fallback: calculate stats from users data
      calculateStatsFromUsers();
    }
  };

  // Calculate stats from users data as fallback
  const calculateStatsFromUsers = () => {
    if (users.length > 0) {
      const stats = users.reduce((acc, user) => {
        acc.total++;
        if (user.role === 'admin') acc.admin++;
        else if (user.role === 'owner') acc.owner++;
        else if (user.role === 'customer') acc.customer++;
        
        if (user.is_active) acc.active++;
        else acc.inactive++;
        
        return acc;
      }, {
        total: 0,
        admin: 0,
        owner: 0,
        customer: 0,
        active: 0,
        inactive: 0
      });
      
      console.log('Calculated stats from users:', stats);
      setUserStats(stats);
    }
  };

  // Create new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      const response = await apiClient.post('/users/admin/create', newUser);
      
      if (response.success) {
        alert('User created successfully');
        setShowCreateModal(false);
        setNewUser({
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          phone: "",
          role: "customer"
        });
        await fetchUsers();
        await fetchUserStats();
      } else {
        alert('Failed to create user: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle bulk role update
  const handleBulkRoleUpdate = async (newRole: string) => {
    if (selectedUsers.length === 0) {
      alert('Please select users to update');
      return;
    }

    try {
      setBulkActionLoading(true);
      const response = await apiClient.put('/users/admin/bulk-update', {
        userIds: selectedUsers,
        action: "role",
        value: newRole
      });

      if (response.success) {
        await fetchUsers();
        await fetchUserStats();
        setSelectedUsers([]);
        alert('Users updated successfully');
      } else {
        alert('Failed to update users');
      }
    } catch (error) {
      console.error('Error updating users:', error);
      alert('Error updating users');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      setExportLoading(true);
      const params = new URLSearchParams({
        format: 'csv',
        ...(roleFilter && { role: roleFilter }),
      });

      const response = await fetch(`/api/users/admin/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Export failed');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // Toggle user selection
  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all users
  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, roleFilter]);

  useEffect(() => {
    fetchUserStats();
  }, []);

  // Also fetch stats after users are loaded
  useEffect(() => {
    if (users.length > 0 && userStats.total === 0) {
      // Try to fetch stats again or calculate from users
      setTimeout(() => fetchUserStats(), 500);
    }
  }, [users]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (loading && users.length === 0) {
    return (
      <div className={`min-h-screen ${settings.darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="flex items-center justify-center h-64">
          <div className={`text-lg ${settings.darkMode ? "text-white" : "text-gray-900"}`}>
            Loading users...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-[#2c3e7d] text-white flex flex-col shadow-lg">
        <div className="px-4 py-6 border-b border-[#3d4f8f]">
          <h1 className="text-xl font-bold">AutoFleet Hub</h1>
        </div>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#3d4f8f]">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">Admin</span>
            <span className="text-xs text-gray-400">admin@example.com</span>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4">
          {adminNav.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer
              ${location.pathname === item.to ? "bg-[#3d4f8f] text-white" : "text-gray-300 hover:bg-[#3d4f8f] hover:text-white"}
              `}
              onClick={() => navigate(item.to)}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="p-3">
          <button className="w-full flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-white py-2.5 rounded-lg transition font-medium text-sm shadow-md">
            <LogOut className="mr-2 w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Top search bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 flex items-center">
            <input
              type="text"
              placeholder="Search ..."
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring w-80 bg-white shadow-sm text-gray-900"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-white p-2 rounded-full shadow">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>
            <div className="bg-white rounded-lg px-3 py-1 flex items-center gap-2 shadow">
              <span className="text-gray-700">EN</span> <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Customers</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.customer}</p>
              </div>
              <User className="w-10 h-10 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Owners</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.owner}</p>
              </div>
              <Car className="w-10 h-10 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.active}</p>
              </div>
              <Shield className="w-10 h-10 text-orange-600" />
            </div>
          </div>
        </div>

        {/* User Management Title and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-lg text-gray-700">User Management</div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow disabled:opacity-50"
            >
              <Download className="w-5 h-5" /> 
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-[#1746a2] hover:bg-[#12367a] text-white px-5 py-2 rounded-lg font-semibold shadow"
            >
              <UserPlus className="w-5 h-5" /> Add New User
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center border-2 border-gray-300 rounded-lg px-4 py-3 bg-white w-80 shadow-sm">
            <Search className="w-5 h-5 text-gray-600 mr-3" />
            <input
              type="text"
              placeholder="Search User By name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-gray-900 placeholder-gray-600 font-medium"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border-2 border-gray-300 rounded-lg px-4 py-3 text-sm bg-white text-gray-900 shadow-sm min-w-[160px] font-medium"
          >
            <option value="" className="text-gray-900 font-medium">All Roles</option>
            <option value="admin" className="text-gray-900 font-medium">Admin</option>
            <option value="owner" className="text-gray-900 font-medium">Owner</option>
            <option value="customer" className="text-gray-900 font-medium">Customer</option>
          </select>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-3">
              <select 
                onChange={(e) => e.target.value && handleBulkRoleUpdate(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-3 text-sm bg-white text-gray-900 shadow-sm font-medium"
                disabled={bulkActionLoading}
              >
                <option value="" className="text-gray-900 font-medium">Change Role</option>
                <option value="admin" className="text-gray-900 font-medium">Make Admin</option>
                <option value="owner" className="text-gray-900 font-medium">Make Owner</option>
                <option value="customer" className="text-gray-900 font-medium">Make Customer</option>
              </select>
              <span className="text-sm text-gray-700 font-semibold bg-blue-100 px-3 py-2 rounded-lg">
                {selectedUsers.length} selected
              </span>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button onClick={toggleSelectAll} className="hover:bg-gray-100 p-1 rounded">
                      {selectedUsers.length === users.length && users.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="text-gray-500 text-lg font-medium">Loading users...</div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="text-gray-500 text-lg font-medium">No users found</div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleUserSelection(user.id)}
                          className="hover:bg-gray-100 p-1 rounded"
                        >
                          {selectedUsers.includes(user.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">
                          {user.first_name} {user.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={`mailto:${user.email}`} 
                          className="text-blue-700 underline font-medium hover:text-blue-800"
                        >
                          {user.email}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'owner' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-3 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this user?')) {
                                // Handle delete user
                              }
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-3 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-bold ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-2 border-blue-600'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-96 max-w-90vw">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.first_name}
                    onChange={(e) => setNewUser(prev => ({...prev, first_name: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.last_name}
                    onChange={(e) => setNewUser(prev => ({...prev, last_name: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({...prev, email: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({...prev, phone: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({...prev, password: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({...prev, role: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="customer">Customer</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;