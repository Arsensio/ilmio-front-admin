import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Alert } from "@mui/material";

import LessonForm from "@/components/pages/LessonForm";
import { createLesson, getFilterData } from "@/api/lessons";

/* ================= EMPTY LESSON ================= */

const EMPTY_LESSON = {
    title: "",
    description: "",
    ageGroup: "",
    level: "",
    status: "",
    category: "",
    lang: "",
    blocks: [],
};

export default function LessonCreate() {
    const navigate = useNavigate();

    const [dicts, setDicts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ================= LOAD DICTIONARIES ================= */
    useEffect(() => {
        const load = async () => {
            try {
                const data = await getFilterData();
                setDicts(data);
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки справочников");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    /* ================= SUBMIT ================= */
    const handleCreate = async (payload) => {
        try {
            await createLesson(payload);
            navigate("/lessons", { replace: true });
        } catch (e) {
            console.error(e);
            setError("Ошибка при создании урока");
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
        return <Alert severity="error">{error}</Alert>;
    }

    if (!dicts) return null;

    return (
        <LessonForm
            initialData={EMPTY_LESSON}
            dictionaries={dicts}
            onSubmit={handleCreate}
        />
    );
}
