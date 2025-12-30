import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Stack,
    Button,
} from "@mui/material";

export default function Lessons() {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [levels, setLevels] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);

    const [filterLevel, setFilterLevel] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterTitle, setFilterTitle] = useState("");

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    // Загрузить возможные значения фильтров
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [levelsRes, statusesRes, categoriesRes] = await Promise.all([
                    axios.get("http://localhost:8081/admin/lesson/levels", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:8081/admin/lesson/statuses", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:8081/admin/lesson/categories", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setLevels(levelsRes.data);
                setStatuses(statusesRes.data);
                setCategories(categoriesRes.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchFilters();
    }, [token]);

    // Загрузка уроков по фильтрам
    useEffect(() => {
        const fetchLessons = async () => {
            try {
                setLoading(true);

                // Собираем query параметры
                const params = new URLSearchParams();

                if (filterLevel) params.append("levels", filterLevel);
                if (filterStatus) params.append("statuses", filterStatus);
                if (filterCategory) params.append("categories", filterCategory);
                if (filterTitle) params.append("title", filterTitle);

                const res = await axios.get(
                    `http://localhost:8081/admin/lesson?${params.toString()}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setLessons(res.data);
                setError("");
            } catch (err) {
                console.error(err);
                setError("Ошибка при загрузке уроков");
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [filterLevel, filterStatus, filterCategory, filterTitle, token]);

    if (loading) {
        return (
            <Box sx={{ textAlign: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 4 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Список уроков
            </Typography>

            {/* 🔎 Фильтры */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel>Level</InputLabel>
                    <Select
                        value={filterLevel}
                        label="Level"
                        onChange={(e) => setFilterLevel(e.target.value)}
                    >
                        <MenuItem value="">Все</MenuItem>
                        {levels.map((lvl) => (
                            <MenuItem key={lvl} value={lvl}>
                                {lvl}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filterStatus}
                        label="Status"
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <MenuItem value="">Все</MenuItem>
                        {statuses.map((st) => (
                            <MenuItem key={st} value={st}>
                                {st}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={filterCategory}
                        label="Category"
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <MenuItem value="">Все</MenuItem>
                        {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                                {cat}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="По названию"
                    value={filterTitle}
                    onChange={(e) => setFilterTitle(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />

                {/* Кнопка сброса */}
                <Button
                    variant="outlined"
                    onClick={() => {
                        setFilterLevel("");
                        setFilterStatus("");
                        setFilterCategory("");
                        setFilterTitle("");
                    }}
                >
                    Сбросить
                </Button>
            </Stack>

            {/* 📊 Таблица */}
            {lessons.length === 0 ? (
                <Typography>Нет уроков</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Level</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Age Group</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Title (RU)</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>
                                    Description (RU)
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {lessons.map((lesson) => {
                                const ru = lesson.translations.find(
                                    (t) => t.language === "RU"
                                );

                                return (
                                    <TableRow
                                        key={lesson.id}
                                        hover
                                        sx={{ cursor: "pointer" }}
                                        onClick={() => navigate(`/lessons/${lesson.id}`)}
                                    >
                                        <TableCell>{lesson.id}</TableCell>
                                        <TableCell>{lesson.level}</TableCell>
                                        <TableCell>{lesson.status}</TableCell>
                                        <TableCell>{lesson.category}</TableCell>
                                        <TableCell>{lesson.ageGroup}</TableCell>
                                        <TableCell>{ru?.title ?? "—"}</TableCell>
                                        <TableCell>{ru?.description ?? "—"}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
