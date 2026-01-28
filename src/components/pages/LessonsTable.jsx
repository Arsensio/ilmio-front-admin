import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Pagination,
    TableSortLabel,
} from "@mui/material";

import {
    getLessons,
    updateLessonOrder,
} from "@/api/lessons";

export default function LessonsTable({
                                         filters,
                                         sort,
                                         onSortChange,
                                         page,
                                         onPageChange,
                                     }) {
    const navigate = useNavigate();

    /* ===== DATA ===== */
    const [lessons, setLessons] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ===== INLINE EDIT ===== */
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");

    /* ================= LOAD LESSONS ================= */
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const params = {
                    page,
                    size: 10,
                };

                if (sort?.field && sort?.direction) {
                    params.sort = `${sort.field},${sort.direction}`;
                }

                if (filters.level) params.levels = filters.level;
                if (filters.status) params.statuses = filters.status;
                if (filters.category) params.categories = filters.category;
                if (filters.ageGroup) params.ageGroups = filters.ageGroup;
                if (filters.title) params.title = filters.title;

                const res = await getLessons(params);

                setLessons(res.data.content ?? []);
                setTotalPages(res.data.totalPages ?? 0);
                setError("");
            } catch (e) {
                setError("Ошибка загрузки уроков");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [filters, sort, page]);

    /* ================= SORT ================= */
    const toggleSort = (field) => {
        if (sort.field !== field) {
            onSortChange({ field, direction: "asc" });
            onPageChange(0);
            return;
        }

        if (sort.direction === "asc") {
            onSortChange({ field, direction: "desc" });
            onPageChange(0);
            return;
        }

        onSortChange({ field: null, direction: null });
        onPageChange(0);
    };

    /* ================= INLINE EDIT ================= */
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
        if (Number.isNaN(newValue)) return cancelEdit();

        setLessons((prev) =>
            prev.map((l) =>
                l.id === lesson.id ? { ...l, orderIndex: newValue } : l
            )
        );

        cancelEdit();

        try {
            await updateLessonOrder(lesson.id, newValue);
        } catch {
            setError("Ошибка сохранения порядка");
        }
    };

    /* ================= UI ================= */
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {[
                                ["id", "ID"],
                                ["level", "Уровень"],
                                ["status", "Статус"],
                                ["category", "Категория"],
                                ["ageGroup", "Возраст"],
                                ["orderIndex", "Порядок"],
                                ["title", "Название"],
                            ].map(([field, label]) => (
                                <TableCell key={field}>
                                    <TableSortLabel
                                        active={sort.field === field}
                                        direction={
                                            sort.field === field
                                                ? sort.direction
                                                : "asc"
                                        }
                                        onClick={() => toggleSort(field)}
                                    >
                                        {label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell>Описание</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {lessons.map((lesson) => (
                            <TableRow
                                key={lesson.id}
                                hover
                                sx={{ cursor: "pointer" }}
                                onClick={() =>
                                    editingId === null &&
                                    navigate(`/lessons/${lesson.id}`)
                                }
                            >
                                <TableCell>{lesson.id}</TableCell>
                                <TableCell>{lesson.level}</TableCell>
                                <TableCell>{lesson.status}</TableCell>
                                <TableCell>{lesson.category}</TableCell>
                                <TableCell>{lesson.ageGroup}</TableCell>

                                {/* ORDER INDEX */}
                                <TableCell
                                    onClick={(e) => e.stopPropagation()}
                                    onDoubleClick={() => startEdit(lesson)}
                                >
                                    {editingId === lesson.id ? (
                                        <TextField
                                            size="small"
                                            type="number"
                                            autoFocus
                                            value={editingValue}
                                            onChange={(e) =>
                                                setEditingValue(e.target.value)
                                            }
                                            onBlur={() => saveEdit(lesson)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter")
                                                    saveEdit(lesson);
                                                if (e.key === "Escape")
                                                    cancelEdit();
                                            }}
                                            sx={{ width: 70 }}
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

            {/* PAGINATION */}
            {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                        count={totalPages}
                        page={page + 1}
                        onChange={(_, value) => onPageChange(value - 1)}
                        color="primary"
                    />
                </Box>
            )}
        </>
    );
}
