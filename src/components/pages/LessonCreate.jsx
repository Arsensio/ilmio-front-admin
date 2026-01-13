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
    CircularProgress,
} from "@mui/material";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";

import { createLesson, getFilterData } from "@/api/lessons";
import { uploadImage, buildImagePreviewUrl } from "@/api/images"; // ✅

export default function LessonCreate() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        ageGroup: "",
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
        if (itemType === "VIDEO") return "Вставьте ссылку на видео…";
        return "";
    };

    const getItemExample = (itemType) => {
        if (itemType === "VIDEO") return "Пример: https://youtube.com/watch?v=xxxx";
        return "";
    };

    /* ================= LOAD FILTER DATA ================= */

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

    /* ================= ORDER HELPERS ================= */

    const recalcItemOrder = (items) =>
        (items ?? []).map((it, i) => ({ ...it, orderIndex: i + 1 }));

    const recalcBlockOrder = (blocks) =>
        (blocks ?? []).map((b, i) => ({
            ...b,
            orderIndex: i + 1,
            items: recalcItemOrder(b.items ?? []),
        }));

    /* ================= ITEM / BLOCK UPDATE HELPERS ================= */

    // ✅ ВАЖНО: только functional setForm(prev => ...)
    const updateItem = (blockId, itemId, patch) => {
        setForm((prev) => ({
            ...prev,
            blocks: (prev.blocks ?? []).map((b) =>
                b.id !== blockId
                    ? b
                    : {
                        ...b,
                        items: (b.items ?? []).map((it) =>
                            it.id !== itemId ? it : { ...it, ...patch }
                        ),
                    }
            ),
        }));
    };

    const deleteItem = (blockId, itemId) => {
        setForm((prev) => {
            const blocks = (prev.blocks ?? []).map((b) => {
                if (b.id !== blockId) return b;
                const items = (b.items ?? []).filter((it) => it.id !== itemId);
                return { ...b, items: recalcItemOrder(items) };
            });

            return { ...prev, blocks: recalcBlockOrder(blocks) };
        });
    };

    /* ================= BLOCK ACTIONS ================= */

    const moveBlock = (from, to) => {
        setForm((prev) => {
            if (to < 0 || to >= (prev.blocks ?? []).length) return prev;

            const blocks = [...(prev.blocks ?? [])];
            const [moved] = blocks.splice(from, 1);
            blocks.splice(to, 0, moved);

            return { ...prev, blocks: recalcBlockOrder(blocks) };
        });
    };

    const deleteBlock = (blockId) => {
        setForm((prev) => {
            const blocks = (prev.blocks ?? []).filter((b) => b.id !== blockId);
            return { ...prev, blocks: recalcBlockOrder(blocks) };
        });
    };

    const addBlock = () => {
        if (!newBlockType) return;

        setForm((prev) => {
            const blocks = recalcBlockOrder([
                ...(prev.blocks ?? []),
                {
                    id: Date.now(),
                    type: newBlockType,
                    items: [],
                },
            ]);
            return { ...prev, blocks };
        });

        setNewBlockType("");
        setAddBlockDialog(false);
    };

    /* ================= ITEMS ================= */

    const addItem = () => {
        if (!selectedBlockId || !newItemType) return;

        setForm((prev) => {
            const blocks = (prev.blocks ?? []).map((b) => {
                if (b.id !== selectedBlockId) return b;

                const newItem =
                    newItemType === "TEXT"
                        ? {
                            id: Date.now(),
                            itemType: "TEXT",
                            content: "",
                        }
                        : newItemType === "IMAGE"
                            ? {
                                id: Date.now(),
                                itemType: "IMAGE",
                                mediaUrl: "", // ✅ objectKey после upload
                                previewUrl: "",
                                file: null,
                                uploading: false,
                            }
                            : {
                                id: Date.now(),
                                itemType: "VIDEO",
                                mediaUrl: "",
                            };

                return {
                    ...b,
                    items: recalcItemOrder([...(b.items ?? []), newItem]),
                };
            });

            return { ...prev, blocks: recalcBlockOrder(blocks) };
        });

        setNewItemType("");
        setSelectedBlockId(null);
        setAddItemDialog(false);
    };

    /* ================= IMAGE UPLOAD ================= */

    const onSelectImageFile = (blockId, itemId, file) => {
        if (!file) return;

        const allowed = ["image/png", "image/jpeg"];
        if (!allowed.includes(file.type)) {
            setError("Можно загрузить только PNG или JPEG");
            return;
        }

        setError("");

        const localPreview = URL.createObjectURL(file);

        updateItem(blockId, itemId, {
            file,
            previewUrl: localPreview,
            mediaUrl: "", // objectKey очищаем
        });
    };

    const uploadImageForItem = async (blockId, itemId) => {
        setError("");

        // ✅ достаем item из актуального state
        const block = form?.blocks?.find((b) => b.id === blockId);
        const item = block?.items?.find((it) => it.id === itemId);

        if (!item?.file) {
            setError("Сначала выберите файл");
            return;
        }

        updateItem(blockId, itemId, { uploading: true });

        try {
            const data = await uploadImage(item.file); // ✅ {objectKey,url}

            updateItem(blockId, itemId, {
                mediaUrl: data.objectKey, // ✅ objectKey уйдёт в бек
                previewUrl: buildImagePreviewUrl(data.url), // ✅ абсолютный preview url
                file: null,
            });
        } catch (e) {
            console.error(e);
            setError("Ошибка загрузки картинки");
        } finally {
            updateItem(blockId, itemId, { uploading: false });
        }
    };

    /* ================= BUILD PAYLOAD ================= */

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
                    : { mediaUrl: item.mediaUrl }), // ✅ IMAGE: objectKey, VIDEO: ссылка
            })),
        })),
    });

    /* ================= SAVE ================= */

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

        // ✅ IMAGE нельзя сохранить если objectKey пустой
        for (const block of form.blocks ?? []) {
            for (const item of block.items ?? []) {
                if (item.itemType === "IMAGE" && !item.mediaUrl) {
                    setError("Загрузите все картинки перед сохранением урока");
                    return;
                }
            }
        }

        try {
            await createLesson(buildPayload());
            navigate("/lessons");
        } catch (e) {
            console.error(e);
            setError("Ошибка при создании урока");
        }
    };

    /* ================= UI ================= */

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
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                />

                {/* AGE GROUP */}
                <FormControl fullWidth required>
                    <Typography fontWeight="bold">Возраст *</Typography>
                    <Select
                        value={form.ageGroup}
                        displayEmpty
                        onChange={(e) =>
                            setForm({ ...form, ageGroup: e.target.value })
                        }
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
                        onChange={(e) =>
                            setForm({ ...form, lang: e.target.value })
                        }
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
                            onChange={(e) =>
                                setForm({ ...form, [key]: e.target.value })
                            }
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
                            <IconButton
                                color="error"
                                onClick={() => deleteBlock(block.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {(block.items ?? []).map((item, itemIdx) => {
                        // TEXT
                        if (item.itemType === "TEXT") {
                            return (
                                <TextField
                                    key={item.id}
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    sx={{ mt: 1 }}
                                    value={item.content || ""}
                                    placeholder="Введите текст…"
                                    helperText={`orderIndex: ${item.orderIndex ?? itemIdx + 1}`}
                                    onChange={(e) =>
                                        updateItem(block.id, item.id, {
                                            content: e.target.value,
                                        })
                                    }
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    color="error"
                                                    onClick={() =>
                                                        deleteItem(block.id, item.id)
                                                    }
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            );
                        }

                        // IMAGE
                        if (item.itemType === "IMAGE") {
                            return (
                                <Box key={item.id} sx={{ mt: 2 }}>
                                    <Typography fontWeight="bold" sx={{ mb: 1 }}>
                                        IMAGE (orderIndex: {item.orderIndex ?? itemIdx + 1})
                                    </Typography>

                                    {item.previewUrl && (
                                        <Box sx={{ mb: 1 }}>
                                            <img
                                                src={item.previewUrl}
                                                alt="preview"
                                                style={{
                                                    width: 220,
                                                    height: "auto",
                                                    borderRadius: 8,
                                                    border: "1px solid rgba(0,0,0,0.12)",
                                                }}
                                            />
                                        </Box>
                                    )}

                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Button variant="outlined" component="label">
                                            Выбрать файл (PNG/JPEG)
                                            <input
                                                hidden
                                                type="file"
                                                accept="image/png,image/jpeg"
                                                onChange={(e) =>
                                                    onSelectImageFile(
                                                        block.id,
                                                        item.id,
                                                        e.target.files?.[0]
                                                    )
                                                }
                                            />
                                        </Button>

                                        <Button
                                            variant="contained"
                                            startIcon={<UploadIcon />}
                                            disabled={!item.file || item.uploading}
                                            onClick={() =>
                                                uploadImageForItem(block.id, item.id)
                                            }
                                        >
                                            {item.uploading ? (
                                                <>
                                                    <CircularProgress size={16} sx={{ mr: 1 }} />
                                                    Загрузка...
                                                </>
                                            ) : (
                                                "Загрузить"
                                            )}
                                        </Button>

                                        <IconButton
                                            color="error"
                                            onClick={() => deleteItem(block.id, item.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>

                                    {item.mediaUrl && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            ✅ objectKey: <b>{item.mediaUrl}</b>
                                        </Typography>
                                    )}
                                </Box>
                            );
                        }

                        // VIDEO
                        const placeholder = getItemPlaceholder(item.itemType);
                        const example = getItemExample(item.itemType);

                        return (
                            <TextField
                                key={item.id}
                                fullWidth
                                sx={{ mt: 1 }}
                                value={item.mediaUrl || ""}
                                placeholder={placeholder}
                                onChange={(e) =>
                                    updateItem(block.id, item.id, { mediaUrl: e.target.value })
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

            <Button
                startIcon={<AddIcon />}
                sx={{ mt: 3 }}
                onClick={() => setAddBlockDialog(true)}
            >
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
                    <Button
                        onClick={addBlock}
                        disabled={!newBlockType}
                        variant="contained"
                    >
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
                    <Button
                        onClick={addItem}
                        disabled={!newItemType}
                        variant="contained"
                    >
                        Добавить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
