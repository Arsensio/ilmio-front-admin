import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    Button,
    Stack,
    Paper,
    Divider,
    IconButton,
    Checkbox,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import {
    uploadImage,
    buildImagePreviewUrl,
    extractObjectKey,
} from "@/api/images";

const ABCD = ["A", "B", "C", "D"];

export default function LessonForm({ initialData, dictionaries, onSubmit }) {
    const [form, setForm] = useState(null);

    const {
        levels,
        statuses,
        categories,
        langs,
        blockTypes,
        ageGroups,
        questionTypes,
    } = dictionaries;

    /* ================= INIT ================= */
    useEffect(() => {
        if (!initialData) return;

        setForm({
            ...initialData,
            blocks: (initialData.blocks ?? []).map((b) => ({
                ...b,
                questions: b.questions ?? [],
                items: (b.items ?? []).map((it) =>
                    it.itemType === "IMAGE"
                        ? {
                            ...it,
                            previewUrl: it.mediaUrl
                                ? buildImagePreviewUrl(it.mediaUrl)
                                : "",
                            file: null,
                        }
                        : it
                ),
            })),
        });
    }, [initialData]);

    if (!form) return null;

    /* ================= HELPERS ================= */

    const recalcBlocks = (blocks) =>
        blocks.map((b, i) => ({
            ...b,
            orderIndex: i + 1,
            items: (b.items ?? []).map((it, j) => ({
                ...it,
                orderIndex: j + 1,
            })),
        }));

    const updateMeta = (key, value) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    /* ================= BLOCKS ================= */

    const addBlock = (type) => {
        setForm((prev) => ({
            ...prev,
            blocks: recalcBlocks([
                ...(prev.blocks ?? []),
                { id: Date.now(), type, items: [], questions: [] },
            ]),
        }));
    };

    const moveBlock = (from, to) => {
        if (to < 0 || to >= form.blocks.length) return;
        const blocks = [...form.blocks];
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);
        setForm({ ...form, blocks: recalcBlocks(blocks) });
    };

    const deleteBlock = (blockId) => {
        setForm((prev) => ({
            ...prev,
            blocks: recalcBlocks(prev.blocks.filter((b) => b.id !== blockId)),
        }));
    };

    /* ================= ITEMS ================= */

    const addItem = (blockId, type) => {
        setForm((prev) => ({
            ...prev,
            blocks: prev.blocks.map((b) =>
                b.id !== blockId
                    ? b
                    : {
                        ...b,
                        items: [
                            ...(b.items ?? []),
                            type === "TEXT"
                                ? {
                                    id: Date.now(),
                                    itemType: "TEXT",
                                    content: "",
                                }
                                : {
                                    id: Date.now(),
                                    itemType: type,
                                    mediaUrl: "",
                                    previewUrl: "",
                                    file: null,
                                },
                        ],
                    }
            ),
        }));
    };

    const updateItem = (blockId, itemId, patch) => {
        setForm((prev) => ({
            ...prev,
            blocks: prev.blocks.map((b) =>
                b.id !== blockId
                    ? b
                    : {
                        ...b,
                        items: b.items.map((it) =>
                            it.id === itemId ? { ...it, ...patch } : it
                        ),
                    }
            ),
        }));
    };

    const deleteItem = (blockId, itemId) => {
        setForm((prev) => ({
            ...prev,
            blocks: prev.blocks.map((b) =>
                b.id !== blockId
                    ? b
                    : {
                        ...b,
                        items: b.items.filter((i) => i.id !== itemId),
                    }
            ),
        }));
    };

    /* ================= IMAGE ================= */

    const uploadImageForItem = async (blockId, item) => {
        const res = await uploadImage(item.file);
        updateItem(blockId, item.id, {
            mediaUrl: res.objectKey,
            previewUrl: buildImagePreviewUrl(res.url),
            file: null,
        });
    };

    /* ================= QUESTIONS ================= */

    const createDefaultAnswers = (type) => {
        if (type === "TRUE_FALSE") {
            return [
                { key: "T", value: "Иә", isCorrect: true },
                { key: "F", value: "Жоқ", isCorrect: false },
            ];
        }

        if (type === "MATCH") {
            return ABCD.map((k) => ({ key: k, value: "" }));
        }

        return ABCD.map((k, i) => ({
            key: k,
            value: "",
            isCorrect: i === 0,
        }));
    };

    const addQuestion = (blockId, type) => {
        const question = {
            id: Date.now(),
            text: "",
            type,
            answerItems: createDefaultAnswers(type),
        };

        setForm((prev) => ({
            ...prev,
            blocks: prev.blocks.map((b) =>
                b.id === blockId
                    ? { ...b, questions: [...b.questions, question] }
                    : b
            ),
        }));
    };

    const updateQuestion = (blockId, qId, patch) => {
        setForm((prev) => ({
            ...prev,
            blocks: prev.blocks.map((b) =>
                b.id !== blockId
                    ? b
                    : {
                        ...b,
                        questions: b.questions.map((q) =>
                            q.id === qId ? { ...q, ...patch } : q
                        ),
                    }
            ),
        }));
    };

    const deleteQuestion = (blockId, qId) => {
        setForm((prev) => ({
            ...prev,
            blocks: prev.blocks.map((b) =>
                b.id !== blockId
                    ? b
                    : {
                        ...b,
                        questions: b.questions.filter(
                            (q) => q.id !== qId
                        ),
                    }
            ),
        }));
    };

    const addAnswerItem = (blockId, q) => {
        const nextKey =
            ABCD[q.answerItems.length] ??
            `${q.answerItems.length + 1}`;

        updateQuestion(blockId, q.id, {
            answerItems: [
                ...q.answerItems,
                q.type === "MATCH"
                    ? { key: nextKey, value: "" }
                    : { key: nextKey, value: "", isCorrect: false },
            ],
        });
    };

    const deleteAnswerItem = (blockId, q, index) => {
        updateQuestion(blockId, q.id, {
            answerItems: q.answerItems.filter((_, i) => i !== index),
        });
    };

    /* ================= SAVE ================= */

    const buildPayload = () => ({
        ...form,
        blocks: form.blocks.map((b) => ({
            type: b.type,
            orderIndex: b.orderIndex,
            items: b.items.map((it) =>
                it.itemType === "IMAGE"
                    ? {
                        itemType: it.itemType,
                        orderIndex: it.orderIndex,
                        mediaUrl: extractObjectKey(it.mediaUrl),
                    }
                    : it
            ),
            questions: b.questions.map((q) => ({
                text: q.text,
                type: q.type,
                answerItems: q.answerItems,
            })),
        })),
    });

    /* ================= RENDER ================= */

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">Редактирование урока</Typography>

            {/* META */}
            <Stack spacing={2} maxWidth={420} mt={3}>
                <TextField
                    label="Название"
                    value={form.title}
                    onChange={(e) => updateMeta("title", e.target.value)}
                />
                <TextField
                    label="Описание"
                    multiline
                    minRows={3}
                    value={form.description}
                    onChange={(e) =>
                        updateMeta("description", e.target.value)
                    }
                />
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* BLOCKS */}
            {form.blocks.map((block, idx) => (
                <Paper key={block.id} sx={{ p: 2, mb: 3 }}>
                    <Box display="flex" justifyContent="space-between">
                        <Typography fontWeight="bold">
                            {block.type} — #{block.orderIndex}
                        </Typography>
                        <Box>
                            <IconButton onClick={() => moveBlock(idx, idx - 1)}>
                                <ArrowUpwardIcon />
                            </IconButton>
                            <IconButton onClick={() => moveBlock(idx, idx + 1)}>
                                <ArrowDownwardIcon />
                            </IconButton>
                            <IconButton
                                color="error"
                                onClick={() => deleteBlock(block.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* ITEMS */}
                    {block.items.map((it) => (
                        <Paper key={it.id} variant="outlined" sx={{ p: 2, mt: 2 }}>
                            <Box display="flex" gap={2}>
                                <Box flex={1}>
                                    {it.itemType === "TEXT" && (
                                        <TextField
                                            fullWidth
                                            label="Текст"
                                            value={it.content}
                                            onChange={(e) =>
                                                updateItem(block.id, it.id, {
                                                    content: e.target.value,
                                                })
                                            }
                                        />
                                    )}

                                    {it.itemType === "VIDEO" && (
                                        <TextField
                                            fullWidth
                                            label="Видео"
                                            value={it.mediaUrl}
                                            onChange={(e) =>
                                                updateItem(block.id, it.id, {
                                                    mediaUrl: e.target.value,
                                                })
                                            }
                                        />
                                    )}

                                    {it.itemType === "IMAGE" && (
                                        <Box>
                                            {it.previewUrl && (
                                                <img
                                                    src={it.previewUrl}
                                                    style={{
                                                        maxWidth: 240,
                                                        borderRadius: 8,
                                                        border: "1px solid #ddd",
                                                    }}
                                                />
                                            )}

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    updateItem(block.id, it.id, {
                                                        file: e.target.files[0],
                                                    })
                                                }
                                            />

                                            {it.file && (
                                                <Button
                                                    variant="contained"
                                                    startIcon={<CloudUploadIcon />}
                                                    sx={{ mt: 1 }}
                                                    onClick={() =>
                                                        uploadImageForItem(
                                                            block.id,
                                                            it
                                                        )
                                                    }
                                                >
                                                    Загрузить
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </Box>

                                <IconButton
                                    color="error"
                                    onClick={() =>
                                        deleteItem(block.id, it.id)
                                    }
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Paper>
                    ))}

                    <Stack direction="row" spacing={1} mt={2}>
                        <Button onClick={() => addItem(block.id, "TEXT")}>
                            + TEXT
                        </Button>
                        <Button onClick={() => addItem(block.id, "IMAGE")}>
                            + IMAGE
                        </Button>
                        <Button onClick={() => addItem(block.id, "VIDEO")}>
                            + VIDEO
                        </Button>
                    </Stack>

                    {/* QUESTIONS */}
                    <Divider sx={{ my: 3 }} />
                    <Typography fontWeight="bold">🧪 Тесты</Typography>

                    {block.questions.map((q) => (
                        <Paper key={q.id} variant="outlined" sx={{ p: 2, mt: 2 }}>
                            <Box display="flex" gap={2}>
                                <TextField
                                    fullWidth
                                    label="Вопрос"
                                    value={q.text}
                                    onChange={(e) =>
                                        updateQuestion(block.id, q.id, {
                                            text: e.target.value,
                                        })
                                    }
                                />
                                <IconButton
                                    color="error"
                                    onClick={() =>
                                        deleteQuestion(block.id, q.id)
                                    }
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>

                            {q.answerItems.map((a, i) => (
                                <Stack
                                    key={i}
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    mt={1}
                                >
                                    <TextField
                                        label="Ключ"
                                        value={a.key}
                                        sx={{ width: 80 }}
                                        onChange={(e) => {
                                            const items = [...q.answerItems];
                                            items[i].key = e.target.value;
                                            updateQuestion(block.id, q.id, {
                                                answerItems: items,
                                            });
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Значение"
                                        value={a.value}
                                        onChange={(e) => {
                                            const items = [...q.answerItems];
                                            items[i].value = e.target.value;
                                            updateQuestion(block.id, q.id, {
                                                answerItems: items,
                                            });
                                        }}
                                    />
                                    {q.type === "SINGLE_CHOICE" && (
                                        <Checkbox
                                            checked={a.isCorrect}
                                            onChange={() =>
                                                updateQuestion(block.id, q.id, {
                                                    answerItems:
                                                        q.answerItems.map(
                                                            (x, idx2) => ({
                                                                ...x,
                                                                isCorrect:
                                                                    idx2 === i,
                                                            })
                                                        ),
                                                })
                                            }
                                        />
                                    )}
                                    {(q.type === "SINGLE_CHOICE" ||
                                        q.type === "MATCH") && (
                                        <IconButton
                                            color="error"
                                            onClick={() =>
                                                deleteAnswerItem(
                                                    block.id,
                                                    q,
                                                    i
                                                )
                                            }
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Stack>
                            ))}

                            {(q.type === "SINGLE_CHOICE" ||
                                q.type === "MATCH") && (
                                <Button
                                    startIcon={<AddIcon />}
                                    sx={{ mt: 1 }}
                                    onClick={() =>
                                        addAnswerItem(block.id, q)
                                    }
                                >
                                    Добавить вариант
                                </Button>
                            )}
                        </Paper>
                    ))}

                    <Stack direction="row" spacing={1} mt={2}>
                        {questionTypes.map((qt) => (
                            <Button
                                key={qt.code}
                                onClick={() =>
                                    addQuestion(block.id, qt.code)
                                }
                            >
                                + {qt.label}
                            </Button>
                        ))}
                    </Stack>
                </Paper>
            ))}

            <Divider sx={{ my: 4 }} />

            <Button
                variant="contained"
                size="large"
                onClick={() => onSubmit(buildPayload())}
            >
                💾 Сохранить урок
            </Button>
        </Box>
    );
}
