import { useEffect, useState } from "react";
import axios from "axios";
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";

const LANGS = ["KZ", "RU", "EN"];

export default function LessonForm({
                                       mode = "create",
                                       initialData = null,
                                       onSubmit,
                                       onCancel,
                                   }) {
    const [levels, setLevels] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [blockTypes, setBlockTypes] = useState([]);

    const [addBlockOpen, setAddBlockOpen] = useState(false);
    const [newBlockType, setNewBlockType] = useState("");

    const [form, setForm] = useState({
        level: "",
        status: "",
        category: "",
        ageGroup: "",
        title: "",
        description:"",
        blocks: [],
    });

    /* =========================
       LOAD DICTIONARIES
    ========================== */
    useEffect(() => {
        const token = localStorage.getItem("token");

        Promise.all([
            axios.get("http://localhost:8081/admin/lesson/levels", {
                headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:8081/admin/lesson/statuses", {
                headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:8081/admin/lesson/categories", {
                headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:8081/admin/lesson/blocks", {
                headers: { Authorization: `Bearer ${token}` },
            }),
        ]).then(([l, s, c, b]) => {
            setLevels(l.data);
            setStatuses(s.data);
            setCategories(c.data);
            setBlockTypes(b.data);
        });
    }, []);

    /* =========================
       INIT EDIT MODE
    ========================== */
    useEffect(() => {
        if (initialData) {
            setForm({
                level: initialData.level,
                status: initialData.status,
                category: initialData.category,
                ageGroup: initialData.ageGroup,
                orderIndex: initialData.orderIndex,
                translations: initialData.translations,
                blocks: initialData.blocks || [],
            });
        }
    }, [initialData]);

    /* =========================
       HELPERS
    ========================== */
    const updateTranslation = (lang, field, value) => {
        setForm((prev) => ({
            ...prev,
            translations: prev.translations.map((t) =>
                t.language === lang ? { ...t, [field]: value } : t
            ),
        }));
    };

    const updateItem = (blockId, itemType, lang, value) => {
        setForm((prev) => ({
            ...prev,
            blocks: prev.blocks.map((b) =>
                b.id !== blockId
                    ? b
                    : {
                        ...b,
                        items: b.items.map((it) => ({
                            ...it,
                            translations: it.translations.map((tr) =>
                                tr.language === lang
                                    ? itemType === "PARAGRAPH"
                                        ? { ...tr, content: value }
                                        : { ...tr, mediaUrl: value }
                                    : tr
                            ),
                        })),
                    }
            ),
        }));
    };

    const moveBlock = (from, to) => {
        if (to < 0 || to >= form.blocks.length) return;

        const blocks = [...form.blocks];
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);

        setForm({
            ...form,
            blocks: blocks.map((b, i) => ({
                ...b,
                orderIndex: i + 1,
            })),
        });
    };

    const deleteBlock = (id) => {
        setForm({
            ...form,
            blocks: form.blocks
                .filter((b) => b.id !== id)
                .map((b, i) => ({ ...b, orderIndex: i + 1 })),
        });
    };

    const createEmptyBlock = (type) => {
        if (type === "TEXT") {
            return {
                id: Date.now(),
                type: "TEXT",
                orderIndex: form.blocks.length + 1,
                items: [
                    {
                        itemType: "PARAGRAPH",
                        orderIndex: 1,
                        translations: LANGS.map((l) => ({
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
                orderIndex: form.blocks.length + 1,
                items: [
                    {
                        itemType: type,
                        orderIndex: 1,
                        translations: LANGS.map((l) => ({
                            language: l,
                            mediaUrl: "",
                        })),
                    },
                ],
            };
        }
    };

    const handleAddBlock = () => {
        const block = createEmptyBlock(newBlockType);
        if (!block) return;

        setForm({ ...form, blocks: [...form.blocks, block] });
        setNewBlockType("");
        setAddBlockOpen(false);
    };

    const handleSubmit = () => {
        onSubmit(form);
    };

    /* =========================
       UI
    ========================== */
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">
                {mode === "create" ? "Создание урока" : "Редактирование урока"}
            </Typography>

            {/* BASIC INFO */}
            <Paper sx={{ p: 3, my: 3 }}>
                <Stack spacing={2} maxWidth={400}>
                    {[
                        { label: "Уровень", key: "level", options: levels },
                        { label: "Статус", key: "status", options: statuses },
                        { label: "Категория", key: "category", options: categories },
                    ].map((f) => (
                        <FormControl key={f.key}>
                            <Typography>{f.label}</Typography>
                            <Select
                                value={form[f.key]}
                                onChange={(e) =>
                                    setForm({ ...form, [f.key]: e.target.value })
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
                        value={form.ageGroup}
                        onChange={(e) =>
                            setForm({ ...form, ageGroup: e.target.value })
                        }
                    />
                </Stack>
            </Paper>

            {/* TRANSLATIONS */}
            <Typography variant="h5">Переводы</Typography>
            {form.translations.map((t) => (
                <Paper key={t.language} sx={{ p: 2, mt: 2 }}>
                    <Typography fontWeight="bold">{t.language}</Typography>

                    <TextField
                        fullWidth
                        label="Title"
                        sx={{ mt: 1 }}
                        value={t.title}
                        onChange={(e) =>
                            updateTranslation(t.language, "title", e.target.value)
                        }
                    />

                    <TextField
                        fullWidth
                        multiline
                        label="Description"
                        sx={{ mt: 2 }}
                        value={t.description}
                        onChange={(e) =>
                            updateTranslation(
                                t.language,
                                "description",
                                e.target.value
                            )
                        }
                    />
                </Paper>
            ))}

            <Divider sx={{ my: 4 }} />

            {/* BLOCKS */}
            <Typography variant="h5">Blocks</Typography>

            {form.blocks.map((block, idx) => {
                const item = block.items[0];

                return (
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
                                    disabled={idx === form.blocks.length - 1}
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

                        {item.translations.map((tr) => (
                            <TextField
                                key={tr.language}
                                fullWidth
                                multiline={item.itemType === "PARAGRAPH"}
                                label={`${tr.language}`}
                                sx={{ mt: 2 }}
                                value={
                                    item.itemType === "PARAGRAPH"
                                        ? tr.content
                                        : tr.mediaUrl
                                }
                                onChange={(e) =>
                                    updateItem(
                                        block.id,
                                        item.itemType,
                                        tr.language,
                                        e.target.value
                                    )
                                }
                            />
                        ))}
                    </Paper>
                );
            })}

            {/* ADD BLOCK */}
            <Box sx={{ mt: 3 }}>
                <Button startIcon={<AddIcon />} onClick={() => setAddBlockOpen(true)}>
                    Добавить блок
                </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* ACTIONS */}
            <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={handleSubmit}>
                    {mode === "create" ? "Создать" : "Сохранить"}
                </Button>
                <Button variant="outlined" onClick={onCancel}>
                    Отмена
                </Button>
            </Stack>

            {/* ADD BLOCK DIALOG */}
            <Dialog open={addBlockOpen} onClose={() => setAddBlockOpen(false)}>
                <DialogTitle>Добавить блок</DialogTitle>
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
                    <Button onClick={() => setAddBlockOpen(false)}>Отмена</Button>
                    <Button onClick={handleAddBlock} disabled={!newBlockType}>
                        Добавить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
