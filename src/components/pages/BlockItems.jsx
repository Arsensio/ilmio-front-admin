import { useState } from "react";

import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItemButton,
    ListItemText,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Tooltip from "@mui/material/Tooltip";

import {
    uploadImage,
    buildImagePreviewUrl,
} from "@/api/images";

/**
 * Управляет items внутри одного блока
 */
export default function BlockItems({
                                       items = [],          // ✅ защита
                                       itemTypes = [],      // ✅ защита
                                       onChange,
                                   }) {
    const [dialogOpen, setDialogOpen] = useState(false);

    /* ================= HELPERS ================= */
    const createItemByType = (type) => {
        if (type === "TEXT") {
            return { itemType: "TEXT", content: "" };
        }

        return {
            itemType: type,
            mediaUrl: "",
            previewUrl: "",
            file: null,
        };
    };

    const addItem = (type) => {
        onChange([...items, createItemByType(type)]);
        setDialogOpen(false);
    };

    const updateItem = (index, patch) => {
        const next = [...items];
        next[index] = { ...next[index], ...patch };
        onChange(next);
    };

    const deleteItem = (index) => {
        const next = [...items];
        next.splice(index, 1);
        onChange(next);
    };

    const uploadImageForItem = async (index) => {
        const item = items[index];
        if (!item?.file) return;

        const res = await uploadImage(item.file);

        updateItem(index, {
            mediaUrl: res.objectKey ?? res.url,
            previewUrl: buildImagePreviewUrl(res.url),
            file: null,
        });
    };

    /* ================= RENDER ================= */
    return (
        <Box>
            <Typography variant="subtitle2" mb={1}>
                Элементы блока
            </Typography>

            {items.map((it, i) => (
                <Paper key={i} sx={{ p: 2, mb: 2 }}>
                    {/* HEADER */}
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                    >
                        <Typography variant="caption" color="text.secondary">
                            {it.itemType}
                        </Typography>

                        <Tooltip title="Удалить элемент">
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => deleteItem(i)}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* TEXT */}
                    {it.itemType === "TEXT" && (
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label="Текст"
                            value={it.content}
                            onChange={(e) =>
                                updateItem(i, { content: e.target.value })
                            }
                        />
                    )}

                    {/* VIDEO */}
                    {it.itemType === "VIDEO" && (
                        <TextField
                            fullWidth
                            label="Видео"
                            placeholder="Ссылка на видео"
                            value={it.mediaUrl}
                            onChange={(e) =>
                                updateItem(i, { mediaUrl: e.target.value })
                            }
                        />
                    )}

                    {/* IMAGE */}
                    {it.itemType === "IMAGE" && (
                        <Box>
                            {it.previewUrl && (
                                <Box mb={1}>
                                    <img
                                        src={it.previewUrl}
                                        alt=""
                                        style={{
                                            maxWidth: 240,
                                            borderRadius: 8,
                                        }}
                                    />
                                </Box>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    updateItem(i, {
                                        file: e.target.files?.[0] ?? null,
                                    })
                                }
                            />

                            {it.file && (
                                <Box mt={1}>
                                    <Button
                                        size="small"
                                        startIcon={<CloudUploadIcon />}
                                        onClick={() =>
                                            uploadImageForItem(i)
                                        }
                                    >
                                        Загрузить
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}
                </Paper>
            ))}

            {/* ADD ITEM */}
            <Button
                startIcon={<AddIcon />}
                size="small"
                variant="outlined"
                onClick={() => setDialogOpen(true)}
            >
                Добавить элемент
            </Button>

            {/* DIALOG */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            >
                <DialogTitle>Тип элемента</DialogTitle>
                <DialogContent>
                    <List>
                        {itemTypes.map((it) => (
                            <ListItemButton
                                key={it.code}
                                onClick={() => addItem(it.code)}
                            >
                                <ListItemText primary={it.label} />
                            </ListItemButton>
                        ))}

                        {itemTypes.length === 0 && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ p: 2 }}
                            >
                                Типы элементов не загружены
                            </Typography>
                        )}
                    </List>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
