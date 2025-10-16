import { X, Users, Calendar, ClipboardList, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

export function WelcomeGuide({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Sparkles className="w-12 h-12 text-green-600" />,
      title: 'Welcome to রুপান্তর Admin Dashboard!',
      description: 'Thank you for joining our climate action movement. Let\'s get you started with managing your organization.',
      action: 'Get Started'
    },
    {
      icon: <Calendar className="w-12 h-12 text-blue-600" />,
      title: 'Event Management',
      description: 'Create and manage climate action events including workshops, campaigns, and awareness drives. Add detailed information, speakers, and track registrations.',
      action: 'Next'
    },
    {
      icon: <Users className="w-12 h-12 text-purple-600" />,
      title: 'Volunteer Management',
      description: 'View all registered volunteers, their profiles, and contributions. Assign them to different teams and track their activities.',
      action: 'Next'
    },
    {
      icon: <ClipboardList className="w-12 h-12 text-orange-600" />,
      title: 'Task Instructions',
      description: 'Create and assign tasks to volunteers with different priority levels. Track progress as volunteers update their task status.',
      action: 'Next'
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-green-600" />,
      title: 'Internal Chat',
      description: 'Communicate with your team through one-to-one messages or create group chats for different projects and committees.',
      action: 'Finish'
    }
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step === steps.length - 1) {
      onClose();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {currentStep.icon}
          </div>
          <h2 className="text-2xl mb-3">{currentStep.title}</h2>
          <p className="text-gray-600">{currentStep.description}</p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-12 rounded-full transition-colors ${
                index === step ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1"
          >
            {currentStep.action}
          </Button>
        </div>
      </div>
    </div>
  );
}
