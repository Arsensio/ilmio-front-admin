import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
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
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export default function LessonDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [formState, setFormState] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [blockTypes, setBlockTypes] = useState([]);
    const [levels, setLevels] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newBlockType, setNewBlockType] = useState("");

    /* ===========================
       Загрузка данных
    ============================ */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                const [
                    lessonRes,
                    blockTypesRes,
                    levelsRes,
                    statusesRes,
                    categoriesRes,
                ] = await Promise.all([
                    axios.get(`http://localhost:8081/admin/lesson/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:8081/admin/lesson/blocks", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:8081/admin/lesson/levels", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:8081/admin/lesson/statuses", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:8081/admin/lesson/categories", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setLesson(lessonRes.data);
                setFormState(lessonRes.data);
                setBlockTypes(blockTypesRes.data);
                setLevels(levelsRes.data);
                setStatuses(statusesRes.data);
                setCategories(categoriesRes.data);
            } catch (e) {
                console.error(e);
                setError("Ошибка при загрузке урока");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    /* ===========================
       Перемещение / удаление блоков
    ============================ */
    const moveBlock = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= formState.blocks.length) return;

        setFormState((prev) => {
            const blocks = [...prev.blocks];
            const [moved] = blocks.splice(fromIndex, 1);
            blocks.splice(toIndex, 0, moved);

            return {
                ...prev,
                blocks: blocks.map((b, idx) => ({
                    ...b,
                    orderIndex: idx + 1,
                })),
            };
        });
    };

    const deleteBlock = (blockId) => {
        setFormState((prev) => ({
            ...prev,
            blocks: prev.blocks
                .filter((b) => b.id !== blockId)
                .map((b, idx) => ({ ...b, orderIndex: idx + 1 })),
        }));
    };

    /* ===========================
       Добавление блока
    ============================ */
    const createEmptyBlock = (type) => {
        const languages = formState.translations.map((t) => t.language);

        if (type === "TEXT" || type === "PARAGRAPH") {
            return {
                id: Date.now(),
                type: "TEXT",
                orderIndex: formState.blocks.length + 1,
                items: [
                    {
                        id: Date.now() + 1,
                        itemType: "PARAGRAPH",
                        orderIndex: 1,
                        translations: languages.map((lang) => ({
                            language: lang,
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
                        translations: languages.map((lang) => ({
                            language: lang,
                            mediaUrl: "",
                        })),
                    },
                ],
            };
        }

        return null;
    };

    const handleAddBlock = () => {
        const block = createEmptyBlock(newBlockType);
        if (!block) return;

        setFormState((prev) => ({
            ...prev,
            blocks: [...prev.blocks, block],
        }));

        setAddDialogOpen(false);
        setNewBlockType("");
    };

    /* ===========================
       Изменение item
    ============================ */
    const handleChangeItem = (blockId, itemId, lang, field, value) => {
        setFormState((prev) => ({
            ...prev,
            blocks: prev.blocks.map((b) =>
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
        }));
    };

    /* ===========================
       BUILD PAYLOAD (КЛЮЧЕВОЕ)
    ============================ */
    const buildLessonPayload = (state) => ({
        level: state.level,
        status: state.status,
        category: state.category,
        ageGroup: state.ageGroup,

        translations: state.translations.map((t) => ({
            language: t.language,
            title: t.title,
            description: t.description,
        })),

        blocks: state.blocks.map((block, blockIndex) => ({
            type: block.type,
            orderIndex: blockIndex + 1,
            items: block.items.map((item, itemIndex) => {
                const baseItem = {
                    itemType: item.itemType,
                    orderIndex: itemIndex + 1,
                    translations: item.translations.map((tr) => ({
                        language: tr.language,
                        ...(tr.content !== undefined
                            ? { content: tr.content }
                            : { mediaUrl: tr.mediaUrl }),
                    })),
                };

                if (item.itemType === "VIDEO" && item.duration) {
                    baseItem.duration = item.duration;
                }

                return baseItem;
            }),
        })),
    });

    /* ===========================
       Сохранение
    ============================ */
    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            const payload = buildLessonPayload(formState);

            await axios.put(
                `http://localhost:8081/admin/lesson/${id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setLesson(formState);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            setError("Ошибка при сохранении");
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!formState) return null;

    /* ===========================
       UI
    ============================ */
    return (
        <Box sx={{ p: 3 }}>
            {/* Верх */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Назад
                </Button>
                <Button
                    variant="contained"
                    onClick={() =>
                        isEditing ? handleSave() : setIsEditing(true)
                    }
                >
                    {isEditing ? "Сохранить" : "Редактировать"}
                </Button>
            </Box>

            <Typography variant="h3">Урок ID: {lesson.id}</Typography>

            {/* Информация урока */}
            <Stack spacing={2} sx={{ maxWidth: 400, mt: 3 }}>
                {[{ key: "level", label: "Уровень", options: levels },
                    { key: "status", label: "Статус", options: statuses },
                    { key: "category", label: "Категория", options: categories }].map((f) => (
                    <Box key={f.key}>
                        <Typography fontWeight="bold">{f.label}</Typography>
                        {isEditing ? (
                            <FormControl fullWidth>
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
                        ) : (
                            <Typography>{formState[f.key]}</Typography>
                        )}
                    </Box>
                ))}

                <Box>
                    <Typography fontWeight="bold">Возраст</Typography>
                    {isEditing ? (
                        <TextField
                            fullWidth
                            value={formState.ageGroup}
                            onChange={(e) =>
                                setFormState({
                                    ...formState,
                                    ageGroup: e.target.value,
                                })
                            }
                        />
                    ) : (
                        <Typography>{formState.ageGroup}</Typography>
                    )}
                </Box>
            </Stack>

            <Divider sx={{ my: 4 }} />

            {/* Blocks */}
            <Typography variant="h4">Blocks</Typography>

            {formState.blocks.map((block, idx) => (
                <Paper key={block.id} sx={{ p: 3, mt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography fontWeight="bold">
                            Block #{idx + 1} — {block.type}
                        </Typography>

                        {isEditing && (
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
                        )}
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
                                        disabled={!isEditing}
                                        value={tr.content || ""}
                                        onChange={(e) =>
                                            handleChangeItem(
                                                block.id,
                                                item.id,
                                                tr.language,
                                                "content",
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : isEditing ? (
                                    <TextField
                                        fullWidth
                                        value={tr.mediaUrl || ""}
                                        onChange={(e) =>
                                            handleChangeItem(
                                                block.id,
                                                item.id,
                                                tr.language,
                                                "mediaUrl",
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : (
                                    <a
                                        href={tr.mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {tr.mediaUrl}
                                    </a>
                                )}
                            </Paper>
                        ))
                    )}
                </Paper>
            ))}

            {/* ➕ Добавить блок */}
            {isEditing && (
                <Box sx={{ textAlign: "center", mt: 4 }}>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={() => setAddDialogOpen(true)}
                    >
                        Добавить блок
                    </Button>
                </Box>
            )}

            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                <DialogTitle>Добавить блок</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth>
                        <Select
                            value={newBlockType}
                            onChange={(e) =>
                                setNewBlockType(e.target.value)
                            }
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
                    <Button
                        onClick={handleAddBlock}
                        disabled={!newBlockType}
                    >
                        Добавить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
