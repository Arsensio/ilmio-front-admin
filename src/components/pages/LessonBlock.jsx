import { useState } from "react";

import {
    Box,
    Paper,
    Typography,
    IconButton,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItemButton,
    ListItemText,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddIcon from "@mui/icons-material/Add";

import BlockItems from "./BlockItems";
import BlockQuestions from "./BlockQuestions";

export default function LessonBlock({
                                        block,
                                        index,
                                        blocks,
                                        setBlocks,
                                        dictionaries,
                                    }) {
    const [questionDialogOpen, setQuestionDialogOpen] = useState(false);

    /* ================= BLOCK OPS ================= */
    const moveBlock = (from, to) => {
        if (to < 0 || to >= blocks.length) return;
        const copy = [...blocks];
        const [moved] = copy.splice(from, 1);
        copy.splice(to, 0, moved);
        setBlocks(copy);
    };

    const deleteBlock = () => {
        const copy = [...blocks];
        copy.splice(index, 1);
        setBlocks(copy);
    };

    /* ================= ITEMS ================= */
    const updateItems = (items) => {
        const copy = [...blocks];
        copy[index] = { ...copy[index], items };
        setBlocks(copy);
    };

    /* ================= QUESTIONS ================= */
    const updateQuestions = (questions) => {
        const copy = [...blocks];
        copy[index] = { ...copy[index], questions };
        setBlocks(copy);
    };

    const createDefaultAnswers = (type) => {
        if (type === "TRUE_FALSE") {
            return [
                { key: "T", value: "", isCorrect: true },
                { key: "F", value: "", isCorrect: false },
            ];
        }

        if (type === "MATCH") {
            return Array.from({ length: 3 }, () => ({ key: "", value: "" }));
        }

        return ["A", "B", "C", "D"].map((k, i) => ({
            key: k,
            value: "",
            isCorrect: i === 0,
        }));
    };

    const addQuestion = (type) => {
        const copy = [...blocks];

        const questions = copy[index].questions ?? [];
        questions.push({
            text: "",
            type,
            answerItems: createDefaultAnswers(type),
        });

        copy[index] = { ...copy[index], questions };
        setBlocks(copy);
        setQuestionDialogOpen(false);
    };

    /* ================= RENDER ================= */
    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography fontWeight="bold">
                    {block.type} — #{index + 1}
                </Typography>

                <Box>
                    <IconButton size="small" onClick={() => moveBlock(index, index - 1)}>
                        <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => moveBlock(index, index + 1)}>
                        <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={deleteBlock}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* ITEMS */}
            <BlockItems
                items={block.items ?? []}
                itemTypes={dictionaries.blockTypes ?? []}
                onChange={updateItems}
            />

            <Divider sx={{ my: 2 }} />

            {/* QUESTIONS */}
            <BlockQuestions
                questions={block.questions ?? []}
                questionTypes={dictionaries.questionTypes ?? []}
                onChange={updateQuestions}
            />

            <Button
                size="small"
                startIcon={<AddIcon />}
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setQuestionDialogOpen(true)}   // ✅ ВОТ ОНО
            >
                Добавить тест
            </Button>

            {/* DIALOG */}
            <Dialog
                open={questionDialogOpen}
                onClose={() => setQuestionDialogOpen(false)}
            >
                <DialogTitle>Тип теста</DialogTitle>
                <DialogContent>
                    <List>
                        {(dictionaries.questionTypes ?? []).map((qt) => (
                            <ListItemButton
                                key={qt.code}
                                onClick={() => addQuestion(qt.code)}
                            >
                                <ListItemText primary={qt.label} />
                            </ListItemButton>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
        </Paper>
    );
}
