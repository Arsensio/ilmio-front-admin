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

import {
    getLessonById,
    updateLesson,
    getDictionary,
} from "@/api/lessons";

export default function LessonDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [levels, setLevels] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [blockTypes, setBlockTypes] = useState([]);

    const [addBlockDialog, setAddBlockDialog] = useState(false);
    const [addItemDialog, setAddItemDialog] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [newBlockType, setNewBlockType] = useState("");
    const [newItemType, setNewItemType] = useState("");

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        const load = async () => {
            try {
                const [
                    lessonRes,
                    lvl,
                    st,
                    cat,
                    blocks,
                ] = await Promise.all([
                    getLessonById(id),
                    getDictionary("LEVEL"),
                    getDictionary("STATUS"),
                    getDictionary("CATEGORY"),
                    getDictionary("BLOCK_TYPE"),
                ]);

                setForm(lessonRes.data);
                setLevels(lvl.data);
                setStatuses(st.data);
                setCategories(cat.data);
                setBlockTypes(blocks.data);
            } catch {
                setError("Ошибка загрузки урока");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    /* ================= BLOCK HELPERS ================= */

    const moveBlock = (from, to) => {
        if (to < 0 || to >= form.blocks.length) return;
        const blocks = [...form.blocks];
        const [moved] = blocks.splice(from, 1);
        blocks.splice(to, 0, moved);
        setForm({ ...form, blocks });
    };

    const deleteBlock = (blockId) => {
        setForm({
            ...form,
            blocks: form.blocks.filter(b => b.id !== blockId),
        });
    };

    const addBlock = () => {
        setForm({
            ...form,
            blocks: [
                ...form.blocks,
                {
                    id: Date.now(),
                    type: newBlockType,
                    items: [],
                },
            ],
        });
        setNewBlockType("");
        setAddBlockDialog(false);
    };

    const addItem = () => {
        setForm({
            ...form,
            blocks: form.blocks.map(b =>
                b.id !== selectedBlockId
                    ? b
                    : {
                        ...b,
                        items: [
                            ...b.items,
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
                                },
                        ],
                    }
            ),
        });
        setNewItemType("");
        setSelectedBlockId(null);
        setAddItemDialog(false);
    };

    const updateItem = (blockId, itemId, field, value) => {
        setForm({
            ...form,
            blocks: form.blocks.map(b =>
                b.id !== blockId
                    ? b
                    : {
                        ...b,
                        items: b.items.map(it =>
                            it.id !== itemId ? it : { ...it, [field]: value }
                        ),
                    }
            ),
        });
    };

    const deleteItem = (blockId, itemId) => {
        setForm({
            ...form,
            blocks: form.blocks.map(b =>
                b.id !== blockId
                    ? b
                    : { ...b, items: b.items.filter(it => it.id !== itemId) }
            ),
        });
    };

    /* ================= SAVE ================= */

    const handleSave = async () => {
        try {
            await updateLesson(id, form);
            setIsEditing(false);
        } catch {
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
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
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
                {[
                    ["level", "Уровень", levels],
                    ["status", "Статус", statuses],
                    ["category", "Категория", categories],
                ].map(([key, label, options]) => (
                    <FormControl key={key} fullWidth>
                        <Typography fontWeight="bold">{label}</Typography>
                        {isEditing ? (
                            <Select
                                value={form[key]}
                                onChange={(e) =>
                                    setForm({ ...form, [key]: e.target.value })
                                }
                            >
                                {options.map(o => (
                                    <MenuItem key={o} value={o}>{o}</MenuItem>
                                ))}
                            </Select>
                        ) : (
                            <Typography>{form[key]}</Typography>
                        )}
                    </FormControl>
                ))}

                <TextField
                    label="Возраст"
                    value={form.ageGroup}
                    disabled={!isEditing}
                    onChange={(e) =>
                        setForm({ ...form, ageGroup: e.target.value })
                    }
                />
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* BLOCKS */}
            <Typography variant="h5">Blocks</Typography>

            {form.blocks.map((block, idx) => (
                <Paper key={block.id} sx={{ p: 2, mt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>{block.type}</Typography>

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

                    {/* ITEMS */}
                    {block.items.map(item => (
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
                                InputProps={{
                                    endAdornment: isEditing && (
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
                        ) : (
                            isEditing ? (
                                <TextField
                                    key={item.id}
                                    fullWidth
                                    sx={{ mt: 1 }}
                                    value={item.mediaUrl || ""}
                                    onChange={(e) =>
                                        updateItem(block.id, item.id, "mediaUrl", e.target.value)
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
                            ) : (
                                <Box key={item.id} sx={{ mt: 1 }}>
                                    <a
                                        href={item.mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {item.mediaUrl}
                                    </a>
                                </Box>
                            )
                        )
                    ))}

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
                    <Select
                        fullWidth
                        value={newBlockType}
                        onChange={(e) => setNewBlockType(e.target.value)}
                    >
                        {blockTypes.map(t => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={addBlock} disabled={!newBlockType}>
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
                        onChange={(e) => setNewItemType(e.target.value)}
                    >
                        <MenuItem value="TEXT">TEXT</MenuItem>
                        <MenuItem value="IMAGE">IMAGE</MenuItem>
                        <MenuItem value="VIDEO">VIDEO</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={addItem} disabled={!newItemType}>
                        Добавить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
