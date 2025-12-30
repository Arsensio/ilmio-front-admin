import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout({ onLogout }) {
    const navigate = useNavigate();

    useEffect(() => {
        // 1) удалить токен
        localStorage.removeItem("token");

        // 2) обновить state в App
        if (onLogout) {
            onLogout(null);
        }

        // 3) перейти на login
        navigate("/login", { replace: true });
    }, [navigate, onLogout]);

    return null; // ничего не рендерим
}
