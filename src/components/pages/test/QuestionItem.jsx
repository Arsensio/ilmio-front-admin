import {
    Box,
    Paper,
    TextField,
    Typography,
    IconButton,
    Checkbox,
    Button,
    Tooltip,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";

import { uploadImage, buildImagePreviewUrl } from "@/api/images.js";

const ABCD = ["A", "B", "C", "D"];

export default function QuestionItem({
                                         question,
                                         onChange,
                                         onDelete,
                                     }) {
    const hasImage = Boolean(question.imageUrl);
    const hasLocalFile = Boolean(question.imageFile);

    const isMatch =
        question.type === "MATCH" ||
        question.type === "MATCH_PROGRESSIVE";

    /* ================= IMAGE ================= */

    const selectImage = (file) => {
        if (!file || hasImage) return;

        onChange({
            ...question,
            imageFile: file,
            previewUrl: URL.createObjectURL(file),
        });
    };

    const uploadImageForQuestion = async () => {
        if (!question.imageFile) return;

        const res = await uploadImage(question.imageFile);

        onChange({
            ...question,
            imageUrl: res.objectKey ?? res.url,
            previewUrl: buildImagePreviewUrl(res.url),
            imageFile: null,
        });
    };

    const removeImage = () => {
        onChange({
            ...question,
            imageUrl: null,
            previewUrl: null,
            imageFile: null,
        });
    };

    /* ================= ANSWERS ================= */

    const updateAnswer = (index, patch) => {
        const next = [...question.answerItems];
        next[index] = { ...next[index], ...patch };
        onChange({ ...question, answerItems: next });
    };

    const setCorrect = (index) => {
        onChange({
            ...question,
            answerItems: question.answerItems.map((a, i) => ({
                ...a,
                isCorrect: i === index,
            })),
        });
    };

    /* ================= RENDER ================= */

    return (
        <Paper sx={{ p: 2, mt: 2 }}>
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography fontWeight="bold">
                    Вопрос ({question.type})
                </Typography>

                <IconButton color="error" onClick={onDelete}>
                    <DeleteIcon />
                </IconButton>
            </Box>

            {/* IMAGE BLOCK */}
            <Box mt={1}>
                {!hasImage && !hasLocalFile && (
                    <Tooltip title="Можно прикрепить только одну картинку к вопросу">
                        <Button
                            component="label"
                            size="small"
                            startIcon={<ImageIcon />}
                            variant="outlined"
                        >
                            Загрузить картинку
                            <input
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    selectImage(e.target.files?.[0])
                                }
                            />
                        </Button>
                    </Tooltip>
                )}

                {(question.previewUrl || hasImage) && (
                    <Box mt={1}>
                        <img
                            src={question.previewUrl}
                            alt=""
                            style={{
                                maxWidth: 240,
                                borderRadius: 8,
                                display: "block",
                            }}
                        />

                        <Box display="flex" gap={1} mt={1}>
                            {hasLocalFile && (
                                <Button
                                    size="small"
                                    startIcon={<CloudUploadIcon />}
                                    onClick={uploadImageForQuestion}
                                >
                                    Загрузить
                                </Button>
                            )}

                            <Button
                                size="small"
                                color="error"
                                onClick={removeImage}
                            >
                                Удалить
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* QUESTION TEXT */}
            <TextField
                fullWidth
                label="Вопрос"
                value={question.text}
                sx={{ mt: 2 }}
                onChange={(e) =>
                    onChange({ ...question, text: e.target.value })
                }
            />

            {/* ANSWERS */}
            <Box mt={2}>
                {/* SINGLE CHOICE */}
                {question.type === "SINGLE_CHOICE" &&
                    question.answerItems.map((a, i) => (
                        <Box key={i} display="flex" gap={1} mt={1}>
                            <TextField
                                value={ABCD[i]}
                                disabled
                                sx={{ width: 60 }}
                            />

                            <TextField
                                fullWidth
                                label="Ответ"
                                value={a.value}
                                onChange={(e) =>
                                    updateAnswer(i, { value: e.target.value })
                                }
                            />

                            <Checkbox
                                checked={a.isCorrect}
                                onChange={() => setCorrect(i)}
                            />
                        </Box>
                    ))}

                {/* TRUE / FALSE */}
                {question.type === "TRUE_FALSE" &&
                    question.answerItems.map((a, i) => (
                        <Box key={i} display="flex" gap={1} mt={1}>
                            <TextField
                                value={a.key}
                                disabled
                                sx={{ width: 60 }}
                            />

                            <TextField
                                fullWidth
                                label="Ответ"
                                value={a.value}
                                onChange={(e) =>
                                    updateAnswer(i, { value: e.target.value })
                                }
                            />

                            <Checkbox
                                checked={a.isCorrect}
                                onChange={() => setCorrect(i)}
                            />
                        </Box>
                    ))}

                {/* MATCH & MATCH_PROGRESSIVE */}
                {isMatch &&
                    question.answerItems.map((a, i) => (
                        <Box key={i} display="flex" gap={1} mt={1}>
                            <TextField
                                label="Ключ"
                                value={a.key}
                                sx={{ width: 160 }}
                                onChange={(e) =>
                                    updateAnswer(i, { key: e.target.value })
                                }
                            />

                            <TextField
                                fullWidth
                                label="Значение"
                                value={a.value}
                                onChange={(e) =>
                                    updateAnswer(i, { value: e.target.value })
                                }
                            />

                            <IconButton
                                color="error"
                                onClick={() =>
                                    onChange({
                                        ...question,
                                        answerItems:
                                            question.answerItems.filter(
                                                (_, idx) => idx !== i
                                            ),
                                    })
                                }
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}

                {isMatch && (
                    <Button
                        size="small"
                        startIcon={<AddIcon />}
                        sx={{ mt: 1 }}
                        onClick={() =>
                            onChange({
                                ...question,
                                answerItems: [
                                    ...question.answerItems,
                                    { key: "", value: "" },
                                ],
                            })
                        }
                    >
                        Добавить вариант
                    </Button>
                )}
            </Box>
        </Paper>
    );
}
