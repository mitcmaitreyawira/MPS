import React, { useState } from 'react';
import { AwardPopup, AwardDetailPopup, ConfirmationPopup } from './AwardPopup';
import { Button } from './Button';
import { Card } from './Card';

/**
 * Example component demonstrating various uses of the AwardPopup components
 * This file serves as both documentation and testing for the popup components
 */
export const AwardPopupExamples: React.FC = () => {
  const [showBasicPopup, setShowBasicPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showCustomPopup, setShowCustomPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sample award data
  const sampleAward = {
    name: 'Excellence in Mathematics',
    description: 'Awarded for outstanding performance and dedication in mathematical studies, demonstrating exceptional problem-solving skills and consistent high achievement.',
    icon: '🏆',
    type: 'academic',
    tier: 'gold',
    recipientName: 'John Smith',
    awardedOn: '2024-01-15T10:30:00Z',
    awardedBy: 'Dr. Sarah Johnson'
  };

  const handleEdit = () => {
    console.log('Edit award clicked');
    setShowDetailPopup(false);
  };

  const handleDelete = () => {
    console.log('Delete award clicked');
    setShowDetailPopup(false);
    setShowConfirmPopup(true);
  };

  const handleRevoke = () => {
    console.log('Revoke award clicked');
    setShowDetailPopup(false);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setShowConfirmPopup(false);
    console.log('Award deleted successfully');
  };

  const handleCustomSubmit = async () => {
    setIsLoading(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setShowCustomPopup(false);
    console.log('Custom form submitted');
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Award Popup Components Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Basic Popup Example */}
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Basic Popup</h3>
            <p className="text-sm text-gray-600 mb-4">Simple popup with custom content and actions</p>
            <Button onClick={() => setShowBasicPopup(true)} variant="primary">
              Open Basic Popup
            </Button>
          </div>
        </Card>

        {/* Award Detail Popup Example */}
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Award Details</h3>
            <p className="text-sm text-gray-600 mb-4">Specialized popup for displaying award information</p>
            <Button onClick={() => setShowDetailPopup(true)} variant="secondary">
              View Award Details
            </Button>
          </div>
        </Card>

        {/* Confirmation Popup Example */}
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Confirmation</h3>
            <p className="text-sm text-gray-600 mb-4">Confirmation dialog with different variants</p>
            <Button onClick={() => setShowConfirmPopup(true)} variant="danger">
              Delete Something
            </Button>
          </div>
        </Card>

        {/* Custom Form Popup Example */}
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Custom Form</h3>
            <p className="text-sm text-gray-600 mb-4">Custom popup with form elements and validation</p>
            <Button onClick={() => setShowCustomPopup(true)} variant="neutral">
              Open Custom Form
            </Button>
          </div>
        </Card>
      </div>

      {/* Basic Popup */}
      <AwardPopup
        isOpen={showBasicPopup}
        onClose={() => setShowBasicPopup(false)}
        title="Basic Award Popup"
        size="md"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setShowBasicPopup(false),
            variant: 'neutral'
          },
          {
            label: 'Save Changes',
            onClick: () => {
              console.log('Save clicked');
              setShowBasicPopup(false);
            },
            variant: 'primary'
          }
        ]}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            This is a basic popup example with custom content. You can put any React components here.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Responsive design</li>
              <li>• Keyboard navigation (ESC to close)</li>
              <li>• Customizable actions</li>
              <li>• Multiple size options</li>
              <li>• Overlay click to close</li>
            </ul>
          </div>
        </div>
      </AwardPopup>

      {/* Award Detail Popup */}
      <AwardDetailPopup
        isOpen={showDetailPopup}
        onClose={() => setShowDetailPopup(false)}
        award={sampleAward}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRevoke={handleRevoke}
        isLoading={isLoading}
      />

      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        title="Confirm Deletion"
        message="Are you sure you want to delete this award? This action cannot be undone and will permanently remove the award from the system."
        confirmLabel="Delete Award"
        cancelLabel="Keep Award"
        onConfirm={handleConfirmDelete}
        variant="danger"
        isLoading={isLoading}
      />

      {/* Custom Form Popup */}
      <AwardPopup
        isOpen={showCustomPopup}
        onClose={() => setShowCustomPopup(false)}
        title="Create New Award"
        size="lg"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setShowCustomPopup(false),
            variant: 'neutral',
            disabled: isLoading
          },
          {
            label: 'Create Award',
            onClick: handleCustomSubmit,
            variant: 'primary',
            loading: isLoading
          }
        ]}
        closeOnOverlayClick={!isLoading}
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCustomSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Award Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter award name"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Award Type
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option key="academic" value="academic">Academic</option>
                <option key="behavior" value="behavior">Behavior</option>
                <option key="participation" value="participation">Participation</option>
                <option key="leadership" value="leadership">Leadership</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter award description"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tier
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option key="bronze" value="bronze">Bronze</option>
                <option key="silver" value="silver">Silver</option>
                <option key="gold" value="gold">Gold</option>
                <option key="platinum" value="platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option key="trophy" value="🏆">🏆 Trophy</option>
                <option key="gold_medal" value="🥇">🥇 Gold Medal</option>
                <option key="star" value="⭐">⭐ Star</option>
                <option key="target" value="🎯">🎯 Target</option>
              </select>
            </div>
          </div>
        </form>
      </AwardPopup>
    </div>
  );
};

export default AwardPopupExamples;