import Navbar from "./Navbar";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function Layout({ onLogout }) {
    return (
        <>
            {/* Navbar сверху */}
            <Navbar onLogout={onLogout} />

            {/* Полный белый фон под Navbar */}
            <Box
                sx={{
                    position: "fixed",       // фиксирует контейнер
                    top: "64px",             // оставляет место под AppBar
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "#fff", // белый фон
                    overflow: "auto",        // прокрутка если много контента
                    p: 3
                }}
            >
                <Outlet />
            </Box>
        </>
    );
}
