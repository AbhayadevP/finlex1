// src/components/TutorialOverlay.tsx
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const tutorials = [
  {
    title: "Welcome to FINLEX",
    description: "Your advanced financial platform for crypto trading and portfolio management.",
    image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Real-Time Analytics",
    description: "Track your investments with advanced charts and real-time market data.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "AI-Powered Assistant",
    description: "Get instant help from our AI assistant for any questions about trading or the platform.",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&w=800&q=80"
  }
];

const TutorialOverlay = () => {
  // Start with the tutorial visible
  const [isVisible, setIsVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const handleNext = () => {
    if (currentStep < tutorials.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // If not visible, don't render anything
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full mx-4 overflow-hidden shadow-2xl">
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative h-64">
            <img
              src={tutorials[currentStep].image}
              alt={tutorials[currentStep].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          </div>
          
          <div className="p-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              {tutorials[currentStep].title}
            </h3>
            <p className="text-gray-300 mb-6">
              {tutorials[currentStep].description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {tutorials.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex space-x-4">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center text-gray-400 hover:text-white"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Previous
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  {currentStep === tutorials.length - 1 ? 'Get Started' : 'Next'}
                  {currentStep < tutorials.length - 1 && (
                    <ChevronRight className="h-5 w-5 ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;