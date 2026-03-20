import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";

export default function App() {
    return (
        <Router>
            <nav className="p-4 bg-gray-100 flex gap-4">
                <Link to="/" className="font-bold">Dashboard</Link>
                <Link to="/jobs" className="font-bold">Jobs</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/jobs" element={<Jobs />} />
            </Routes>
        </Router>
    );
}
