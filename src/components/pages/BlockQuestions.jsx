import {Box, Typography} from "@mui/material";

import QuestionItem from "./QuestionItem";


export default function BlockQuestions({
                                           questions = [],
                                           onChange,
                                       }) {
    /* ================= UPDATE ================= */
    const updateQuestion = (index, nextQuestion) => {
        const copy = [...questions];
        copy[index] = nextQuestion;
        onChange(copy);
    };

    /* ================= DELETE ================= */
    const deleteQuestion = (index) => {
        const copy = [...questions];
        copy.splice(index, 1);
        onChange(copy);
    };

    /* ================= RENDER ================= */
    return (
        <Box>
            <Typography fontWeight="bold" mb={1}>
                Тесты
            </Typography>

            {questions.map((q, i) => (
                <QuestionItem
                    key={i}
                    question={q}
                    onChange={(next) =>
                        updateQuestion(i, next)
                    }
                    onDelete={() => deleteQuestion(i)} // 🔥 ВАЖНО
                />
            ))}
        </Box>
    );
}
