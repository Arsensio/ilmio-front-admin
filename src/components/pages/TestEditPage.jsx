import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Stack,
    Chip,
    Divider,
} from "@mui/material";

import { getLessonTests, getQuestionTypes } from "@/api/testLessons";

export default function TestEditPage() {
    const { lessonId } = useParams();

    const [tests, setTests] = useState([]);
    const [questionTypes, setQuestionTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ===== MAP questionType -> label ===== */
    const questionTypeMap = useMemo(() => {
        const map = {};
        questionTypes.forEach((q) => (map[q.code] = q.label));
        return map;
    }, [questionTypes]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                const [testsRes, typesRes] = await Promise.all([
                    getLessonTests(lessonId),
                    getQuestionTypes(),
                ]);

                setTests(testsRes.data ?? []);
                setQuestionTypes(typesRes.data ?? []);
            } catch (e) {
                console.error(e);
                setError("Ошибка при загрузке теста");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [lessonId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={6}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 3 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h4" mb={3}>
                Редактирование тестов (Урок #{lessonId})
            </Typography>

            <Stack spacing={3}>
                {tests.map((test) => (
                    <Paper key={test.id} sx={{ p: 2 }}>
                        <Typography variant="h6">
                            {test.name}
                        </Typography>

                        <Divider sx={{ my: 1 }} />

                        <Stack spacing={2}>
                            {test.questions.map((q) => (
                                <Paper
                                    key={q.id}
                                    variant="outlined"
                                    sx={{ p: 2 }}
                                >
                                    <Stack spacing={1}>
                                        <Typography>
                                            <b>Вопрос:</b> {q.text}
                                        </Typography>

                                        <Chip
                                            label={
                                                questionTypeMap[q.type] ??
                                                q.type
                                            }
                                            size="small"
                                            color="primary"
                                            sx={{ width: "fit-content" }}
                                        />

                                        {/* ===== ITEMS ===== */}
                                        <Stack spacing={0.5}>
                                            {q.items.map((item) => (
                                                <Typography
                                                    key={item.key}
                                                    color={
                                                        item.isCorrect
                                                            ? "green"
                                                            : "text.primary"
                                                    }
                                                >
                                                    {item.key}. {item.value}
                                                </Typography>
                                            ))}
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
}
