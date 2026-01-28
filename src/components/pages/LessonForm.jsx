import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Paper,
    Divider,
    IconButton,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItemButton,
    ListItemText,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";

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
        ageGroups,
        blockTypes,
        questionTypes,
    } = dictionaries;

    /* ================= DIALOGS ================= */
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [itemDialog, setItemDialog] = useState({ open: false, blockIndex: null });
    const [questionDialog, setQuestionDialog] = useState({ open: false, blockIndex: null });

    /* ================= INIT ================= */
    useEffect(() => {
        if (!initialData) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
            ...initialData,
            blocks: (initialData.blocks ?? []).map((b) => ({
                ...b,

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

                // 🔥 ВАЖНО: нормализация тестов
                questions: (b.test?.questions ?? []).map((q) => ({
                    id: q.id,
                    text: q.text,
                    type: q.type,

                    // backend -> frontend
                    answerItems: (q.items ?? []).map((a) => ({
                        key: a.key,
                        value: a.value,
                        isCorrect: a.isCorrect ?? false,
                    })),
                })),
            })),
        });
    }, [initialData]);


    if (!form) return null;

    /* ================= HELPERS ================= */
    const updateMeta = (key, value) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const recalcBlocks = (blocks) =>
        blocks.map((b, i) => ({
            ...b,
            orderIndex: i + 1,
            items: (b.items ?? []).map((it, j) => ({
                ...it,
                orderIndex: j + 1,
            })),
        }));

    /* ================= BLOCKS ================= */
    const addBlock = (type) => {
        setForm((prev) => ({
            ...prev,
            blocks: recalcBlocks([
                ...(prev.blocks ?? []),
                { type, items: [], questions: [] },
            ]),
        }));
        setBlockDialogOpen(false);
    };

    const moveBlock = (from, to) => {
        if (to < 0 || to >= form.blocks.length) return;
        const blocks = [...form.blocks];
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);
        setForm({ ...form, blocks: recalcBlocks(blocks) });
    };

    const deleteBlock = (index) => {
        const blocks = [...form.blocks];
        blocks.splice(index, 1);
        setForm({ ...form, blocks: recalcBlocks(blocks) });
    };

    /* ================= ITEMS ================= */
    const addItem = (blockIndex, type) => {
        setForm((prev) => {
            const blocks = [...prev.blocks];
            blocks[blockIndex].items.push(
                type === "TEXT"
                    ? { itemType: "TEXT", content: "" }
                    : { itemType: type, mediaUrl: "", previewUrl: "", file: null }
            );
            return { ...prev, blocks: recalcBlocks(blocks) };
        });
        setItemDialog({ open: false, blockIndex: null });
    };

    const updateItem = (blockIndex, itemIndex, patch) => {
        setForm((prev) => {
            const blocks = [...prev.blocks];
            blocks[blockIndex].items[itemIndex] = {
                ...blocks[blockIndex].items[itemIndex],
                ...patch,
            };
            return { ...prev, blocks };
        });
    };

    const deleteItem = (blockIndex, itemIndex) => {
        setForm((prev) => {
            const blocks = [...prev.blocks];
            blocks[blockIndex].items.splice(itemIndex, 1);
            return { ...prev, blocks: recalcBlocks(blocks) };
        });
    };

    const deleteQuestion = (blockIndex, questionIndex) => {
        const blocks = [...form.blocks];
        blocks[blockIndex].questions.splice(questionIndex, 1);
        setForm({ ...form, blocks });
    };

    const uploadImageForItem = async (blockIndex, itemIndex) => {
        const item = form.blocks[blockIndex].items[itemIndex];
        const res = await uploadImage(item.file);
        updateItem(blockIndex, itemIndex, {
            mediaUrl: res.objectKey,
            previewUrl: buildImagePreviewUrl(res.url),
            file: null,
        });
    };

    /* ================= QUESTIONS ================= */
    const createDefaultAnswers = (type) => {
        if (type === "TRUE_FALSE") {
            return [
                { key: "T", value: "", isCorrect: true },
                { key: "F", value: "", isCorrect: false },
            ];
        }
        if (type === "MATCH") {
            return Array.from({ length: 3 }, () => ({ key: "", value: "" }));
        }
        return ABCD.map((k, i) => ({
            key: k,
            value: "",
            isCorrect: i === 0,
        }));
    };

    const addQuestion = (blockIndex, type) => {
        const blocks = [...form.blocks];
        blocks[blockIndex].questions.push({
            text: "",
            type,
            answerItems: createDefaultAnswers(type),
        });
        setForm({ ...form, blocks });
        setQuestionDialog({ open: false, blockIndex: null });
    };

    const updateQuestion = (blockIndex, qIndex, patch) => {
        const blocks = [...form.blocks];
        blocks[blockIndex].questions[qIndex] = {
            ...blocks[blockIndex].questions[qIndex],
            ...patch,
        };
        setForm({ ...form, blocks });
    };

    const addMatchOption = (blockIndex, qIndex) => {
        const blocks = [...form.blocks];
        blocks[blockIndex].questions[qIndex].answerItems.push({
            key: "",
            value: "",
        });
        setForm({ ...form, blocks });
    };

    const deleteMatchOption = (blockIndex, qIndex, optionIndex) => {
        const blocks = [...form.blocks];
            blocks[blockIndex].questions[qIndex].answerItems.splice(optionIndex, 1);
        setForm({ ...form, blocks });
    };

    /* ================= PAYLOAD ================= */
    const buildPayload = () => ({
        ...form,
        blocks: form.blocks.map((b, bi) => ({
            type: b.type,
            orderIndex: bi + 1,
            items: b.items.map((it, ii) =>
                it.itemType === "IMAGE"
                    ? {
                        itemType: "IMAGE",
                        orderIndex: ii + 1,
                        mediaUrl: extractObjectKey(it.mediaUrl),
                    }
                    : { ...it, orderIndex: ii + 1 }
            ),
            questions: b.questions,
        })),
    });

    /* ================= RENDER ================= */
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">Редактирование урока</Typography>

            {/* META */}
            <Stack spacing={2} maxWidth={420} mt={3}>
                <TextField label="Название" value={form.title} onChange={(e) => updateMeta("title", e.target.value)} />
                <TextField label="Описание" multiline minRows={3} value={form.description} onChange={(e) => updateMeta("description", e.target.value)} />

                {[["Возраст", "ageGroup", ageGroups],
                    ["Уровень", "level", levels],
                    ["Категория", "category", categories],
                    ["Язык", "lang", langs],
                    ["Статус", "status", statuses],
                ].map(([label, key, list]) => (
                    <FormControl fullWidth key={key}>
                        <InputLabel>{label}</InputLabel>
                        <Select value={form[key]} label={label} onChange={(e) => updateMeta(key, e.target.value)}>
                            {list.map((x) => (
                                <MenuItem key={x.code} value={x.code}>{x.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ))}
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* BLOCKS */}
            {form.blocks.map((block, bi) => (
                <Paper key={bi} sx={{ p: 2, mb: 3 }}>
                    <Box display="flex" justifyContent="space-between">
                        <Typography fontWeight="bold">{block.type} — #{bi + 1}</Typography>
                        <Box>
                            <IconButton onClick={() => moveBlock(bi, bi - 1)}><ArrowUpwardIcon /></IconButton>
                            <IconButton onClick={() => moveBlock(bi, bi + 1)}><ArrowDownwardIcon /></IconButton>
                            <IconButton color="error" onClick={() => deleteBlock(bi)}><DeleteIcon /></IconButton>
                        </Box>
                    </Box>

                    {/* ITEMS */}
                    {block.items.map((it, ii) => (
                        <Paper key={ii} sx={{ p: 2, mt: 2 }}>
                            {/* ITEM HEADER */}
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                mb={1}
                            >
                                <Typography variant="subtitle2" color="text.secondary">
                                    {it.itemType}
                                </Typography>

                                <Tooltip title="Удалить элемент">
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => deleteItem(bi, ii)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* ITEM CONTENT */}
                            {it.itemType === "TEXT" && (
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    label="Текст"
                                    value={it.content}
                                    onChange={(e) =>
                                        updateItem(bi, ii, { content: e.target.value })
                                    }
                                />
                            )}

                            {it.itemType === "VIDEO" && (
                                <TextField
                                    fullWidth
                                    label="Видео"
                                    placeholder="Вставьте ссылку"
                                    value={it.mediaUrl}
                                    onChange={(e) =>
                                        updateItem(bi, ii, { mediaUrl: e.target.value })
                                    }
                                />
                            )}

                            {it.itemType === "IMAGE" && (
                                <Box>
                                    {it.previewUrl && (
                                        <img src={it.previewUrl} style={{ maxWidth: 240 }} />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            updateItem(bi, ii, { file: e.target.files[0] })
                                        }
                                    />
                                    {it.file && (
                                        <Button
                                            startIcon={<CloudUploadIcon />}
                                            onClick={() => uploadImageForItem(bi, ii)}
                                        >
                                            Загрузить
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </Paper>
                    ))}



                    <Button startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={() => setItemDialog({ open: true, blockIndex: bi })}>
                        Добавить элемент
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    {/* QUESTIONS */}
                    {block.questions.map((q, qi) => (
                        <Paper key={qi} sx={{ p: 2, mt: 2 }}>
                            {/* TEST HEADER */}
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                mb={1}
                            >
                                <TextField
                                    fullWidth
                                    label="Вопрос"
                                    value={q.text}
                                    onChange={(e) =>
                                        updateQuestion(bi, qi, { text: e.target.value })
                                    }
                                />

                                <Tooltip title="Удалить тест целиком">
                                    <IconButton
                                        color="error"
                                        onClick={() => deleteQuestion(bi, qi)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* ANSWERS */}
                            {q.answerItems.map((a, ai) => (
                                <Stack
                                    key={ai}
                                    direction="row"
                                    spacing={1}
                                    mt={1}
                                    alignItems="center"
                                >
                                    {/* MATCH */}
                                    {q.type === "MATCH" && (
                                        <>
                                            <TextField
                                                label="Ключ"
                                                value={a.key}
                                                sx={{ width: 140 }}
                                                onChange={(e) => {
                                                    const items = [...q.answerItems];
                                                    items[ai].key = e.target.value;
                                                    updateQuestion(bi, qi, {
                                                        answerItems: items,
                                                    });
                                                }}
                                            />
                                            <TextField
                                                label="Значение"
                                                fullWidth
                                                value={a.value}
                                                onChange={(e) => {
                                                    const items = [...q.answerItems];
                                                    items[ai].value = e.target.value;
                                                    updateQuestion(bi, qi, {
                                                        answerItems: items,
                                                    });
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Tooltip title="Удалить вариант">
                                                                <IconButton
                                                                    edge="end"
                                                                    color="error"
                                                                    size="small"
                                                                    onClick={() =>
                                                                        deleteMatchOption(bi, qi, ai)
                                                                    }
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </>
                                    )}

                                    {/* SINGLE / TRUE_FALSE */}
                                    {q.type !== "MATCH" && (
                                        <>
                                            <TextField
                                                value={a.key}
                                                sx={{ width: 80 }}
                                                disabled
                                            />
                                            <TextField
                                                fullWidth
                                                label="Ответ"
                                                value={a.value}
                                                onChange={(e) => {
                                                    const items = [...q.answerItems];
                                                    items[ai].value = e.target.value;
                                                    updateQuestion(bi, qi, {
                                                        answerItems: items,
                                                    });
                                                }}
                                            />
                                            {(q.type === "SINGLE_CHOICE" ||
                                                q.type === "TRUE_FALSE") && (
                                                <Tooltip title="Правильный ответ">
                                                    <Checkbox
                                                        checked={a.isCorrect}
                                                        onChange={() =>
                                                            updateQuestion(bi, qi, {
                                                                answerItems:
                                                                    q.answerItems.map(
                                                                        (x, idx) => ({
                                                                            ...x,
                                                                            isCorrect:
                                                                                idx === ai,
                                                                        })
                                                                    ),
                                                            })
                                                        }
                                                    />
                                                </Tooltip>
                                            )}
                                        </>
                                    )}
                                </Stack>
                            ))}

                            {/* ADD MATCH OPTION */}
                            {q.type === "MATCH" && (
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    sx={{ mt: 1 }}
                                    onClick={() => addMatchOption(bi, qi)}
                                >
                                    Добавить вариант
                                </Button>
                            )}
                        </Paper>
                    ))}

                    <Button startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={() => setQuestionDialog({ open: true, blockIndex: bi })}>
                        Добавить тест
                    </Button>
                </Paper>
            ))}

            <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setBlockDialogOpen(true)}>
                Добавить блок
            </Button>

            <Divider sx={{ my: 4 }} />

            <Button variant="contained" size="large" onClick={() => onSubmit(buildPayload())}>
                💾 Сохранить урок
            </Button>

            {/* DIALOGS */}
            <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)}>
                <DialogTitle>Тип блока</DialogTitle>
                <DialogContent>
                    <List>
                        {blockTypes.map((bt) => (
                            <ListItemButton key={bt.code} onClick={() => addBlock(bt.code)}>
                                <ListItemText primary={bt.label} />
                            </ListItemButton>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            <Dialog open={itemDialog.open} onClose={() => setItemDialog({ open: false, blockIndex: null })}>
                <DialogTitle>Тип элемента</DialogTitle>
                <DialogContent>
                    <List>
                        {blockTypes.map((bt) => (
                            <ListItemButton key={bt.code} onClick={() => addItem(itemDialog.blockIndex, bt.code)}>
                                <ListItemText primary={bt.label} />
                            </ListItemButton>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>

            <Dialog open={questionDialog.open} onClose={() => setQuestionDialog({ open: false, blockIndex: null })}>
                <DialogTitle>Тип теста</DialogTitle>
                <DialogContent>
                    <List>
                        {questionTypes.map((qt) => (
                            <ListItemButton key={qt.code} onClick={() => addQuestion(questionDialog.blockIndex, qt.code)}>
                                <ListItemText primary={qt.label} />
                            </ListItemButton>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
