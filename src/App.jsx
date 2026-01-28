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
import LessonDetail from "./pages/LessonDetail";
import LessonEdit from "./pages/LessonEdit";
import LessonCreate from "./pages/LessonCreate.jsx";
import Logout from "./components/Logout";
import Layout from "./components/Layout";

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
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login", { replace: true });
    };

    return (
        <Routes>
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
                element={!token ? <Register /> : <Navigate to="/dashboard" />}
            />

            <Route path="/logout" element={<Logout onLogout={handleLogout} />} />

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

                {/* 👇 ПРОСМОТР */}
                <Route path="lessons/:id" element={<LessonDetail />} />

                {/* 👇 РЕДАКТОР */}
                <Route path="lessons/:id/edit" element={<LessonEdit />} />

            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default AppWrapper;
