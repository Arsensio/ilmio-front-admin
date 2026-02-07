import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";

import { getFilterData } from "@/api/lessons.js";
import { createTopic } from "@/api/topics.js";
import TopicForm from "./TopicForm.jsx";

export default function TopicCreate() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "",
        level: "",
        ageGroup: "",
        lang: "",
    });

    const [dicts, setDicts] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getFilterData().then(setDicts);
    }, []);

    const submit = async () => {
        setSaving(true);
        await createTopic(form);
        navigate("/topics");
    };

    if (!dicts) return <CircularProgress sx={{ mt: 6 }} />;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" mb={3}>
                Создание темы
            </Typography>

            <TopicForm
                value={form}
                onChange={setForm}
                onSubmit={submit}
                submitting={saving}
                statuses={dicts.statuses}
                ageGroups={dicts.ageGroups}
                langs={dicts.langs}
                submitLabel="Создать"
            />
        </Box>
    );
}
