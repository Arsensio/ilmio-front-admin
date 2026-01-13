import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Alert,
    Paper,
    Divider,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    InputAdornment,
} from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { createLesson, getFilterData } from "@/api/lessons";

export default function LessonCreate() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        ageGroup: "", // ✅ code
        level: "",
        status: "",
        category: "",
        lang: "",
        title: "",
        description: "",
        blocks: [],
    });

    const [error, setError] = useState("");

    const [ageGroups, setAgeGroups] = useState([]);
    const [levels, setLevels] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [langs, setLangs] = useState([]);
    const [blockTypes, setBlockTypes] = useState([]);

    const [addBlockDialog, setAddBlockDialog] = useState(false);
    const [addItemDialog, setAddItemDialog] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [newBlockType, setNewBlockType] = useState("");
    const [newItemType, setNewItemType] = useState("");

    /* ================= PLACEHOLDER HELPERS ================= */

    const getItemPlaceholder = (itemType) => {
        if (itemType === "TEXT") return "Введите текст…";
        if (itemType === "IMAGE") return "Вставьте ссылку на картинку…";
        if (itemType === "VIDEO") return "Вставьте ссылку на видео…";
        return "";
    };

    const getItemExample = (itemType) => {
        if (itemType === "IMAGE") return "Пример: https://example.com/image.png";
        if (itemType === "VIDEO") return "Пример: https://youtube.com/watch?v=xxxx";
        return "";
    };

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getFilterData();
                setAgeGroups(data.ageGroups ?? []);
                setLevels(data.levels ?? []);
                setStatuses(data.statuses ?? []);
                setCategories(data.categories ?? []);
                setLangs(data.langs ?? []);
                setBlockTypes(data.blockTypes ?? []);
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки справочников");
            }
        };

        load();
    }, []);

    /* ============ ORDER HELPERS ============ */

    const recalcItemOrder = (items) =>
        items.map((it, i) => ({ ...it, orderIndex: i + 1 }));

    const recalcBlockOrder = (blocks) =>
        blocks.map((b, i) => ({
            ...b,
            orderIndex: i + 1,
            items: Array.isArray(b.items) ? recalcItemOrder(b.items) : [],
        }));

    /* ============ BLOCKS ============ */

    const moveBlock = (from, to) => {
        if (to < 0 || to >= form.blocks.length) return;

        const blocks = [...form.blocks];
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);

        setForm({ ...form, blocks: recalcBlockOrder(blocks) });
    };

    const deleteBlock = (blockId) => {
        const blocks = form.blocks.filter((b) => b.id !== blockId);
        setForm({ ...form, blocks: recalcBlockOrder(blocks) });
    };

    const addBlock = () => {
        if (!newBlockType) return;

        const blocks = recalcBlockOrder([
            ...form.blocks,
            {
                id: Date.now(),
                type: newBlockType,
                orderIndex: form.blocks.length + 1,
                items: [],
            },
        ]);

        setForm({ ...form, blocks });
        setNewBlockType("");
        setAddBlockDialog(false);
    };

    const addItem = () => {
        if (!selectedBlockId || !newItemType) return;

        const blocks = form.blocks.map((b) => {
            if (b.id !== selectedBlockId) return b;

            const newItem =
                newItemType === "TEXT"
                    ? { id: Date.now(), itemType: "TEXT", content: "" }
                    : { id: Date.now(), itemType: newItemType, mediaUrl: "" };

            return {
                ...b,
                items: recalcItemOrder([...(b.items ?? []), newItem]),
            };
        });

        setForm({ ...form, blocks: recalcBlockOrder(blocks) });

        setNewItemType("");
        setSelectedBlockId(null);
        setAddItemDialog(false);
    };

    const updateItem = (blockId, itemId, field, value) => {
        const blocks = form.blocks.map((b) =>
            b.id !== blockId
                ? b
                : {
                    ...b,
                    items: (b.items ?? []).map((it) =>
                        it.id !== itemId ? it : { ...it, [field]: value }
                    ),
                }
        );

        setForm({ ...form, blocks });
    };

    const deleteItem = (blockId, itemId) => {
        const blocks = form.blocks.map((b) =>
            b.id !== blockId
                ? b
                : {
                    ...b,
                    items: recalcItemOrder((b.items ?? []).filter((it) => it.id !== itemId)),
                }
        );

        setForm({ ...form, blocks: recalcBlockOrder(blocks) });
    };

    /* ============ BUILD PAYLOAD ============ */

    const buildPayload = () => ({
        ageGroup: form.ageGroup,
        level: form.level,
        status: form.status,
        category: form.category,
        lang: form.lang,
        title: form.title,
        description: form.description,
        blocks: (form.blocks ?? []).map((block, bIndex) => ({
            type: block.type,
            orderIndex: bIndex + 1,
            items: (block.items ?? []).map((item, iIndex) => ({
                itemType: item.itemType,
                orderIndex: iIndex + 1,
                ...(item.itemType === "TEXT"
                    ? { content: item.content }
                    : { mediaUrl: item.mediaUrl }),
            })),
        })),
    });

    /* ============ SAVE ============ */

    const handleCreate = async () => {
        setError("");

        if (
            !form.title ||
            !form.description ||
            !form.ageGroup ||
            !form.level ||
            !form.status ||
            !form.category ||
            !form.lang
        ) {
            setError("Заполните все обязательные поля");
            return;
        }

        try {
            await createLesson(buildPayload());
            navigate("/lessons");
        } catch (e) {
            console.error(e);
            setError("Ошибка при создании урока");
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Button onClick={() => navigate(-1)}>Назад</Button>
                <Button variant="contained" onClick={handleCreate}>
                    Создать урок
                </Button>
            </Box>

            <Typography variant="h4">Создание урока</Typography>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {/* META */}
            <Stack spacing={2} sx={{ maxWidth: 600, mt: 3 }}>
                <TextField
                    required
                    label="Название"
                    placeholder="Например: Терпение (Сабр)"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <TextField
                    required
                    label="Описание"
                    placeholder="Коротко опишите цель урока"
                    multiline
                    minRows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                {/* AGE GROUP */}
                <FormControl fullWidth required>
                    <Typography fontWeight="bold">Возраст *</Typography>
                    <Select
                        value={form.ageGroup}
                        displayEmpty
                        onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
                    >
                        <MenuItem value="">
                            <em>Выберите возраст</em>
                        </MenuItem>
                        {ageGroups.map((o) => (
                            <MenuItem key={o.code} value={o.code}>
                                {o.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* LANGUAGE */}
                <FormControl fullWidth required>
                    <Typography fontWeight="bold">Язык *</Typography>
                    <Select
                        value={form.lang}
                        displayEmpty
                        onChange={(e) => setForm({ ...form, lang: e.target.value })}
                    >
                        <MenuItem value="">
                            <em>Выберите язык</em>
                        </MenuItem>
                        {langs.map((o) => (
                            <MenuItem key={o.code} value={o.code}>
                                {o.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {[
                    ["level", "Уровень *", levels],
                    ["status", "Статус *", statuses],
                    ["category", "Категория *", categories],
                ].map(([key, label, options]) => (
                    <FormControl key={key} fullWidth required>
                        <Typography fontWeight="bold">{label}</Typography>
                        <Select
                            value={form[key]}
                            displayEmpty
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        >
                            <MenuItem value="">
                                <em>Выберите</em>
                            </MenuItem>
                            {options.map((o) => (
                                <MenuItem key={o.code} value={o.code}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ))}
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* BLOCKS */}
            <Typography variant="h5">Blocks</Typography>

            {form.blocks.map((block, idx) => (
                <Paper key={block.id} sx={{ p: 2, mt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>
                            {block.type} (orderIndex: {block.orderIndex ?? idx + 1})
                        </Typography>
                        <Box>
                            <IconButton onClick={() => moveBlock(idx, idx - 1)}>
                                <ArrowUpwardIcon />
                            </IconButton>
                            <IconButton onClick={() => moveBlock(idx, idx + 1)}>
                                <ArrowDownwardIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => deleteBlock(block.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {(block.items ?? []).map((item, itemIdx) => {
                        const value =
                            item.itemType === "TEXT"
                                ? item.content || ""
                                : item.mediaUrl || "";

                        const placeholder = getItemPlaceholder(item.itemType);
                        const example = getItemExample(item.itemType);

                        return (
                            <TextField
                                key={item.id}
                                fullWidth
                                multiline={item.itemType === "TEXT"}
                                minRows={item.itemType === "TEXT" ? 2 : undefined}
                                sx={{ mt: 1 }}
                                value={value}
                                placeholder={placeholder}
                                onChange={(e) =>
                                    updateItem(
                                        block.id,
                                        item.id,
                                        item.itemType === "TEXT" ? "content" : "mediaUrl",
                                        e.target.value
                                    )
                                }
                                helperText={
                                    example
                                        ? `orderIndex: ${item.orderIndex ?? itemIdx + 1} • ${example}`
                                        : `orderIndex: ${item.orderIndex ?? itemIdx + 1}`
                                }
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                color="error"
                                                onClick={() => deleteItem(block.id, item.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        );
                    })}

                    <Button
                        size="small"
                        startIcon={<AddIcon />}
                        sx={{ mt: 1 }}
                        onClick={() => {
                            setSelectedBlockId(block.id);
                            setAddItemDialog(true);
                        }}
                    >
                        Добавить item
                    </Button>
                </Paper>
            ))}

            <Button startIcon={<AddIcon />} sx={{ mt: 3 }} onClick={() => setAddBlockDialog(true)}>
                Добавить блок
            </Button>

            {/* ADD BLOCK */}
            <Dialog open={addBlockDialog} onClose={() => setAddBlockDialog(false)}>
                <DialogTitle>Тип блока</DialogTitle>
                <DialogContent>
                    <Select
                        fullWidth
                        value={newBlockType}
                        displayEmpty
                        onChange={(e) => setNewBlockType(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>Выберите тип</em>
                        </MenuItem>
                        {blockTypes.map((t) => (
                            <MenuItem key={t.code} value={t.code}>
                                {t.label}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={addBlock} disabled={!newBlockType} variant="contained">
                        Добавить
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ADD ITEM */}
            <Dialog open={addItemDialog} onClose={() => setAddItemDialog(false)}>
                <DialogTitle>Тип элемента</DialogTitle>
                <DialogContent>
                    <Select
                        fullWidth
                        value={newItemType}
                        displayEmpty
                        onChange={(e) => setNewItemType(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>Выберите тип</em>
                        </MenuItem>
                        <MenuItem value="TEXT">TEXT</MenuItem>
                        <MenuItem value="IMAGE">IMAGE</MenuItem>
                        <MenuItem value="VIDEO">VIDEO</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={addItem} disabled={!newItemType} variant="contained">
                        Добавить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
