import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import AddJob from "./pages/AddJob";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ThemeToggle } from "./components/ThemeToggle";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function Navigation() {
    const location = useLocation();
    const { role, logout } = useAuth();
    
    // Don't show nav on auth pages
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
                <Link to="/" className="font-bold text-foreground hover:text-primary transition-colors">Dashboard</Link>
                {role !== 'GUEST' && (
                    <>
                        <Link to="/jobs" className="font-bold text-foreground hover:text-primary transition-colors">Jobs</Link>
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
    // Apply theme on initial load to prevent flash
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") {
            document.documentElement.classList.add("dark");
        }
    }, []);

    return (
        <AuthProvider>
            <Router>
                <Navigation />
                <div className="min-h-[calc(100vh-73px)] bg-background transition-colors duration-300">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/jobs" element={<Jobs />} />
                        <Route path="/add-job" element={<AddJob />} />
                        <Route path="/edit-job/:id" element={<AddJob />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}