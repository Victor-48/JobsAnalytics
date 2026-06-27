import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import AddJob from "./pages/AddJob";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EscoExplorer from "./pages/EscoExplorer";
import { ThemeToggle } from "./components/ThemeToggle";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TutorialProvider } from "./contexts/TutorialContext";
import {Joyride, EventData } from 'react-joyride';
import { useTutorial } from './contexts/TutorialContext';
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";


function AppContent() {
    const { run, steps, stepIndex, stopTutorial, nextStep, prevStep } = useTutorial();

    return (
        <TooltipProvider>
            <Navigation />
            <div className="min-h-[calc(100vh-73px)] bg-background transition-colors duration-300">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:id" element={<JobDetails />} />
                    <Route path="/add-job" element={<AddJob />} />
                    <Route path="/edit-job/:id" element={<AddJob />} />
                    <Route path="/esco-explorer" element={<EscoExplorer />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </div>
            <Joyride
                run={run}
                steps={steps}
                stepIndex={stepIndex}
                continuous={true}
                scrollOffset={100}

                onEvent={(data: EventData) => {
                    const { action, status, type, step } = data;

                    if (type === 'step:before') {
                        const targetEl = document.querySelector(step.target as string) as HTMLElement;
                        const scrollContainer = document.querySelector('main');

                        if (targetEl && scrollContainer) {
                            const containerRect = scrollContainer.getBoundingClientRect();
                            const targetRect = targetEl.getBoundingClientRect();

                            const offset = 50;
                            const targetScrollTop = scrollContainer.scrollTop + (targetRect.top - containerRect.top) - offset;

                            scrollContainer.scrollTo({
                                top: targetScrollTop,
                                behavior: 'smooth'
                            });
                        } else if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }

                    if (['finished', 'skipped'].includes(status as string) || action === 'close') {
                        stopTutorial();
                    } else if (['next', 'prev'].includes(action)) {
                        if (type === 'step:after') {
                            action === 'next' ? nextStep() : prevStep();
                        }
                    }
                }}

                options={{
                    arrowColor: 'hsl(var(--card))',
                    backgroundColor: 'hsl(var(--card))',
                    primaryColor: 'hsl(var(--primary))',
                    textColor: 'hsl(var(--foreground))',
                    zIndex: 1000,
                    showProgress: true,
                    buttons: ['back', 'close', 'primary', 'skip'],

                    skipScroll: true,
                    overlayClickAction: false
                }}
            />
        </TooltipProvider>
    );
}
function Navigation() {
    const location = useLocation();
    const { role, logout } = useAuth();

    if (location.pathname === '/login' || location.pathname === '/register') {
        return (
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
        );
    }

    return (
        <nav className="p-4 bg-card border-b border-border flex justify-between items-center transition-colors z-50 relative">
            <div className="flex gap-6 items-center">
                <Link id="dashboard-page-link" to="/" className="font-bold text-foreground hover:text-primary transition-colors">Dashboard</Link>
                <Link id="esco-page-link" to="/esco-explorer" className="font-bold text-foreground hover:text-primary transition-colors">ESCO Explorer</Link>
                {role !== 'GUEST' && (
                    <>
                        <Link id="jobs-page-link" to="/jobs" className="font-bold text-foreground hover:text-primary transition-colors">Jobs</Link>
                        <Link to="/add-job" className="font-bold text-primary hover:opacity-80 transition-opacity">Add New Job</Link>
                    </>
                )}
            </div>
            <div className="flex items-center gap-4">
                {role === 'GUEST' ? (
                    <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
                ) : (
                     <button onClick={logout} className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors">Sign Out</button>
                )}
                <ThemeToggle />
            </div>
        </nav>
    );
}

export default function App() {
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") {
            document.documentElement.classList.add("dark");
        }
    }, []);

    return (
        <AuthProvider>
            <TutorialProvider>
                <AnalyticsProvider>
                <Router>
                    <AppContent />
                </Router>
                    <Toaster richColors position="top-center" />
            </AnalyticsProvider>
            </TutorialProvider>
        </AuthProvider>
    );
}