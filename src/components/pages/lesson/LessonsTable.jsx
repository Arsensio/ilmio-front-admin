import { useEffect, useState } from "react";
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
    Pagination,
    TableSortLabel,
} from "@mui/material";

import { getLessons } from "@/api/lessons.js";

export default function LessonsTable({
                                         filters,
                                         sort,
                                         onSortChange,
                                         page,
                                         onPageChange,
                                     }) {
    const navigate = useNavigate();

    const [lessons, setLessons] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ================= LOAD ================= */
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const params = {
                    page,
                    size: 10,
                };

                // 🔁 SORT
                if (sort?.field && sort?.direction) {
                    params.sort = `${sort.field},${sort.direction}`;
                }

                // 🔥 FILTERS
                if (filters.status) params.statuses = filters.status;
                if (filters.category) params.categories = filters.category;
                if (filters.lang) params.langs = filters.lang; // ✅ ВОТ ЭТОГО НЕ ХВАТАЛО
                if (filters.title) params.title = filters.title;

                const res = await getLessons(params);

                setLessons(res.data.content ?? []);
                setTotalPages(res.data.totalPages ?? 0);
                setError("");
            } catch (e) {
                console.error(e);
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
                                ["status", "Статус"],
                                ["category", "Категория"],
                                ["lang", "Язык"],          // ✅ колонка язык
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
                                    navigate(`/lessons/${lesson.id}`)
                                }
                            >
                                <TableCell>{lesson.id}</TableCell>
                                <TableCell>{lesson.status}</TableCell>
                                <TableCell>{lesson.category}</TableCell>
                                <TableCell>{lesson.lang}</TableCell> {/* ✅ */}
                                <TableCell>{lesson.title}</TableCell>
                                <TableCell>{lesson.description}</TableCell>
                            </TableRow>
                        ))}

                        {lessons.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
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
