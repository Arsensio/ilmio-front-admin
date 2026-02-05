import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Divider,
    TextField,
} from "@mui/material";

import { getFilterData } from "@/api/lessons";
import {
    getTopicById,
    updateTopic,
    updateLessonOrderIndex,
} from "@/api/topics";

import TopicForm from "./topic/TopicForm";

export default function TopicDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [form, setForm] = useState(null);
    const [editMode, setEditMode] = useState(false);

    const [statuses, setStatuses] = useState([]);
    const [ageGroups, setAgeGroups] = useState([]);
    const [langs, setLangs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // orderIndex edit
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [editingValue, setEditingValue] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const [topicRes, dicts] = await Promise.all([
                    getTopicById(id),
                    getFilterData(),
                ]);

                setData(topicRes.data);
                setForm({
                    title: topicRes.data.title,
                    description: topicRes.data.description,
                    status: topicRes.data.status,
                    level: topicRes.data.level,
                    ageGroup: topicRes.data.ageGroup,
                    lang: topicRes.data.lang,
                });

                setStatuses(dicts.statuses ?? []);
                setAgeGroups(dicts.ageGroups ?? []);
                setLangs(dicts.langs ?? []);
            } catch {
                setError("Ошибка загрузки темы");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const saveTopic = async () => {
        try {
            setSaving(true);
            await updateTopic(data.id, form);
            setEditMode(false);
            setData((prev) => ({ ...prev, ...form }));
        } catch {
            setError("Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    };

    const finishOrderEdit = async (lesson) => {
        const newIndex = Number(editingValue);
        setEditingLessonId(null);

        if (Number.isNaN(newIndex) || newIndex === lesson.orderIndex) return;

        try {
            const res = await updateLessonOrderIndex({
                themeId: data.id,
                lessonId: lesson.id,
                orderIndex: newIndex,
            });

            if (res.data === true) {
                setData((prev) => ({
                    ...prev,
                    lessons: prev.lessons.map((l) =>
                        l.id === lesson.id
                            ? { ...l, orderIndex: newIndex }
                            : l
                    ),
                }));
            }
        } catch {
            setError("Ошибка обновления порядка урока");
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={6}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) return <Alert severity="error">{error}</Alert>;
    if (!data || !form) return null;

    return (
        <Box sx={{ p: 3 }}>
            <Button onClick={() => navigate(-1)}>Назад</Button>

            <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography variant="h4">Тема #{data.orderIndex}</Typography>
                {!editMode && (
                    <Button variant="outlined" onClick={() => setEditMode(true)}>
                        Редактировать
                    </Button>
                )}
            </Box>

            {/* VIEW / EDIT FORM */}
            <Box mt={3}>
                {editMode ? (
                    <TopicForm
                        value={form}
                        onChange={setForm}
                        onSubmit={saveTopic}
                        submitting={saving}
                        statuses={statuses}
                        ageGroups={ageGroups}
                        langs={langs}
                        submitLabel="Сохранить"
                    />
                ) : (
                    <Paper sx={{ p: 2 }}>
                        <Typography><b>Название:</b> {data.title}</Typography>
                        <Typography><b>Описание:</b> {data.description}</Typography>
                        <Typography><b>Статус:</b> {data.status}</Typography>
                        <Typography><b>Возраст:</b> {data.ageGroup}</Typography>
                        <Typography><b>Язык:</b> {data.lang}</Typography>
                    </Paper>
                )}
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* LESSONS TABLE */}
            <Typography variant="h5" mb={2}>
                Уроки в теме
            </Typography>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Категория</TableCell>
                            <TableCell>Название</TableCell>
                            <TableCell>Описание</TableCell>
                            <TableCell>Порядок</TableCell>
                            <TableCell>Язык</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {data.lessons.map((lesson) => (
                            <TableRow
                                key={lesson.id}
                                hover
                                sx={{ cursor: "pointer" }}
                                onClick={() => {
                                    if (editingLessonId) return;
                                    navigate(`/lessons/${lesson.id}`);
                                }}
                            >
                                <TableCell>{lesson.id}</TableCell>
                                <TableCell>{lesson.status}</TableCell>
                                <TableCell>{lesson.category}</TableCell>
                                <TableCell>{lesson.title}</TableCell>
                                <TableCell>{lesson.description}</TableCell>

                                {/* EDITABLE ORDER */}
                                {/* EDITABLE ORDER */}
                                <TableCell
                                    onClick={(e) => e.stopPropagation()}
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        setEditingLessonId(lesson.id);
                                        setEditingValue(String(lesson.orderIndex));
                                    }}
                                >
                                    {editingLessonId === lesson.id ? (
                                        <TextField
                                            size="small"
                                            autoFocus
                                            value={editingValue}
                                            inputProps={{
                                                inputMode: "numeric", // 📱 мобилки
                                                pattern: "[0-9]*",     // 🧠 только цифры
                                            }}
                                            onChange={(e) => {
                                                // 🔥 фильтруем всё, кроме цифр
                                                const onlyDigits = e.target.value.replace(/\D/g, "");
                                                setEditingValue(onlyDigits);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    finishOrderEdit(lesson);
                                                }
                                            }}
                                            onBlur={() => finishOrderEdit(lesson)}
                                            sx={{ width: 80 }}
                                        />
                                    ) : (
                                        lesson.orderIndex
                                    )}
                                </TableCell>


                                <TableCell>{lesson.lang}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}
