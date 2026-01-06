import { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate,
} from "react-router-dom";

import LoginForm from "./components/LoginForm";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Lessons from "./components/pages/Lessons";
import LessonDetail from "./components/pages/LessonDetail";
import LessonCreate from "./components/pages/LessonCreate";
import Logout from "./components/Logout";
import Layout from "./components/Layout";

/* ================= WRAPPER ================= */

function AppWrapper() {
    return (
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
}

/* ================= APP ================= */

function App() {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login", { replace: true });
    };

    return (
        <Routes>
            {/* 👉 если просто / — сразу на login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ===== AUTH ===== */}
            <Route
                path="/login"
                element={
                    !token ? (
                        <LoginForm onLogin={setToken} />
                    ) : (
                        <Navigate to="/dashboard" replace />
                    )
                }
            />

            <Route
                path="/register"
                element={
                    !token ? (
                        <Register />
                    ) : (
                        <Navigate to="/dashboard" replace />
                    )
                }
            />

            <Route
                path="/logout"
                element={<Logout onLogout={handleLogout} />}
            />

            {/* ===== PROTECTED ===== */}
            <Route
                path="/"
                element={
                    token ? (
                        <Layout onLogout={handleLogout} />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            >
                <Route path="dashboard" element={<Dashboard />} />

                <Route path="lessons" element={<Lessons />} />
                <Route path="lessons/create" element={<LessonCreate />} />
                <Route path="lessons/:id" element={<LessonDetail />} />
            </Route>

            {/* ===== FALLBACK ===== */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default AppWrapper;
