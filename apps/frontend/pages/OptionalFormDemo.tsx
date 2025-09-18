import React from 'react';
import OptionalCredentialsForm from '../components/OptionalCredentialsForm';

interface FormData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

const OptionalFormDemo: React.FC = () => {
  const handleFormSubmit = async (data: FormData) => {
    console.log('Form submitted with data:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // You can add actual API logic here if needed
    alert(`Form submitted successfully!\n\nData received:\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Optional Credentials Form Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This form demonstrates a user-friendly approach where all fields are optional. 
            Users can submit the form without filling in any credentials, making it accessible 
            and non-intimidating for various use cases.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <OptionalCredentialsForm 
            onSubmit={handleFormSubmit}
            className="mb-8"
          />
        </div>

        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">No Required Fields</h3>
                    <p className="text-gray-600 text-sm">All input fields are completely optional - users can submit with empty fields</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">No Validation Constraints</h3>
                    <p className="text-gray-600 text-sm">Form accepts any input without enforcing password complexity or email format</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">User-Friendly Interface</h3>
                    <p className="text-gray-600 text-sm">Clear labeling indicates all fields are optional with helpful placeholder text</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Real-time Preview</h3>
                    <p className="text-gray-600 text-sm">Form data is displayed in real-time so users can see what they're submitting</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Reset Functionality</h3>
                    <p className="text-gray-600 text-sm">Users can easily clear all fields and start over with the reset button</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Flexible Submission</h3>
                    <p className="text-gray-600 text-sm">Form can be submitted with any combination of filled or empty fields</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Use Cases
            </h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Guest registration where users can provide minimal information</li>
              <li>• Progressive profiling where users can add details over time</li>
              <li>• Feedback forms where contact information is optional</li>
              <li>• Survey forms where demographic information is voluntary</li>
              <li>• Beta testing sign-ups with flexible requirements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionalFormDemo;