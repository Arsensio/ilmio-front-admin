import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

import { logout } from "../api/auth";

export default function Logout({ onLogout }) {
    const navigate = useNavigate();

    useEffect(() => {
        logout();

        // 🔹 обновляем состояние в App
        if (onLogout) {
            onLogout(null);
        }

        // 🔹 редирект на логин
        navigate("/login", { replace: true });
    }, [navigate, onLogout]);

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <CircularProgress />
        </Box>
    );
}
