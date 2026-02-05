import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ДОБАВИТЬ
import {
    Box,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Button,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { getFilterData } from "@/api/lessons";
import TopicsFilters from "./TopicsFilters";
import TopicsTable from "./TopicsTable";

export default function Topics() {
    const navigate = useNavigate(); // ✅ ДОБАВИТЬ

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [levels, setLevels] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [ageGroups, setAgeGroups] = useState([]);
    const [langs, setLangs] = useState([]);

    const [filters, setFilters] = useState({
        statuses: [],
        levels: [],
        ageGroups: [],
        langs: [],
        title: "",
    });

    const [page, setPage] = useState(0);

    useEffect(() => {
        const init = async () => {
            try {
                const data = await getFilterData();
                setLevels(data.levels ?? []);
                setStatuses(data.statuses ?? []);
                setAgeGroups(data.ageGroups ?? []);
                setLangs(data.langs ?? []);
            } catch {
                setError("Ошибка загрузки фильтров");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={6}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h4">Темы</Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/topics/create")}
                >
                    Добавить тему
                </Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {/* FILTERS */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <TopicsFilters
                    levels={levels}
                    statuses={statuses}
                    ageGroups={ageGroups}
                    langs={langs}
                    value={filters}
                    onChange={setFilters}
                    onReset={() => {
                        setFilters({
                            statuses: [],
                            levels: [],
                            ageGroups: [],
                            langs: [],
                            title: "",
                        });
                        setPage(0);
                    }}
                />
            </Paper>

            {/* TABLE */}
            <TopicsTable filters={filters} page={page} />
        </Box>
    );
}
