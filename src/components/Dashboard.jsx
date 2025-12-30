import Navbar from "./Navbar";
import { Box } from "@mui/material";

export default function Dashboard({ onLogout }) {
    return (
        <>
            <Navbar onLogout={onLogout} />

            <Box sx={{ p: 3 }}>
                <h1>Добро пожаловать!</h1>
            </Box>
        </>
    );
}
