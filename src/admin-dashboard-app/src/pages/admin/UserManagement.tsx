import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useSettings } from "@/contexts/SettingContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching users
    setTimeout(() => {
      setUsers([
        { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddUser = () => {
    navigate("/admin/users/add");
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className={`p-8 ${settings.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <Button onClick={handleAddUser} className="mb-4">Add User</Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map(user => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center">
              <User className="w-6 h-6 mr-2" />
              <div>
                <h2 className="font-semibold">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600">{user.role}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;