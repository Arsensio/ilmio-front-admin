import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Paper,
    TextField,
    Typography,
    Button,
    Alert,
    InputAdornment,
    IconButton,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { register, verifyOtp } from "@/api/auth";

export default function Register() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1 = register, 2 = verify
    const [uuid, setUuid] = useState(null);

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        otp: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [error, setError] = useState("");

    /* ================= TIMER ================= */

    useEffect(() => {
        if (step !== 2 || secondsLeft <= 0) return;

        const timer = setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [step, secondsLeft]);

    /* ================= STEP 1: REGISTER ================= */

    const handleRegister = async () => {
        try {
            const res = await register({
                username: form.username,
                email: form.email,
                password: form.password,
            });

            setUuid(res.data.uuid);
            setSecondsLeft(res.data.secondsLeft);
            setStep(2);
            setError("");
        } catch {
            setError("Ошибка регистрации");
        }
    };

    /* ================= STEP 2: VERIFY ================= */

    const handleVerify = async () => {
        if (secondsLeft <= 0) {
            setError("Срок действия кода истёк");
            return;
        }

        try {
            const res = await verifyOtp({
                uuid,
                otp: form.otp,
            });

            localStorage.setItem("token", res.data.token);
            navigate("/dashboard", { replace: true });
        } catch {
            setError("Неверный код подтверждения");
        }
    };

    /* ================= UI ================= */

    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#e0e0e0",
                p: 2,
            }}
        >
            <Paper sx={{ p: 4, width: 400 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    {step === 1 ? "Регистрация" : "Подтверждение"}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* ===== STEP 1 ===== */}
                {step === 1 && (
                    <>
                        <TextField
                            fullWidth
                            label="Username"
                            margin="normal"
                            value={form.username}
                            onChange={(e) =>
                                setForm({ ...form, username: e.target.value })
                            }
                        />

                        <TextField
                            fullWidth
                            label="Email"
                            margin="normal"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                        />

                        <TextField
                            fullWidth
                            label="Пароль"
                            margin="normal"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            edge="end"
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                        >
                                            {showPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={handleRegister}
                        >
                            Зарегистрироваться
                        </Button>
                    </>
                )}

                {/* ===== STEP 2 ===== */}
                {step === 2 && (
                    <>
                        <Typography sx={{ mt: 2 }}>
                            Код отправлен на почту
                        </Typography>

                        <Typography
                            sx={{
                                mt: 1,
                                color:
                                    secondsLeft > 0
                                        ? "text.secondary"
                                        : "error.main",
                            }}
                        >
                            Осталось времени: {secondsLeft} сек
                        </Typography>

                        <TextField
                            fullWidth
                            label="OTP код"
                            margin="normal"
                            value={form.otp}
                            onChange={(e) =>
                                setForm({ ...form, otp: e.target.value })
                            }
                            disabled={secondsLeft <= 0}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={handleVerify}
                            disabled={secondsLeft <= 0}
                        >
                            Подтвердить
                        </Button>
                    </>
                )}

                <Button
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate("/login")}
                >
                    Уже есть аккаунт? Войти
                </Button>
            </Paper>
        </Box>
    );
}
