import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Alert,
    InputAdornment,
    IconButton,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginForm({ onLogin }) {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const toggleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axios.post(
                "http://localhost:8081/auth/login",
                { username, password },
                { headers: { "Content-Type": "application/json" } }
            );

            const token = res.data.token;

            localStorage.setItem("token", token);
            if (onLogin) onLogin(token);

            navigate("/dashboard", { replace: true });

        } catch (err) {
            console.error(err);
            setError("Неверный логин или пароль");
        }
    };

    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#e0e0e0",
                p: 2,
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    width: { xs: "90%", sm: 400 },
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h5" align="center" gutterBottom>
                    Вход
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Username"
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Пароль"
                        margin="normal"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={toggleShowPassword} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Войти
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
