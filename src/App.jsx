import { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate,
} from "react-router-dom";

import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import Lessons from "./components/pages/Lessons";
import LessonDetail from "./components/pages/LessonDetail.jsx";
import LessonCreate from "./components/pages/LessonCreate"; // 👈 ДОБАВИЛИ
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
        navigate("/logout", { replace: true });
    };

    return (
        <Routes>
            {/* 🔐 Login */}
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

            {/* 🔒 Защищённые страницы */}
            <Route path="/" element={<Layout onLogout={handleLogout} />}>
                <Route
                    path="dashboard"
                    element={token ? <Dashboard /> : <Navigate to="/login" replace />}
                />

                {/* 📋 Список уроков */}
                <Route
                    path="lessons"
                    element={token ? <Lessons /> : <Navigate to="/login" replace />}
                />

                {/* ➕ СОЗДАНИЕ УРОКА (ВАЖНО: ВЫШЕ :id) */}
                <Route
                    path="lessons/create"
                    element={token ? <LessonCreate /> : <Navigate to="/login" replace />}
                />

                {/* ✏️ РЕДАКТИРОВАНИЕ УРОКА */}
                <Route
                    path="lessons/:id"
                    element={token ? <LessonDetail /> : <Navigate to="/login" replace />}
                />

                {/* fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* 🚪 Logout */}
            <Route
                path="/logout"
                element={<Logout onLogout={setToken} />}
            />
        </Routes>
    );
}

export default AppWrapper;
