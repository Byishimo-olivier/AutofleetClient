import React from 'react';

const NotificationsCenter: React.FC = () => {
  return (
    <div className="flex flex-col p-8">
      <h1 className="text-2xl font-bold mb-4">Notifications Center</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Recent Notifications</h2>
        <ul className="space-y-2">
          <li className="border-b py-2">
            <span className="font-medium">New booking request received.</span>
            <span className="text-gray-500 text-sm">2 minutes ago</span>
          </li>
          <li className="border-b py-2">
            <span className="font-medium">User John Doe has updated their profile.</span>
            <span className="text-gray-500 text-sm">10 minutes ago</span>
          </li>
          <li className="border-b py-2">
            <span className="font-medium">System maintenance scheduled for tonight.</span>
            <span className="text-gray-500 text-sm">1 hour ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationsCenter;