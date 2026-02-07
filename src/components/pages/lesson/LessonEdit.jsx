import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import LessonForm from "@/components/pages/lesson/LessonForm.jsx";
import { getLessonById, updateLesson, getFilterData } from "@/api/lessons.js";

import { Box, CircularProgress, Alert } from "@mui/material";

export default function LessonEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [dicts, setDicts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isDirty, setIsDirty] = useState(false); // 🔥 есть несохранённые изменения

    /* ================= LOAD ================= */
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

    /* ================= WARN BEFORE LEAVE ================= */
    useEffect(() => {
        if (!isDirty) return;

        const beforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", beforeUnload);
        return () => window.removeEventListener("beforeunload", beforeUnload);
    }, [isDirty]);

    /* ================= SAVE ================= */
    const handleSave = async (payload) => {
        try {
            await updateLesson(id, payload);

            setIsDirty(false); // ✅ данные сохранены

            navigate(`/lessons/${id}`, {
                replace: true, // 🔥 нельзя вернуться в edit
            });
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
            onChange={() => setIsDirty(true)} // 🔥 любое изменение
        />
    );
}
