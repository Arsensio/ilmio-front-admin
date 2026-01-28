import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Typography,
    Alert,
    Paper,
    CircularProgress,
    Button,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { getFilterData } from "@/api/lessons";
import LessonsFilters from "./LessonsFilters";
import LessonsTable from "./LessonsTable";

export default function Lessons() {
    const navigate = useNavigate();

    /* ===== GLOBAL ===== */
    const [error, setError] = useState("");
    const [initialLoading, setInitialLoading] = useState(true);

    /* ===== FILTER DATA ===== */
    const [levels, setLevels] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ageGroups, setAgeGroups] = useState([]);

    /* ===== FILTER STATE ===== */
    const [filters, setFilters] = useState({
        level: "",
        status: "",
        category: "",
        ageGroup: "",
        title: "",
    });

    /* ===== SORT ===== */
    const [sort, setSort] = useState({
        field: null,
        direction: null,
    });

    /* ===== PAGINATION ===== */
    const [page, setPage] = useState(0);

    /* ===== INIT ===== */
    useEffect(() => {
        const init = async () => {
            try {
                const data = await getFilterData();
                setLevels(data.levels ?? []);
                setStatuses(data.statuses ?? []);
                setCategories(data.categories ?? []);
                setAgeGroups(data.ageGroups ?? []);
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки справочников");
            } finally {
                setInitialLoading(false);
            }
        };

        init();
    }, []);

    if (initialLoading) {
        return (
            <Box display="flex" justifyContent="center" mt={6}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* ===== HEADER ===== */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
            >
                <Typography variant="h4">Список уроков</Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/lessons/create")}
                    sx={{
                        textTransform: "none",
                        fontWeight: 500,
                        borderRadius: "8px",
                        px: 2.5,
                        py: 1,
                        backgroundColor: "#0d6efd", // admin / bootstrap primary
                        boxShadow: "none",
                        "&:hover": {
                            backgroundColor: "#0b5ed7",
                            boxShadow: "none",
                        },
                        "&:active": {
                            backgroundColor: "#0a58ca",
                        },
                    }}
                >
                    Добавить урок
                </Button>

            </Box>

            {/* ===== ERROR ===== */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* ===== FILTERS (STATIC) ===== */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <LessonsFilters
                    levels={levels}
                    statuses={statuses}
                    categories={categories}
                    ageGroups={ageGroups}
                    value={filters}
                    onChange={(next) => {
                        setFilters(next);
                        setPage(0);
                    }}
                    onReset={() => {
                        setFilters({
                            level: "",
                            status: "",
                            category: "",
                            ageGroup: "",
                            title: "",
                        });
                        setSort({ field: null, direction: null });
                        setPage(0);
                    }}
                />
            </Paper>

            {/* ===== TABLE (DYNAMIC) ===== */}
            <LessonsTable
                filters={filters}
                sort={sort}
                onSortChange={setSort}
                page={page}
                onPageChange={setPage}
            />
        </Box>
    );
}
