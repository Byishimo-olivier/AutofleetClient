import React from 'react';

interface AuthFormWrapperProps {
  children: React.ReactNode;
}

const AuthFormWrapper: React.FC<AuthFormWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <span className="text-2xl font-bold text-gray-900">AutoFleet Hub</span>
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white shadow-md rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthFormWrapper;