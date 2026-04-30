import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import AddJob from "./pages/AddJob";
import { ThemeToggle } from "./components/ThemeToggle";

export default function App() {
    // Apply theme on initial load to prevent flash
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") {
            document.documentElement.classList.add("dark");
        }
    }, []);

    return (
        <Router>
            <nav className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center transition-colors z-50 relative">
                <div className="flex gap-6 items-center">
                    <Link to="/" className="font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
                    <Link to="/jobs" className="font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Jobs</Link>
                    <Link to="/add-job" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Add New Job</Link>
                </div>
                <div>
                    <ThemeToggle />
                </div>
            </nav>

            <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/add-job" element={<AddJob />} />
                    <Route path="/edit-job/:id" element={<AddJob />} />
                </Routes>
            </main>
        </Router>
    );
}