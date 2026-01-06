import { useState, useEffect } from "react";
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

import { getLessons, getFilterData } from "@/api/lessons";

export default function Lessons() {
    const navigate = useNavigate();

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

    /* =======================
       LOAD FILTER DICTIONARIES
    ======================== */
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const data = await getFilterData();
                setLevels(data.levels);
                setStatuses(data.statuses);
                setCategories(data.categories);
            } catch (e) {
                console.error("Ошибка при загрузке словарей", e);
                setError("Ошибка при загрузке фильтров");
            }
        };

        fetchFilters();
    }, []);

    /* =======================
       LOAD LESSONS
    ======================== */
    useEffect(() => {
        const fetchLessons = async () => {
            try {
                setLoading(true);

                const params = {};
                if (filterLevel) params.levels = filterLevel;
                if (filterStatus) params.statuses = filterStatus;
                if (filterCategory) params.categories = filterCategory;
                if (filterTitle) params.title = filterTitle;

                const res = await getLessons(params);
                setLessons(res.data);
                setError("");
            } catch (e) {
                console.error("Ошибка при загрузке уроков", e);
                setError("Ошибка при загрузке уроков");
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [filterLevel, filterStatus, filterCategory, filterTitle]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 3 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* ===== HEADER ===== */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h4">Список уроков</Typography>

                <Button
                    variant="contained"
                    onClick={() => navigate("/lessons/create")}
                >
                    ➕ Добавить урок
                </Button>
            </Box>

            {/* ===== FILTERS ===== */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                {/* Level */}
                <FormControl sx={{ minWidth: 140 }} variant="outlined">
                    <InputLabel id="filter-level-label">Level</InputLabel>
                    <Select
                        labelId="filter-level-label"
                        label="Level"
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                    >
                        <MenuItem value="">Все</MenuItem>
                        {levels.map((v) => (
                            <MenuItem key={v} value={v}>
                                {v}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Status */}
                <FormControl sx={{ minWidth: 160 }} variant="outlined">
                    <InputLabel id="filter-status-label">Status</InputLabel>
                    <Select
                        labelId="filter-status-label"
                        label="Status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <MenuItem value="">Все</MenuItem>
                        {statuses.map((v) => (
                            <MenuItem key={v} value={v}>
                                {v}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Category */}
                <FormControl sx={{ minWidth: 160 }} variant="outlined">
                    <InputLabel id="filter-category-label">Category</InputLabel>
                    <Select
                        labelId="filter-category-label"
                        label="Category"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <MenuItem value="">Все</MenuItem>
                        {categories.map((v) => (
                            <MenuItem key={v} value={v}>
                                {v}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Title */}
                <TextField
                    label="По названию"
                    variant="outlined"
                    value={filterTitle}
                    onChange={(e) => setFilterTitle(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />

                {/* Reset */}
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

            {/* ===== TABLE ===== */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Order</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Description</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {lessons.map((lesson) => (
                            <TableRow
                                key={lesson.id}
                                hover
                                sx={{ cursor: "pointer" }}
                                onClick={() =>
                                    navigate(`/lessons/${lesson.id}`)
                                }
                            >
                                <TableCell>{lesson.id}</TableCell>
                                <TableCell>{lesson.level}</TableCell>
                                <TableCell>{lesson.status}</TableCell>
                                <TableCell>{lesson.category}</TableCell>
                                <TableCell>{lesson.ageGroup}</TableCell>
                                <TableCell>{lesson.orderIndex}</TableCell>
                                <TableCell>{lesson.title}</TableCell>
                                <TableCell>{lesson.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
