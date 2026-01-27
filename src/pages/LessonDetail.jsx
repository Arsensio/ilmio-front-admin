import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Divider,
    Button,
    Stack,
} from "@mui/material";

import { getLessonById, getDictionary } from "@/api/lessons";

const isHttpUrl = (v) =>
    typeof v === "string" &&
    (v.startsWith("http://") || v.startsWith("https://"));

/* ===== BOOTSTRAP-LIKE DISABLED FIELD ===== */
function MetaField({ label, value }) {
    return (
        <Paper
            variant="outlined"
            sx={{
                px: 2,
                py: 1,
                borderRadius: 0,           // ⬛ квадратный
                bgcolor: "#f5f5f5",        // как disabled
                color: "text.secondary",
                fontSize: 14,
            }}
        >
            <b>{label}:</b> {value}
        </Paper>
    );
}

export default function LessonDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [questionTypes, setQuestionTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ===== question type label map ===== */
    const questionTypeMap = useMemo(() => {
        const map = {};
        questionTypes.forEach((q) => {
            map[q.code] = q.label ?? q.code;
        });
        return map;
    }, [questionTypes]);

    /* ================= LOAD ================= */
    useEffect(() => {
        const load = async () => {
            try {
                const [lessonRes, qTypes] = await Promise.all([
                    getLessonById(id),
                    getDictionary("QUESTION_TYPE"),
                ]);

                setLesson(lessonRes.data);
                setQuestionTypes(qTypes.data ?? []);
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки урока");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!lesson) return null;

    /* ================= RENDER ================= */
    return (
        <Box sx={{ p: 3 }}>
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Button onClick={() => navigate(-1)}>Назад</Button>
                <Button
                    variant="contained"
                    onClick={() => navigate(`/lessons/${id}/edit`)}
                >
                    ✏️ Редактировать
                </Button>
            </Box>

            {/* TITLE */}
            <Typography variant="h4">{lesson.title}</Typography>
            <Typography sx={{ mt: 1 }}>{lesson.description}</Typography>

            {/* ===== META (BOOTSTRAP DISABLED STYLE) ===== */}
            <Stack spacing={1.5} mt={3} sx={{ maxWidth: 320 }}>
                <MetaField label="LEVEL" value={lesson.level} />
                <MetaField label="AGE" value={lesson.ageGroup} />
                <MetaField label="LANG" value={lesson.lang} />
                <MetaField label="STATUS" value={lesson.status} />
                <MetaField label="CATEGORY" value={lesson.category} />
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* ===== BLOCKS ===== */}
            {(lesson.blocks ?? []).map((block) => (
                <Paper key={block.id} sx={{ p: 2, mb: 4 }}>
                    <Typography fontWeight="bold" mb={2}>
                        BLOCK {block.orderIndex} — {block.type}
                    </Typography>

                    {/* ITEMS */}
                    <Stack spacing={2}>
                        {(block.items ?? []).map((item) => {
                            if (item.itemType === "TEXT") {
                                return (
                                    <Typography key={item.id}>
                                        {item.content}
                                    </Typography>
                                );
                            }

                            if (item.itemType === "IMAGE") {
                                return (
                                    <img
                                        key={item.id}
                                        src={item.mediaUrl}
                                        alt="lesson"
                                        style={{
                                            maxWidth: 420,
                                            borderRadius: 4,
                                            border: "1px solid rgba(0,0,0,0.12)",
                                        }}
                                    />
                                );
                            }

                            if (item.itemType === "VIDEO") {
                                return (
                                    <Typography key={item.id} color="primary">
                                        🎬{" "}
                                        <a
                                            href={item.mediaUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {item.mediaUrl}
                                        </a>
                                    </Typography>
                                );
                            }

                            return null;
                        })}
                    </Stack>

                    {/* ===== TEST ===== */}
                    {block.test?.questions?.length > 0 && (
                        <>
                            <Divider sx={{ my: 3 }} />
                            <Typography fontWeight="bold" mb={2}>
                                🧪 Тест
                            </Typography>

                            <Stack spacing={2}>
                                {block.test.questions.map((q) => (
                                    <Paper
                                        key={q.id}
                                        variant="outlined"
                                        sx={{ p: 2, borderRadius: 0 }}
                                    >
                                        <Typography fontWeight="bold">
                                            {q.text}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: "inline-block",
                                                mt: 1,
                                                mb: 1,
                                                px: 1,
                                                py: 0.5,
                                                border: "1px solid #ccc",
                                                borderRadius: 0,
                                            }}
                                        >
                                            {questionTypeMap[q.type] ?? q.type}
                                        </Typography>

                                        <Stack spacing={0.5}>
                                            {(q.items ?? []).map((a, i) => (
                                                <Typography
                                                    key={i}
                                                    color={
                                                        a.isCorrect
                                                            ? "green"
                                                            : "text.primary"
                                                    }
                                                >
                                                    {a.key}. {a.value}
                                                </Typography>
                                            ))}
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        </>
                    )}
                </Paper>
            ))}
        </Box>
    );
}
