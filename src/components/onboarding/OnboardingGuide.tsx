import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  action?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Nudgr!',
    description: 'Your friction analytics platform. Let\'s get you started in 3 quick steps.',
  },
  {
    id: 'api-keys',
    title: 'Generate Your API Key',
    description: 'Go to Settings and create an API key to start tracking friction on your website.',
    targetElement: '[href="/settings"]',
    action: 'Navigate to Settings',
  },
  {
    id: 'install-sdk',
    title: 'Install the Tracking SDK',
    description: 'Copy the SDK snippet from Settings and add it to your website\'s <head> tag.',
    targetElement: '.api-keys-section',
  },
  {
    id: 'explore',
    title: 'Explore the Dashboard',
    description: 'View friction events, session recordings, heatmaps, and generate reports. Try Demo Mode to see sample data!',
    targetElement: '[href="/"]',
    action: 'Go to Dashboard',
  },
];

export const OnboardingGuide = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCompletedSteps([...completedSteps, currentStepData.id]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsVisible(false);
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 shadow-2xl">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {ONBOARDING_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'h-2 flex-1 rounded-full transition-all',
                  index < currentStep
                    ? 'bg-primary'
                    : index === currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                )}
              />
            ))}
          </div>

          {/* Content */}
          <div className="space-y-4 py-4">
            <p className="text-lg">{currentStepData.description}</p>

            {completedSteps.includes(currentStepData.id) && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Step completed!</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStepData.action && (
              <Button
                variant="secondary"
                onClick={() => {
                  if (currentStepData.targetElement) {
                    const element = document.querySelector(currentStepData.targetElement);
                    if (element) {
                      (element as HTMLElement).click();
                    }
                  }
                  handleNext();
                }}
              >
                {currentStepData.action}
              </Button>
            )}

            <Button onClick={handleNext}>
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          {/* Skip Link */}
          <div className="text-center">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tutorial
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
