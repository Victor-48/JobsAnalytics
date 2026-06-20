import React, { useState, useLayoutEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface TutorialStep {
    elementId: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialProps {
    steps: TutorialStep[];
    onClose: () => void;
}

export const Tutorial = ({ steps, onClose }: TutorialProps) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [elementRect, setElementRect] = useState<DOMRect | null>(null);

    const currentStep = steps[currentStepIndex];

    const updatePosition = useCallback(() => {
        const element = document.getElementById(currentStep.elementId);
        if (element) {
            setElementRect(element.getBoundingClientRect());
        }
    }, [currentStep.elementId]);

    useLayoutEffect(() => {
        const element = document.getElementById(currentStep.elementId);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            
            // Initial position after a short delay to allow smooth scrolling to start
            setTimeout(updatePosition, 100);
        }

        window.addEventListener('scroll', updatePosition, true); // Use capture phase for all scroll events
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [currentStep.elementId, updatePosition]);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const getHighlightStyle = (): React.CSSProperties => {
        if (!elementRect) return { display: 'none' };
        return {
            position: 'fixed',
            left: `${elementRect.left - 4}px`,
            top: `${elementRect.top - 4}px`,
            width: `${elementRect.width + 8}px`,
            height: `${elementRect.height + 8}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            borderRadius: '8px',
            transition: 'all 0.1s ease-out',
            pointerEvents: 'none', // Allows scrolling "through" the overlay
        };
    };

    const getPopupStyle = (): React.CSSProperties => {
        if (!elementRect) return { display: 'none' };
        const position = currentStep.position || 'bottom';
        
        const baseStyle: React.CSSProperties = {
            position: 'fixed',
            zIndex: 101,
            pointerEvents: 'auto', // Make the popup itself clickable
            transition: 'all 0.1s ease-out', // Match highlight transition
        };

        switch (position) {
            case 'top':
                return { ...baseStyle, bottom: `${window.innerHeight - elementRect.top + 10}px`, left: `${elementRect.left}px` };
            case 'left':
                return { ...baseStyle, top: `${elementRect.top}px`, right: `${window.innerWidth - elementRect.left + 10}px` };
            case 'right':
                return { ...baseStyle, top: `${elementRect.top}px`, left: `${elementRect.right + 10}px` };
            default: // bottom
                return { ...baseStyle, top: `${elementRect.bottom + 10}px`, left: `${elementRect.left}px` };
        }
    };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            <div style={getHighlightStyle()} />
            
            <div 
                className="bg-card p-4 rounded-lg shadow-2xl w-80"
                style={getPopupStyle()}
            >
                <h3 className="font-bold text-lg mb-2">{currentStep.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{currentStep.content}</p>
                
                <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                        Step {currentStepIndex + 1} of {steps.length}
                    </span>
                    <div className="flex gap-2">
                        {currentStepIndex > 0 && (
                            <Button variant="outline" size="sm" onClick={handlePrev}>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                        )}
                        <Button size="sm" onClick={handleNext}>
                            {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};