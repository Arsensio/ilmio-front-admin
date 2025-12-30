import {
    Box,
    Typography,
    Divider,
    TextField,
    Select,
    MenuItem,
    FormControl,
    Button,
    IconButton,
    Paper,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";

export default function LessonForm({
                                       initialData,
                                       levels,
                                       statuses,
                                       categories,
                                       blockTypes,
                                       onSubmit,
                                   }) {
    const [formState, setFormState] = useState(initialData);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newBlockType, setNewBlockType] = useState("");

    /* ===========================
       Работа с блоками
    ============================ */
    const moveBlock = (from, to) => {
        if (to < 0 || to >= formState.blocks.length) return;

        const blocks = [...formState.blocks];
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);

        setFormState({
            ...formState,
            blocks: blocks.map((b, i) => ({ ...b, orderIndex: i + 1 })),
        });
    };

    const deleteBlock = (id) => {
        setFormState({
            ...formState,
            blocks: formState.blocks
                .filter((b) => b.id !== id)
                .map((b, i) => ({ ...b, orderIndex: i + 1 })),
        });
    };

    const createEmptyBlock = (type) => {
        const languages = formState.translations.map((t) => t.language);

        if (type === "TEXT") {
            return {
                id: Date.now(),
                type: "TEXT",
                orderIndex: formState.blocks.length + 1,
                items: [
                    {
                        id: Date.now() + 1,
                        itemType: "PARAGRAPH",
                        orderIndex: 1,
                        translations: languages.map((l) => ({
                            language: l,
                            content: "",
                        })),
                    },
                ],
            };
        }

        if (type === "IMAGE" || type === "VIDEO") {
            return {
                id: Date.now(),
                type,
                orderIndex: formState.blocks.length + 1,
                items: [
                    {
                        id: Date.now() + 1,
                        itemType: type,
                        orderIndex: 1,
                        translations: languages.map((l) => ({
                            language: l,
                            mediaUrl: "",
                        })),
                    },
                ],
            };
        }
    };

    const addBlock = () => {
        const block = createEmptyBlock(newBlockType);
        if (!block) return;

        setFormState({
            ...formState,
            blocks: [...formState.blocks, block],
        });

        setAddDialogOpen(false);
        setNewBlockType("");
    };

    const changeItem = (blockId, itemId, lang, field, value) => {
        setFormState({
            ...formState,
            blocks: formState.blocks.map((b) =>
                b.id !== blockId
                    ? b
                    : {
                        ...b,
                        items: b.items.map((it) =>
                            it.id !== itemId
                                ? it
                                : {
                                    ...it,
                                    translations: it.translations.map((tr) =>
                                        tr.language === lang
                                            ? { ...tr, [field]: value }
                                            : tr
                                    ),
                                }
                        ),
                    }
            ),
        });
    };

    /* ===========================
       UI
    ============================ */
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">Урок</Typography>

            {/* 🔹 Основные поля */}
            <Stack spacing={2} sx={{ maxWidth: 400, mt: 3 }}>
                {[
                    { label: "Уровень", key: "level", options: levels },
                    { label: "Статус", key: "status", options: statuses },
                    { label: "Категория", key: "category", options: categories },
                ].map((f) => (
                    <FormControl key={f.key} fullWidth>
                        <Typography fontWeight="bold">{f.label}</Typography>
                        <Select
                            value={formState[f.key]}
                            onChange={(e) =>
                                setFormState({
                                    ...formState,
                                    [f.key]: e.target.value,
                                })
                            }
                        >
                            {f.options.map((o) => (
                                <MenuItem key={o} value={o}>
                                    {o}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ))}

                <TextField
                    label="Возраст"
                    value={formState.ageGroup}
                    onChange={(e) =>
                        setFormState({ ...formState, ageGroup: e.target.value })
                    }
                />
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* 🔹 Переводы */}
            <Typography variant="h5">Переводы</Typography>
            {formState.translations.map((t) => (
                <Paper key={t.language} sx={{ p: 2, mt: 2 }}>
                    <Typography fontWeight="bold">{t.language}</Typography>
                    <TextField
                        fullWidth
                        label="Title"
                        value={t.title}
                        sx={{ mt: 1 }}
                        onChange={(e) =>
                            setFormState({
                                ...formState,
                                translations: formState.translations.map((tr) =>
                                    tr.language === t.language
                                        ? { ...tr, title: e.target.value }
                                        : tr
                                ),
                            })
                        }
                    />
                    <TextField
                        fullWidth
                        multiline
                        label="Description"
                        value={t.description}
                        sx={{ mt: 2 }}
                        onChange={(e) =>
                            setFormState({
                                ...formState,
                                translations: formState.translations.map((tr) =>
                                    tr.language === t.language
                                        ? {
                                            ...tr,
                                            description: e.target.value,
                                        }
                                        : tr
                                ),
                            })
                        }
                    />
                </Paper>
            ))}

            <Divider sx={{ my: 4 }} />

            {/* 🔹 Blocks */}
            <Typography variant="h5">Blocks</Typography>

            {formState.blocks.map((block, idx) => (
                <Paper key={block.id} sx={{ p: 2, mt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography fontWeight="bold">
                            Block #{idx + 1} — {block.type}
                        </Typography>
                        <Box>
                            <IconButton
                                onClick={() => moveBlock(idx, idx - 1)}
                                disabled={idx === 0}
                            >
                                <ArrowUpwardIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => moveBlock(idx, idx + 1)}
                                disabled={idx === formState.blocks.length - 1}
                            >
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

                    {block.items.map((item) =>
                        item.translations.map((tr) => (
                            <Paper key={tr.language} sx={{ p: 2, mt: 1 }}>
                                <Typography fontWeight="bold">
                                    {tr.language}
                                </Typography>
                                {item.itemType === "PARAGRAPH" ? (
                                    <TextField
                                        fullWidth
                                        multiline
                                        value={tr.content || ""}
                                        onChange={(e) =>
                                            changeItem(
                                                block.id,
                                                item.id,
                                                tr.language,
                                                "content",
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : (
                                    <TextField
                                        fullWidth
                                        value={tr.mediaUrl || ""}
                                        onChange={(e) =>
                                            changeItem(
                                                block.id,
                                                item.id,
                                                tr.language,
                                                "mediaUrl",
                                                e.target.value
                                            )
                                        }
                                    />
                                )}
                            </Paper>
                        ))
                    )}
                </Paper>
            ))}

            <Button
                startIcon={<AddIcon />}
                sx={{ mt: 3 }}
                onClick={() => setAddDialogOpen(true)}
            >
                Добавить блок
            </Button>

            <Divider sx={{ my: 4 }} />

            <Button
                variant="contained"
                size="large"
                onClick={() => onSubmit(formState)}
            >
                Сохранить
            </Button>

            {/* Диалог */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                <DialogTitle>Тип блока</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth>
                        <Select
                            value={newBlockType}
                            onChange={(e) => setNewBlockType(e.target.value)}
                        >
                            {blockTypes.map((t) => (
                                <MenuItem key={t} value={t}>
                                    {t}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>
                        Отмена
                    </Button>
                    <Button onClick={addBlock} disabled={!newBlockType}>
                        Добавить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
