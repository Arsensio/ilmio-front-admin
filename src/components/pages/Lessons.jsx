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

import RestartAltIcon from "@mui/icons-material/RestartAlt";

import {
    getLessons,
    getFilterData,
    updateLessonOrder,
} from "@/api/lessons";

export default function Lessons() {
    const navigate = useNavigate();

    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ===== INLINE EDIT STATE =====
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");

    // ===== DICTIONARIES =====
    const [levels, setLevels] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ageGroups, setAgeGroups] = useState([]);

    // ===== FILTERS =====
    const [filterLevel, setFilterLevel] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterAgeGroup, setFilterAgeGroup] = useState("");
    const [filterTitle, setFilterTitle] = useState("");

    /* =======================
       BUILD LABEL MAPS
    ======================= */
    const levelLabelMap = useMemo(() => {
        const map = {};
        levels.forEach((v) => (map[v.code] = v.label));
        return map;
    }, [levels]);

    const statusLabelMap = useMemo(() => {
        const map = {};
        statuses.forEach((v) => (map[v.code] = v.label));
        return map;
    }, [statuses]);

    const categoryLabelMap = useMemo(() => {
        const map = {};
        categories.forEach((v) => (map[v.code] = v.label));
        return map;
    }, [categories]);

    const ageLabelMap = useMemo(() => {
        const map = {};
        ageGroups.forEach((v) => (map[v.code] = v.label));
        return map;
    }, [ageGroups]);

    /* =======================
       LOAD FILTERS
    ======================= */
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const data = await getFilterData();
                setLevels(data.levels ?? []);
                setStatuses(data.statuses ?? []);
                setCategories(data.categories ?? []);
                setAgeGroups(data.ageGroups ?? []);
            } catch (e) {
                setError("Ошибка при загрузке фильтров");
            }
        };

        fetchFilters();
    }, []);

    /* =======================
       LOAD LESSONS
    ======================= */
    useEffect(() => {
        const fetchLessons = async () => {
            try {
                setLoading(true);

                const params = {};
                if (filterLevel) params.levels = filterLevel;
                if (filterStatus) params.statuses = filterStatus;
                if (filterCategory) params.categories = filterCategory;
                if (filterAgeGroup) params.ageGroups = filterAgeGroup;
                if (filterTitle) params.title = filterTitle;

                const res = await getLessons(params);
                setLessons(Array.isArray(res.data) ? res.data : []);
                setError("");
            } catch (e) {
                setError("Ошибка при загрузке уроков");
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [
        filterLevel,
        filterStatus,
        filterCategory,
        filterAgeGroup,
        filterTitle,
    ]);

    const handleResetFilters = () => {
        setFilterLevel("");
        setFilterStatus("");
        setFilterCategory("");
        setFilterAgeGroup("");
        setFilterTitle("");
    };

    /* =======================
       INLINE EDIT HANDLERS
    ======================= */
    const startEdit = (lesson) => {
        setEditingId(lesson.id);
        setEditingValue(String(lesson.orderIndex ?? ""));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingValue("");
    };

    const saveEdit = async (lesson) => {
        const newValue = Number(editingValue);

        if (Number.isNaN(newValue)) {
            cancelEdit();
            return;
        }

        // optimistic update
        setLessons((prev) =>
            prev.map((l) =>
                l.id === lesson.id
                    ? { ...l, orderIndex: newValue }
                    : l
            )
        );

        cancelEdit();

        try {
            await updateLessonOrder(lesson.id, newValue);
        } catch (e) {
            console.error(e);
            setError("Ошибка при сохранении порядка");
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={6}>
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
        <Box>
            {/* ===== HEADER ===== */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 2,
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
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack spacing={2}>
                    <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
                        <FormControl fullWidth>
                            <InputLabel>Уровень</InputLabel>
                            <Select
                                value={filterLevel}
                                onChange={(e) =>
                                    setFilterLevel(e.target.value)
                                }
                            >
                                <MenuItem value="">Все</MenuItem>
                                {levels.map((v) => (
                                    <MenuItem key={v.code} value={v.code}>
                                        {v.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Статус</InputLabel>
                            <Select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                            >
                                <MenuItem value="">Все</MenuItem>
                                {statuses.map((v) => (
                                    <MenuItem key={v.code} value={v.code}>
                                        {v.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Категория</InputLabel>
                            <Select
                                value={filterCategory}
                                onChange={(e) =>
                                    setFilterCategory(e.target.value)
                                }
                            >
                                <MenuItem value="">Все</MenuItem>
                                {categories.map((v) => (
                                    <MenuItem key={v.code} value={v.code}>
                                        {v.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Возраст</InputLabel>
                            <Select
                                value={filterAgeGroup}
                                onChange={(e) =>
                                    setFilterAgeGroup(e.target.value)
                                }
                            >
                                <MenuItem value="">Все</MenuItem>
                                {ageGroups.map((v) => (
                                    <MenuItem key={v.code} value={v.code}>
                                        {v.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="По названию"
                            value={filterTitle}
                            onChange={(e) =>
                                setFilterTitle(e.target.value)
                            }
                            fullWidth
                        />
                    </Stack>

                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            startIcon={<RestartAltIcon />}
                            onClick={handleResetFilters}
                        >
                            Сбросить
                        </Button>
                    </Box>
                </Stack>
            </Paper>

            {/* ===== TABLE ===== */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Уровень</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Категория</TableCell>
                            <TableCell>Возраст</TableCell>
                            <TableCell>Порядок</TableCell>
                            <TableCell>Название</TableCell>
                            <TableCell>Описание</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {lessons.map((lesson) => (
                            <TableRow
                                key={lesson.id}
                                hover
                                sx={{ cursor: "pointer" }}
                                onClick={() => {
                                    if (editingId !== null) return;
                                    navigate(`/lessons/${lesson.id}`);
                                }}
                            >
                                <TableCell>{lesson.id}</TableCell>

                                <TableCell>
                                    {levelLabelMap[lesson.level] ??
                                        lesson.level}
                                </TableCell>

                                <TableCell>
                                    {statusLabelMap[lesson.status] ??
                                        lesson.status}
                                </TableCell>

                                <TableCell>
                                    {categoryLabelMap[lesson.category] ??
                                        lesson.category}
                                </TableCell>

                                <TableCell>
                                    {ageLabelMap[lesson.ageGroup] ??
                                        lesson.ageGroup}
                                </TableCell>

                                {/* 🔥 INLINE EDIT ORDER */}
                                <TableCell
                                    onClick={(e) => e.stopPropagation()}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        startEdit(lesson);
                                    }}
                                >
                                    {editingId === lesson.id ? (
                                        <TextField
                                            size="small"
                                            type="number"
                                            autoFocus
                                            value={editingValue}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            onBlur={() => saveEdit(lesson)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") saveEdit(lesson);
                                                if (e.key === "Escape") cancelEdit();
                                            }}
                                            inputProps={{
                                                min: 0,
                                                style: {
                                                    textAlign: "center",
                                                    padding: "4px",
                                                    fontSize: "14px",
                                                    width: "60px", // 🔥 КЛЮЧЕВОЕ
                                                },
                                            }}
                                            sx={{
                                                width: 70,
                                                "& .MuiInputBase-input": {
                                                    padding: "4px",
                                                },
                                            }}
                                        />

                                    ) : (
                                        lesson.orderIndex
                                    )}
                                </TableCell>

                                <TableCell>{lesson.title}</TableCell>
                                <TableCell>{lesson.description}</TableCell>
                            </TableRow>
                        ))}

                        {lessons.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    Нет данных
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
