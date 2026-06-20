import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Step } from 'react-joyride';

interface TutorialContextType {
  run: boolean;
  steps: Step[];
  stepIndex: number;
  startTutorial: (initialSteps: Step[]) => void;
  stopTutorial: () => void;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  const startTutorial = useCallback((initialSteps: Step[]) => {
    setSteps(initialSteps);
    setStepIndex(0);
    setRun(true);
  }, []);

  const stopTutorial = useCallback(() => {
    setRun(false);
    setStepIndex(0);
    setSteps([]);
  }, []);

  const goToStep = useCallback((index: number) => {
    setStepIndex(index);
  }, []);

  const nextStep = useCallback(() => {
    setStepIndex(prev => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setStepIndex(prev => prev - 1);
  }, []);

  const value = {
    run,
    steps,
    stepIndex,
    startTutorial,
    stopTutorial,
    goToStep,
    nextStep,
    prevStep,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};