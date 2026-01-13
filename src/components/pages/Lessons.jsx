import { useState, useEffect, useMemo } from "react";
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

    // ✅ dictionaries теперь [{code, label}]
    const [levels, setLevels] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ageGroups, setAgeGroups] = useState([]);

    // ✅ фильтры теперь code
    const [filterLevel, setFilterLevel] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterAgeGroup, setFilterAgeGroup] = useState("");
    const [filterTitle, setFilterTitle] = useState("");

    /* =======================
       BUILD MAPS code -> label
    ======================== */
    const levelLabelMap = useMemo(() => {
        const map = {};
        for (const v of levels) map[v.code] = v.label;
        return map;
    }, [levels]);

    const statusLabelMap = useMemo(() => {
        const map = {};
        for (const v of statuses) map[v.code] = v.label;
        return map;
    }, [statuses]);

    const categoryLabelMap = useMemo(() => {
        const map = {};
        for (const v of categories) map[v.code] = v.label;
        return map;
    }, [categories]);

    const ageLabelMap = useMemo(() => {
        const map = {};
        for (const v of ageGroups) map[v.code] = v.label;
        return map;
    }, [ageGroups]);

    /* =======================
       LOAD FILTER DICTIONARIES
    ======================== */
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const data = await getFilterData();
                setLevels(data.levels ?? []);
                setStatuses(data.statuses ?? []);
                setCategories(data.categories ?? []);
                setAgeGroups(data.ageGroups ?? []);
                setError("");
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
                if (filterLevel) params.levels = filterLevel; // ✅ code
                if (filterStatus) params.statuses = filterStatus; // ✅ code
                if (filterCategory) params.categories = filterCategory; // ✅ code
                if (filterAgeGroup) params.ageGroups = filterAgeGroup; // ✅ code
                if (filterTitle) params.title = filterTitle;

                const res = await getLessons(params);
                setLessons(Array.isArray(res.data) ? res.data : []);
                setError("");
            } catch (e) {
                console.error("Ошибка при загрузке уроков", e);
                setError("Ошибка при загрузке уроков");
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [filterLevel, filterStatus, filterCategory, filterAgeGroup, filterTitle]);

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
                <FormControl sx={{ minWidth: 160 }} variant="outlined">
                    <InputLabel id="filter-level-label">Уровень</InputLabel>
                    <Select
                        labelId="filter-level-label"
                        label="Уровень"
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                    >
                        <MenuItem value="">Все</MenuItem>
                        {levels.map((v) => (
                            <MenuItem key={v.code} value={v.code}>
                                {v.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Status */}
                <FormControl sx={{ minWidth: 170 }} variant="outlined">
                    <InputLabel id="filter-status-label">Статус</InputLabel>
                    <Select
                        labelId="filter-status-label"
                        label="Статус"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <MenuItem value="">Все</MenuItem>
                        {statuses.map((v) => (
                            <MenuItem key={v.code} value={v.code}>
                                {v.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Category */}
                <FormControl sx={{ minWidth: 200 }} variant="outlined">
                    <InputLabel id="filter-category-label">Категория</InputLabel>
                    <Select
                        labelId="filter-category-label"
                        label="Категория"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <MenuItem value="">Все</MenuItem>
                        {categories.map((v) => (
                            <MenuItem key={v.code} value={v.code}>
                                {v.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Age Group */}
                <FormControl sx={{ minWidth: 140 }} variant="outlined">
                    <InputLabel id="filter-age-label">Возраст</InputLabel>
                    <Select
                        labelId="filter-age-label"
                        label="Возраст"
                        value={filterAgeGroup}
                        onChange={(e) => setFilterAgeGroup(e.target.value)}
                    >
                        <MenuItem value="">Все</MenuItem>
                        {ageGroups.map((v) => (
                            <MenuItem key={v.code} value={v.code}>
                                {v.label}
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
                        setFilterAgeGroup("");
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
                                onClick={() => navigate(`/lessons/${lesson.id}`)}
                            >
                                <TableCell>{lesson.id}</TableCell>

                                {/* ✅ показываем label по code */}
                                <TableCell>
                                    {levelLabelMap[lesson.level] ?? lesson.level}
                                </TableCell>
                                <TableCell>
                                    {statusLabelMap[lesson.status] ?? lesson.status}
                                </TableCell>
                                <TableCell>
                                    {categoryLabelMap[lesson.category] ?? lesson.category}
                                </TableCell>
                                <TableCell>
                                    {ageLabelMap[lesson.ageGroup] ?? lesson.ageGroup}
                                </TableCell>

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
