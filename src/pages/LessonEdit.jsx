import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import LessonForm from "@/components/pages/LessonForm";
import { getLessonById, updateLesson, getFilterData } from "@/api/lessons";

import { Box, CircularProgress, Alert } from "@mui/material";

export default function LessonEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [dicts, setDicts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const [lessonRes, filterData] = await Promise.all([
                    getLessonById(id),
                    getFilterData(),
                ]);

                setLesson(lessonRes.data);
                setDicts(filterData);
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки урока");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const handleSave = async (payload) => {
        try {
            await updateLesson(id, payload);
            navigate(`/lessons/${id}`);
        } catch (e) {
            console.error(e);
            setError("Ошибка сохранения урока");
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

    if (!lesson || !dicts) return null;

    return (
        <LessonForm
            initialData={lesson}
            dictionaries={dicts}
            onSubmit={handleSave}
        />
    );
}
