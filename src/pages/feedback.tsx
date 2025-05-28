import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, RefreshCw, MessageSquare, Bug, Lightbulb } from 'lucide-react';
import { BACKEND_URL } from '../config/constant';
import {useNavigate }from 'react-router-dom';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'problem' | '';

const ShopkeeperFeedback: React.FC= () => {
    const ownerId  = localStorage.getItem("ownerId") || localStorage.getItem("userId") || 899;
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const feedbackOptions = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-600' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-blue-600' },
    { value: 'improvement', label: 'Improvement Suggestion', icon: MessageSquare, color: 'text-green-600' },
    { value: 'problem', label: 'Problem/Issue', icon: AlertCircle, color: 'text-orange-600' }
  ];
  const navigate = useNavigate();

  const handleSubmit = async () => {
    
    if (!feedbackType || !title.trim() || !description.trim()) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/shop/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId,
          feedbackType,

          title: title.trim(),
          description: description.trim(),
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFeedbackType('');
        setTitle('');
        setDescription('');
        
        // Navigate to profile after 3 seconds
        setTimeout(() => {
         navigate("/bprofile")
        }, 3000);
      } else {
        throw new Error(`Failed to submit feedback: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  if (submitStatus === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Feedback Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Thank you for your feedback. Our team will contact you within 2 working days.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              Redirecting to your profile page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Feedback</h2>
        <p className="text-gray-600">
          Help us improve our platform by sharing your thoughts, reporting issues, or suggesting new features.
        </p>
      </div>

      <div className="space-y-6">
        {/* Feedback Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What type of feedback do you want to share?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {feedbackOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFeedbackType(option.value as FeedbackType)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    feedbackType === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`h-5 w-5 ${option.color}`} />
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of your feedback"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide detailed information about your feedback..."
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-vertical"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">{description.length}/1000 characters</p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !feedbackType || !title.trim() || !description.trim()}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Feedback
              </>
            )}
          </button>

          {submitStatus === 'error' && (
            <button
              type="button"
              onClick={handleRetry}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Owner ID Display (for development) */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
      
      </div>
    </div>
  );
};

// Example usage component
const Feedback: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'feedback' | 'profile'>('feedback');
  
  const handleNavigateToProfile = () => {
    setCurrentPage('profile');
  };

  if (currentPage === 'profile') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Page</h2>
        <p className="text-gray-600 mb-4">You have been redirected to your profile.</p>
        <button
          onClick={() => setCurrentPage('feedback')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Feedback
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ShopkeeperFeedback 
        ownerId="shop_owner_123" 
        onNavigateToProfile={handleNavigateToProfile}
      />
    </div>
  );
};

export default Feedback;