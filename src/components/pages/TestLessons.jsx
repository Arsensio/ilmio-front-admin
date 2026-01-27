import { useEffect, useMemo, useState } from "react";
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
    IconButton,
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Button,
} from "@mui/material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { getTestLessons } from "../../api/testLessons";

export default function TestLessons() {
    const navigate = useNavigate();

    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ===== FILTER STATE =====
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [level, setLevel] = useState("");
    const [ageGroup, setAgeGroup] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                setLoading(true);

                const params = {};
                if (search) params.title = search;
                if (category) params.categories = category;
                if (level) params.levels = level;
                if (ageGroup) params.ageGroups = ageGroup;
                if (status) params.statuses = status;

                const res = await getTestLessons(params);
                setLessons(Array.isArray(res.data) ? res.data : []);
                setError("");
            } catch (e) {
                console.error("Ошибка при загрузке тестовых уроков", e);
                setError("Ошибка при загрузке уроков с тестами");
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [
        search,
        category,
        level,
        ageGroup,
        status,
    ]);

    const handleCreateTest = (lessonId) => {
        navigate(`/tests/create/${lessonId}`);
    };

    const handleEditTest = (lessonId) => {
        navigate(`/tests/edit/${lessonId}`);
    };

    const handleResetFilters = () => {
        setSearch("");
        setCategory("");
        setLevel("");
        setAgeGroup("");
        setStatus("");
    };

    // ===== FILTER LOGIC =====
    const filteredLessons = useMemo(() => {
        return lessons.filter((lesson) => {
            const matchesSearch =
                lesson.title.toLowerCase().includes(search.toLowerCase());

            const matchesCategory =
                !category || lesson.category === category;

            const matchesLevel =
                !level || lesson.level === level;

            const matchesAgeGroup =
                !ageGroup || lesson.ageGroup === ageGroup;

            const matchesStatus =
                !status || lesson.status === status;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesLevel &&
                matchesAgeGroup &&
                matchesStatus
            );
        });
    }, [lessons, search, category, level, ageGroup, status]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box mt={4}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" mb={3}>
                Уроки и тесты
            </Typography>

            {/* ===== FILTERS ===== */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack spacing={2}>
                    <Stack
                        spacing={2}
                        direction={{ xs: "column", md: "row" }}
                        alignItems="center"
                    >
                        <TextField
                            label="Поиск по названию"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>Категория</InputLabel>
                            <Select
                                value={category}
                                label="Категория"
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <MenuItem value="">Все</MenuItem>
                                <MenuItem value="SOFT_SKILL">SOFT_SKILL</MenuItem>
                                <MenuItem value="HARD_SKILL">HARD_SKILL</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Уровень</InputLabel>
                            <Select
                                value={level}
                                label="Уровень"
                                onChange={(e) => setLevel(e.target.value)}
                            >
                                <MenuItem value="">Все</MenuItem>
                                <MenuItem value="BEGINNER">BEGINNER</MenuItem>
                                <MenuItem value="INTERMEDIATE">INTERMEDIATE</MenuItem>
                                <MenuItem value="ADVANCED">ADVANCED</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Возраст</InputLabel>
                            <Select
                                value={ageGroup}
                                label="Возраст"
                                onChange={(e) => setAgeGroup(e.target.value)}
                            >
                                <MenuItem value="">Все</MenuItem>
                                <MenuItem value="AGE_3_4">AGE_3_4</MenuItem>
                                <MenuItem value="AGE_5_6">AGE_5_6</MenuItem>
                                <MenuItem value="AGE_7_8">AGE_7_8</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Статус</InputLabel>
                            <Select
                                value={status}
                                label="Статус"
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <MenuItem value="">Все</MenuItem>
                                <MenuItem value="PUBLISHED">PUBLISHED</MenuItem>
                                <MenuItem value="DRAFT">DRAFT</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    {/* 🔄 RESET BUTTON */}
                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            startIcon={<RestartAltIcon />}
                            onClick={handleResetFilters}
                        >
                            Сбросить фильтры
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
                            <TableCell>Название</TableCell>
                            <TableCell>Категория</TableCell>
                            <TableCell>Возраст</TableCell>
                            <TableCell>Уровень</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell align="center">Тест</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredLessons.map((lesson) => (
                            <TableRow key={lesson.lessonId}>
                                <TableCell>{lesson.lessonId}</TableCell>
                                <TableCell>{lesson.title}</TableCell>
                                <TableCell>
                                    <Chip label={lesson.category} size="small" />
                                </TableCell>
                                <TableCell>{lesson.ageGroup}</TableCell>
                                <TableCell>{lesson.level}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={lesson.status}
                                        color={
                                            lesson.status === "PUBLISHED"
                                                ? "success"
                                                : "default"
                                        }
                                        size="small"
                                    />
                                </TableCell>

                                <TableCell align="center">
                                    {lesson.testExists ? (
                                        <IconButton
                                            color="primary"
                                            onClick={() =>
                                                handleEditTest(lesson.lessonId)
                                            }
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    ) : (
                                        <IconButton
                                            color="success"
                                            onClick={() =>
                                                handleCreateTest(lesson.lessonId)
                                            }
                                        >
                                            <AddCircleOutlineIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}

                        {filteredLessons.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
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
