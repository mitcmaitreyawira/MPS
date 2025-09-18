import React from 'react';
import { PasswordManagement } from '../../components/admin/PasswordManagement';

const PasswordManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Password Management
        </h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <PasswordManagement />
        </div>
      </div>
    </div>
  );
};

export default PasswordManagementPage;
