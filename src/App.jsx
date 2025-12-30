import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import Lessons from "./components/Lessons";
import Logout from "./components/Logout";
import Layout from "./components/Layout";
import LessonDetail from "./components/LessonDetail";

function AppWrapper() {
    return (
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
}

function App() {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/logout", { replace: true });
    };

    return (
        <Routes>
            {/* Login */}
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

            {/* Защищённые страницы */}
            <Route
                path="/"
                element={<Layout onLogout={handleLogout} />}
            >
                <Route
                    path="dashboard"
                    element={token ? <Dashboard /> : <Navigate to="/login" replace />}
                />

                <Route
                    path="lessons"
                    element={token ? <Lessons /> : <Navigate to="/login" replace />}
                />

                <Route
                    path="lessons/:id"
                    element={token ? <LessonDetail /> : <Navigate to="/login" replace />}
                />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />


            </Route>

            {/* Logout */}
            <Route
                path="/logout"
                element={<Logout onLogout={setToken} />}
            />
        </Routes>
    );
}

export default AppWrapper;
