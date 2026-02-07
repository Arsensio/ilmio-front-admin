import { Box, Typography, Divider, Button } from "@mui/material";
import { useLessonForm } from "../hooks/useLessonForm.js";
import LessonMetaForm from "./LessonMetaForm.jsx";
import LessonBlocks from "./LessonBlocks.jsx";

export default function LessonForm({ initialData, dictionaries, onSubmit }) {
    const { form, setForm, updateMeta, buildPayload } =
        useLessonForm(initialData);

    if (!form) return null;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">Редактирование урока</Typography>

            <LessonMetaForm
                form={form}
                dictionaries={dictionaries}
                onChange={updateMeta}
            />

            <Divider sx={{ my: 4 }} />

            <LessonBlocks
                blocks={form.blocks}
                setBlocks={(blocks) =>
                    setForm((prev) => ({ ...prev, blocks }))
                }
                dictionaries={dictionaries}
            />

            <Divider sx={{ my: 4 }} />

            <Button
                variant="contained"
                size="large"
                onClick={() => onSubmit(buildPayload())}
            >
                💾 Сохранить урок
            </Button>
        </Box>
    );
}
