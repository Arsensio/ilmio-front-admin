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
    const [statuses, setStatuses] = useState([]);
    const [langs, setLangs] = useState([]);
    const [categories, setCategories] = useState([]);

    /* ===== FILTER STATE ===== */
    const [filters, setFilters] = useState({
        status: "",
        category: "",
        lang: "",          // ✅ ВАЖНО: добавили
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

                setStatuses(data.statuses ?? []);
                setLangs(data.langs ?? []);
                setCategories(data.categories ?? []);
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

            {/* ===== FILTERS ===== */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <LessonsFilters
                    statuses={statuses}
                    categories={categories}
                    langs={langs}          // ✅ передаём
                    value={filters}
                    onChange={(next) => {
                        setFilters(next);
                        setPage(0);
                    }}
                    onReset={() => {
                        setFilters({
                            status: "",
                            category: "",
                            lang: "",          // ✅ сброс языка
                            title: "",
                        });
                        setSort({ field: null, direction: null });
                        setPage(0);
                    }}
                />
            </Paper>

            {/* ===== TABLE ===== */}
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
