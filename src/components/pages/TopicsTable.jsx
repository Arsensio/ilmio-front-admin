import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Box,
    TableSortLabel,
    TextField,
} from "@mui/material";

import { filterTopics, updateTopicOrder } from "@/api/topics";
// PUT /admin/lesson-theme/{id}/index

export default function TopicsTable({ filters, page }) {
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ===== SORT ===== */
    const [sort, setSort] = useState({
        field: null,
        direction: null,
    });

    /* ===== INLINE EDIT ===== */
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");

    /* ================= LOAD ================= */
    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const params = {
                    ...(filters.statuses.length && { statuses: filters.statuses }),
                    ...(filters.levels.length && { levels: filters.levels }),
                    ...(filters.ageGroups.length && { ageGroups: filters.ageGroups }),
                    ...(filters.langs.length && { langs: filters.langs }),
                    ...(filters.title && { title: filters.title }),
                    page,
                };

                if (sort.field && sort.direction) {
                    params.sort = `${sort.field},${sort.direction}`;
                }

                const res = await filterTopics(params);
                setData(res.data.content ?? []);
            } catch (e) {
                console.error("Ошибка загрузки тем", e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [filters, page, sort]);

    /* ================= SORT ================= */
    const toggleSort = (field) => {
        if (sort.field !== field) {
            setSort({ field, direction: "asc" });
            return;
        }

        if (sort.direction === "asc") {
            setSort({ field, direction: "desc" });
            return;
        }

        setSort({ field: null, direction: null });
    };

    /* ================= INLINE EDIT ================= */
    const startEdit = (row) => {
        setEditingId(row.id);
        setEditingValue(String(row.orderIndex ?? ""));
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingValue("");
    };

    const saveEdit = async (row) => {
        const newValue = Number(editingValue);
        if (Number.isNaN(newValue)) {
            cancelEdit();
            return;
        }

        // optimistic UI
        setData((prev) =>
            prev.map((r) =>
                r.id === row.id ? { ...r, orderIndex: newValue } : r
            )
        );

        cancelEdit();

        try {
            await updateTopicOrder(row.id, newValue);
        } catch (e) {
            console.error("Ошибка сохранения порядка", e);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        {[
                            ["id", "ID"],
                            ["title", "Название"],
                            ["description", "Описание"],
                            ["status", "Статус"],
                            ["lang", "Язык"],
                            ["orderIndex", "Порядок"],
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
                    </TableRow>
                </TableHead>

                <TableBody>
                    {data.map((row) => (
                        <TableRow
                            key={row.id}
                            hover
                            sx={{ cursor: "pointer" }}
                            onClick={() =>
                                editingId === null &&
                                navigate(`/topics/${row.id}`)
                            }
                        >
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.title}</TableCell>
                            <TableCell>{row.description}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell>{row.lang}</TableCell>

                            {/* 🔥 ORDER INDEX — ONLY EDITABLE */}
                            <TableCell
                                onClick={(e) => e.stopPropagation()} // ⛔️ не переходим
                                onDoubleClick={(e) => {
                                    e.stopPropagation();              // ⛔️ не переходим
                                    startEdit(row);
                                }}
                            >
                                {editingId === row.id ? (
                                    <TextField
                                        size="small"
                                        type="number"
                                        autoFocus
                                        value={editingValue}
                                        onChange={(e) =>
                                            setEditingValue(e.target.value)
                                        }
                                        onBlur={() => saveEdit(row)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                                saveEdit(row);
                                            if (e.key === "Escape")
                                                cancelEdit();
                                        }}
                                        sx={{ width: 70 }}
                                    />
                                ) : (
                                    row.orderIndex
                                )}
                            </TableCell>
                        </TableRow>
                    ))}

                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                Нет данных
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
}
