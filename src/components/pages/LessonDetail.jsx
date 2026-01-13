import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
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
import UploadIcon from "@mui/icons-material/Upload";

import { getLessonById, updateLesson, getDictionary } from "@/api/lessons";
import { uploadImage, buildImagePreviewUrl, extractObjectKey } from "@/api/images";

const isHttpUrl = (v) =>
    typeof v === "string" && (v.startsWith("http://") || v.startsWith("https://"));

export default function LessonDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // dictionaries: [{code,label}]
    const [levels, setLevels] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ageGroups, setAgeGroups] = useState([]);
    const [langs, setLangs] = useState([]);
    const [blockTypes, setBlockTypes] = useState([]);

    // dialogs
    const [addBlockDialog, setAddBlockDialog] = useState(false);
    const [addItemDialog, setAddItemDialog] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [newBlockType, setNewBlockType] = useState("");
    const [newItemType, setNewItemType] = useState("");

    /* ================= HELPERS ================= */

    const recalcItemOrder = (items) =>
        (items ?? []).map((it, i) => ({ ...it, orderIndex: i + 1 }));

    const recalcBlockOrder = (blocks) =>
        (blocks ?? []).map((b, i) => ({
            ...b,
            orderIndex: i + 1,
            items: recalcItemOrder(b.items ?? []),
        }));

    const patchItem = (blockId, itemId, patch) => {
        setForm((prev) => {
            if (!prev) return prev;

            return {
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
            };
        });
    };

    const deleteItem = (blockId, itemId) => {
        setForm((prev) => {
            if (!prev) return prev;

            const blocks = (prev.blocks ?? []).map((b) => {
                if (b.id !== blockId) return b;
                const items = (b.items ?? []).filter((it) => it.id !== itemId);
                return { ...b, items: recalcItemOrder(items) };
            });

            return { ...prev, blocks: recalcBlockOrder(blocks) };
        });
    };

    /* ================= LOAD ================= */

    useEffect(() => {
        const load = async () => {
            try {
                const [lessonRes, lvl, st, cat, age, lang, blocks] = await Promise.all([
                    getLessonById(id),
                    getDictionary("LEVEL"),
                    getDictionary("STATUS"),
                    getDictionary("CATEGORY"),
                    getDictionary("AGE_GROUP"),
                    getDictionary("LANGUAGE"),
                    getDictionary("BLOCK_TYPE"),
                ]);

                const lesson = lessonRes.data;

                const normalizedBlocks = recalcBlockOrder(
                    Array.isArray(lesson.blocks) ? lesson.blocks : []
                ).map((b) => ({
                    ...b,
                    items: (b.items ?? []).map((it) => {
                        if (it.itemType !== "IMAGE") return it;

                        // backend присылает ссылку в mediaUrl -> preview = mediaUrl
                        return {
                            ...it,
                            previewUrl: it.mediaUrl,
                            file: null,
                            uploading: false,
                        };
                    }),
                }));

                setForm({ ...lesson, blocks: normalizedBlocks });

                setLevels(lvl.data ?? []);
                setStatuses(st.data ?? []);
                setCategories(cat.data ?? []);
                setAgeGroups(age.data ?? []);
                setLangs(lang.data ?? []);
                setBlockTypes(blocks.data ?? []);
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки урока");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    /* ================= BLOCKS ================= */

    const moveBlock = (from, to) => {
        setForm((prev) => {
            if (!prev) return prev;
            if (to < 0 || to >= (prev.blocks ?? []).length) return prev;

            const blocks = [...(prev.blocks ?? [])];
            const [moved] = blocks.splice(from, 1);
            blocks.splice(to, 0, moved);

            return { ...prev, blocks: recalcBlockOrder(blocks) };
        });
    };

    const deleteBlock = (blockId) => {
        setForm((prev) => {
            if (!prev) return prev;
            const blocks = (prev.blocks ?? []).filter((b) => b.id !== blockId);
            return { ...prev, blocks: recalcBlockOrder(blocks) };
        });
    };

    const addBlock = () => {
        if (!newBlockType) return;

        setForm((prev) => {
            if (!prev) return prev;
            const blocks = recalcBlockOrder([
                ...(prev.blocks ?? []),
                { id: Date.now(), type: newBlockType, items: [] },
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
            if (!prev) return prev;

            const blocks = (prev.blocks ?? []).map((b) => {
                if (b.id !== selectedBlockId) return b;

                const newItem =
                    newItemType === "TEXT"
                        ? { id: Date.now(), itemType: "TEXT", content: "" }
                        : newItemType === "IMAGE"
                            ? {
                                id: Date.now(),
                                itemType: "IMAGE",
                                mediaUrl: "",
                                previewUrl: "",
                                file: null,
                                uploading: false,
                            }
                            : { id: Date.now(), itemType: "VIDEO", mediaUrl: "" };

                return { ...b, items: recalcItemOrder([...(b.items ?? []), newItem]) };
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
        patchItem(blockId, itemId, {
            file,
            previewUrl: localPreview,
            mediaUrl: "", // objectKey сбросим
        });
    };

    const uploadImageForItem = async (blockId, itemId) => {
        setError("");

        // достаем item из актуального state
        const block = form?.blocks?.find((b) => b.id === blockId);
        const item = block?.items?.find((it) => it.id === itemId);

        if (!item?.file) {
            setError("Сначала выберите файл");
            return;
        }

        patchItem(blockId, itemId, { uploading: true });

        try {
            const data = await uploadImage(item.file); // {objectKey,url}

            patchItem(blockId, itemId, {
                mediaUrl: data.objectKey, // ✅ objectKey
                previewUrl: buildImagePreviewUrl(data.url),
                file: null,
            });
        } catch (e) {
            console.error(e);
            setError("Ошибка загрузки картинки");
        } finally {
            patchItem(blockId, itemId, { uploading: false });
        }
    };

    /* ================= SAVE ================= */

    const buildPayload = () => ({
        id: form.id,

        // ✅ META обязательно отправляем явно
        ageGroup: form.ageGroup,
        level: form.level,
        status: form.status,
        category: form.category,
        lang: form.lang, // ✅ ВОТ ЭТОГО НЕ ХВАТАЛО / ЯВНО ОТПРАВЛЯЕМ

        title: form.title,
        description: form.description,
        orderIndex: form.orderIndex,

        blocks: (form.blocks ?? []).map((b, bIndex) => ({
            id: b.id,
            type: b.type,
            orderIndex: bIndex + 1,

            items: (b.items ?? []).map((it, iIndex) => {
                if (it.itemType === "IMAGE") {
                    return {
                        id: it.id,
                        itemType: it.itemType,
                        orderIndex: iIndex + 1,
                        mediaUrl: extractObjectKey(it.mediaUrl),
                    };
                }

                if (it.itemType === "TEXT") {
                    return {
                        id: it.id,
                        itemType: it.itemType,
                        orderIndex: iIndex + 1,
                        content: it.content,
                    };
                }

                // VIDEO
                return {
                    id: it.id,
                    itemType: it.itemType,
                    orderIndex: iIndex + 1,
                    mediaUrl: it.mediaUrl,
                };
            }),
        })),
    });


    const handleSave = async () => {
        setError("");

        // обязательные поля
        if (
            !form.title ||
            !form.description ||
            !form.level ||
            !form.status ||
            !form.category ||
            !form.ageGroup ||
            !form.lang
        ) {
            setError("Заполните все обязательные поля");
            return;
        }

        // нельзя сохранить если IMAGE без objectKey
        for (const block of form.blocks ?? []) {
            for (const item of block.items ?? []) {
                if (item.itemType === "IMAGE") {
                    const objectKey = extractObjectKey(item.mediaUrl);
                    if (!objectKey) {
                        setError("Загрузите все картинки перед сохранением");
                        return;
                    }
                }
            }
        }

        try {
            await updateLesson(id, buildPayload());
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            setError("Ошибка сохранения");
        }
    };

    /* ================= RENDER ================= */

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!form) return null;

    return (
        <Box sx={{ p: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Button onClick={() => navigate(-1)}>Назад</Button>
                <Button
                    variant="contained"
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                >
                    {isEditing ? "Сохранить" : "Редактировать"}
                </Button>
            </Box>

            <Typography variant="h4">Урок #{form.id}</Typography>

            {/* TITLE / DESCRIPTION */}
            <Stack spacing={2} sx={{ maxWidth: 600, mt: 3 }}>
                <TextField
                    required
                    label="Название"
                    placeholder="Например: Терпение (Сабр)"
                    value={form.title || ""}
                    disabled={!isEditing}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <TextField
                    required
                    label="Описание"
                    placeholder="Коротко опишите цель урока"
                    multiline
                    minRows={3}
                    value={form.description || ""}
                    disabled={!isEditing}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
            </Stack>

            {/* ✅ META (обязательные поля) */}
            <Stack spacing={2} sx={{ maxWidth: 400, mt: 4 }}>
                {/* LEVEL */}
                <FormControl fullWidth required>
                    <Typography fontWeight="bold">Уровень *</Typography>
                    {isEditing ? (
                        <Select
                            value={form.level || ""}
                            displayEmpty
                            onChange={(e) => setForm({ ...form, level: e.target.value })}
                        >
                            <MenuItem value="">
                                <em>Выберите</em>
                            </MenuItem>
                            {levels.map((o) => (
                                <MenuItem key={o.code} value={o.code}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </Select>
                    ) : (
                        <Typography>{form.level}</Typography>
                    )}
                </FormControl>

                {/* STATUS */}
                <FormControl fullWidth required>
                    <Typography fontWeight="bold">Статус *</Typography>
                    {isEditing ? (
                        <Select
                            value={form.status || ""}
                            displayEmpty
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                            <MenuItem value="">
                                <em>Выберите</em>
                            </MenuItem>
                            {statuses.map((o) => (
                                <MenuItem key={o.code} value={o.code}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </Select>
                    ) : (
                        <Typography>{form.status}</Typography>
                    )}
                </FormControl>

                {/* CATEGORY */}
                <FormControl fullWidth required>
                    <Typography fontWeight="bold">Категория *</Typography>
                    {isEditing ? (
                        <Select
                            value={form.category || ""}
                            displayEmpty
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                            <MenuItem value="">
                                <em>Выберите</em>
                            </MenuItem>
                            {categories.map((o) => (
                                <MenuItem key={o.code} value={o.code}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </Select>
                    ) : (
                        <Typography>{form.category}</Typography>
                    )}
                </FormControl>

                {/* AGE GROUP */}
                <FormControl fullWidth required>
                    <Typography fontWeight="bold">Возраст *</Typography>
                    {isEditing ? (
                        <Select
                            value={form.ageGroup || ""}
                            displayEmpty
                            onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
                        >
                            <MenuItem value="">
                                <em>Выберите</em>
                            </MenuItem>
                            {ageGroups.map((o) => (
                                <MenuItem key={o.code} value={o.code}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </Select>
                    ) : (
                        <Typography>{form.ageGroup}</Typography>
                    )}
                </FormControl>

                {/* LANGUAGE */}
                <FormControl fullWidth required>
                    <Typography fontWeight="bold">Язык *</Typography>
                    {isEditing ? (
                        <Select
                            value={form.lang || ""}
                            displayEmpty
                            onChange={(e) => setForm({ ...form, lang: e.target.value })}
                        >
                            <MenuItem value="">
                                <em>Выберите</em>
                            </MenuItem>
                            {langs.map((o) => (
                                <MenuItem key={o.code} value={o.code}>
                                    {o.label}
                                </MenuItem>
                            ))}
                        </Select>
                    ) : (
                        <Typography>{form.lang}</Typography>
                    )}
                </FormControl>
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* BLOCKS */}
            <Typography variant="h5">Blocks</Typography>

            {(form.blocks || []).map((block, idx) => (
                <Paper key={block.id} sx={{ p: 2, mt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>
                            {block.type} (orderIndex: {block.orderIndex ?? idx + 1})
                        </Typography>

                        {isEditing && (
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
                        )}
                    </Box>

                    {(block.items || []).map((item, itemIdx) => {
                        // TEXT
                        if (item.itemType === "TEXT") {
                            return (
                                <TextField
                                    key={item.id}
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    sx={{ mt: 1 }}
                                    disabled={!isEditing}
                                    value={item.content || ""}
                                    placeholder="Введите текст…"
                                    helperText={`orderIndex: ${item.orderIndex ?? itemIdx + 1}`}
                                    onChange={(e) =>
                                        patchItem(block.id, item.id, { content: e.target.value })
                                    }
                                    InputProps={{
                                        endAdornment: isEditing && (
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
                        }

                        // IMAGE
                        if (item.itemType === "IMAGE") {
                            const preview =
                                item.previewUrl || (isHttpUrl(item.mediaUrl) ? item.mediaUrl : "");

                            return (
                                <Box key={item.id} sx={{ mt: 2 }}>
                                    <Typography fontWeight="bold" sx={{ mb: 1 }}>
                                        IMAGE (orderIndex: {item.orderIndex ?? itemIdx + 1})
                                    </Typography>

                                    {preview && (
                                        <Box sx={{ mb: 1 }}>
                                            <img
                                                src={preview}
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

                                    {isEditing ? (
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
                                                onClick={() => uploadImageForItem(block.id, item.id)}
                                            >
                                                {item.uploading ? "Загрузка..." : "Загрузить"}
                                            </Button>

                                            <IconButton
                                                color="error"
                                                onClick={() => deleteItem(block.id, item.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    ) : (
                                        item.mediaUrl && (
                                            <Box sx={{ mt: 1 }}>
                                                <a href={item.mediaUrl} target="_blank" rel="noreferrer">
                                                    Открыть изображение
                                                </a>
                                            </Box>
                                        )
                                    )}

                                    {item.mediaUrl && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            objectKey: <b>{extractObjectKey(item.mediaUrl)}</b>
                                        </Typography>
                                    )}
                                </Box>
                            );
                        }

                        // VIDEO
                        return (
                            <TextField
                                key={item.id}
                                fullWidth
                                sx={{ mt: 1 }}
                                disabled={!isEditing}
                                value={item.mediaUrl || ""}
                                placeholder="Вставьте ссылку на видео…"
                                helperText={`orderIndex: ${
                                    item.orderIndex ?? itemIdx + 1
                                } • Пример: https://youtube.com/watch?v=xxxx`}
                                onChange={(e) =>
                                    patchItem(block.id, item.id, { mediaUrl: e.target.value })
                                }
                                InputProps={{
                                    endAdornment: isEditing && (
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

                    {isEditing && (
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
                    )}
                </Paper>
            ))}

            {/* ADD BLOCK */}
            {isEditing && (
                <Button
                    startIcon={<AddIcon />}
                    sx={{ mt: 3 }}
                    onClick={() => setAddBlockDialog(true)}
                >
                    Добавить блок
                </Button>
            )}

            {/* ADD BLOCK DIALOG */}
            <Dialog open={addBlockDialog} onClose={() => setAddBlockDialog(false)}>
                <DialogTitle>Тип блока</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth>
                        <Select
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
                    </FormControl>
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

            {/* ADD ITEM DIALOG */}
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
