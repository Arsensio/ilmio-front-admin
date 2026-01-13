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

import { getLessonById, updateLesson, getDictionary } from "@/api/lessons";

export default function LessonDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ✅ dictionaries: [{code,label}]
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

    /* ================= ORDER HELPERS ================= */

    const recalcBlockOrder = (blocks) =>
        blocks.map((b, i) => ({
            ...b,
            orderIndex: i + 1,
            items: Array.isArray(b.items) ? recalcItemOrder(b.items) : [],
        }));

    const recalcItemOrder = (items) =>
        items.map((it, i) => ({
            ...it,
            orderIndex: i + 1,
        }));

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        const load = async () => {
            try {
                const [
                    lessonRes,
                    lvl,
                    st,
                    cat,
                    age,
                    lang,
                    blocks,
                ] = await Promise.all([
                    getLessonById(id),
                    getDictionary("LEVEL"),
                    getDictionary("STATUS"),
                    getDictionary("CATEGORY"),
                    getDictionary("AGE_GROUP"),
                    getDictionary("LANGUAGE"),
                    getDictionary("BLOCK_TYPE"),
                ]);

                const lesson = lessonRes.data;

                // ✅ на всякий случай приводим orderIndex если его нет
                const normalizedBlocks = recalcBlockOrder(Array.isArray(lesson.blocks) ? lesson.blocks : []);

                setForm({
                    ...lesson,
                    blocks: normalizedBlocks,
                });

                setLevels(Array.isArray(lvl.data) ? lvl.data : []);
                setStatuses(Array.isArray(st.data) ? st.data : []);
                setCategories(Array.isArray(cat.data) ? cat.data : []);
                setAgeGroups(Array.isArray(age.data) ? age.data : []);
                setLangs(Array.isArray(lang.data) ? lang.data : []);
                setBlockTypes(Array.isArray(blocks.data) ? blocks.data : []);
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки урока");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    /* ================= BLOCK ACTIONS ================= */

    const moveBlock = (from, to) => {
        if (!form) return;
        if (to < 0 || to >= form.blocks.length) return;

        const blocks = [...form.blocks];
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);

        setForm({ ...form, blocks: recalcBlockOrder(blocks) });
    };

    const deleteBlock = (blockId) => {
        if (!form) return;

        const blocks = form.blocks.filter((b) => b.id !== blockId);
        setForm({ ...form, blocks: recalcBlockOrder(blocks) });
    };

    const addBlock = () => {
        if (!form) return;
        if (!newBlockType) return;

        const blocks = [
            ...form.blocks,
            {
                id: Date.now(),
                type: newBlockType, // code
                orderIndex: (form.blocks?.length || 0) + 1,
                items: [],
            },
        ];

        setForm({ ...form, blocks: recalcBlockOrder(blocks) });
        setNewBlockType("");
        setAddBlockDialog(false);
    };

    const addItem = () => {
        if (!form) return;
        if (!selectedBlockId || !newItemType) return;

        const blocks = form.blocks.map((b) => {
            if (b.id !== selectedBlockId) return b;

            const newItem =
                newItemType === "TEXT"
                    ? {
                        id: Date.now(),
                        itemType: "TEXT",
                        content: "",
                    }
                    : {
                        id: Date.now(),
                        itemType: newItemType,
                        mediaUrl: "",
                    };

            return {
                ...b,
                items: recalcItemOrder([...(b.items || []), newItem]),
            };
        });

        setForm({ ...form, blocks: recalcBlockOrder(blocks) });
        setNewItemType("");
        setSelectedBlockId(null);
        setAddItemDialog(false);
    };

    const updateItem = (blockId, itemId, field, value) => {
        if (!form) return;

        const blocks = form.blocks.map((b) =>
            b.id !== blockId
                ? b
                : {
                    ...b,
                    items: (b.items || []).map((it) =>
                        it.id !== itemId ? it : { ...it, [field]: value }
                    ),
                }
        );

        setForm({ ...form, blocks });
    };

    const deleteItem = (blockId, itemId) => {
        if (!form) return;

        const blocks = form.blocks.map((b) =>
            b.id !== blockId
                ? b
                : {
                    ...b,
                    items: recalcItemOrder((b.items || []).filter((it) => it.id !== itemId)),
                }
        );

        setForm({ ...form, blocks: recalcBlockOrder(blocks) });
    };

    /* ================= SAVE ================= */

    const buildPayload = () => ({
        ...form,
        blocks: (form.blocks || []).map((b, blockIndex) => ({
            ...b,
            orderIndex: blockIndex + 1,
            items: (b.items || []).map((it, itemIndex) => ({
                ...it,
                orderIndex: itemIndex + 1,
            })),
        })),
    });

    const handleSave = async () => {
        try {
            await updateLesson(id, buildPayload());
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            setError("Ошибка сохранения");
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!form) return null;

    /* ================= UI ================= */

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
                    label="Название"
                    value={form.title || ""}
                    disabled={!isEditing}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <TextField
                    label="Описание"
                    multiline
                    minRows={3}
                    value={form.description || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                />
            </Stack>

            {/* META */}
            <Stack spacing={2} sx={{ maxWidth: 400, mt: 4 }}>
                {/* LEVEL */}
                <FormControl fullWidth>
                    <Typography fontWeight="bold">Уровень</Typography>
                    {isEditing ? (
                        <Select
                            value={form.level || ""}
                            displayEmpty
                            onChange={(e) =>
                                setForm({ ...form, level: e.target.value })
                            }
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
                <FormControl fullWidth>
                    <Typography fontWeight="bold">Статус</Typography>
                    {isEditing ? (
                        <Select
                            value={form.status || ""}
                            displayEmpty
                            onChange={(e) =>
                                setForm({ ...form, status: e.target.value })
                            }
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
                <FormControl fullWidth>
                    <Typography fontWeight="bold">Категория</Typography>
                    {isEditing ? (
                        <Select
                            value={form.category || ""}
                            displayEmpty
                            onChange={(e) =>
                                setForm({ ...form, category: e.target.value })
                            }
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
                <FormControl fullWidth>
                    <Typography fontWeight="bold">Возраст</Typography>
                    {isEditing ? (
                        <Select
                            value={form.ageGroup || ""}
                            displayEmpty
                            onChange={(e) =>
                                setForm({ ...form, ageGroup: e.target.value })
                            }
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
                <FormControl fullWidth>
                    <Typography fontWeight="bold">Язык</Typography>
                    {isEditing ? (
                        <Select
                            value={form.lang || ""}
                            displayEmpty
                            onChange={(e) =>
                                setForm({ ...form, lang: e.target.value })
                            }
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
                                <IconButton
                                    color="error"
                                    onClick={() => deleteBlock(block.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        )}
                    </Box>

                    {/* ITEMS */}
                    {(block.items || []).map((item, itemIdx) =>
                        item.itemType === "TEXT" ? (
                            <TextField
                                key={item.id}
                                fullWidth
                                multiline
                                sx={{ mt: 1 }}
                                disabled={!isEditing}
                                value={item.content || ""}
                                onChange={(e) =>
                                    updateItem(block.id, item.id, "content", e.target.value)
                                }
                                helperText={`orderIndex: ${item.orderIndex ?? itemIdx + 1}`}
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
                        ) : isEditing ? (
                            <TextField
                                key={item.id}
                                fullWidth
                                sx={{ mt: 1 }}
                                value={item.mediaUrl || ""}
                                onChange={(e) =>
                                    updateItem(block.id, item.id, "mediaUrl", e.target.value)
                                }
                                helperText={`orderIndex: ${item.orderIndex ?? itemIdx + 1}`}
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
                        ) : (
                            <Box key={item.id} sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                    orderIndex: {item.orderIndex ?? itemIdx + 1}
                                </Typography>
                                <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer">
                                    {item.mediaUrl}
                                </a>
                            </Box>
                        )
                    )}

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

                            {/* ✅ blockTypes = [{code,label}] */}
                            {blockTypes.map((t) => (
                                <MenuItem key={t.code} value={t.code}>
                                    {t.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={addBlock} disabled={!newBlockType} variant="contained">
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
