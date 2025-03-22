// components/PredictResume.jsx
import React, { useState } from 'react';
import axios from 'axios';

const PredictResume = ({ onPrediction }) => {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setPrediction(null);
  };
  const API_URL = "https://job-board-backend-latest.onrender.com";
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resume file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file); // Ensure this matches the backend key name
      
      const response = await axios.post(
        `${API_URL}/api/jobs`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setPrediction(response.data);
      setError('');
      if (onPrediction) {
        onPrediction(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed');
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-800 rounded-lg shadow-lg mb-6 w-10/12">
      <div className="md:flex md:space-x-6">
        {/* Form Section */}
        <div className="md:w-1/2">
          <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            <div>
              <label className="block text-gray-300 mb-2">
                Upload Resume (TXT file):
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".txt"
                  className="mt-1 block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
              </label>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-500 w-full"
            >
              {loading ? 'Predicting...' : 'Predict Job Title'}
            </button>
          </form>
        </div>

        {/* Prediction Result Section */}
        {prediction && (
          <div className="mt-6 md:mt-0">
            <div className="p-4 bg-slate-700 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-200 mb-4">Prediction Results:</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-gray-300">Job Category:</span> {prediction.result_category}
                  <span className="font-medium text-gray-300 pl-4">Confidence:</span> {prediction.confidence}%
                </p>
                {/* <p>
                 
                </p> */}
                <div>
                  <span className="font-medium text-gray-300">Skills Found:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {prediction.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 rounded-full bg-slate-600 text-slate-200 text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictResume;
