import {
    Paper,
    Stack,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
} from "@mui/material";

export default function TopicForm({
                                      value,
                                      onChange,
                                      onSubmit,
                                      submitting = false,

                                      statuses = [],
                                      langs = [],
                                      ageGroups = [],
                                      submitLabel = "Сохранить",
                                  }) {
    const handleChange = (field) => (e) => {
        onChange({
            ...value,
            [field]: e.target.value,
        });
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
                Основная информация
            </Typography>

            <Stack spacing={2}>
                {/* TITLE */}
                <TextField
                    label="Название"
                    required
                    value={value.title || ""}
                    onChange={handleChange("title")}
                />

                {/* DESCRIPTION */}
                <TextField
                    label="Описание"
                    multiline
                    minRows={3}
                    value={value.description || ""}
                    onChange={handleChange("description")}
                />

                {/* STATUS */}
                <FormControl fullWidth required>
                    <InputLabel>Статус</InputLabel>
                    <Select
                        label="Статус"
                        value={value.status || ""}
                        onChange={handleChange("status")}
                    >
                        {statuses.map((o) => (
                            <MenuItem key={o.code} value={o.code}>
                                {o.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* AGE GROUP */}
                <FormControl fullWidth required>
                    <InputLabel>Возрастная группа</InputLabel>
                    <Select
                        label="Возрастная группа"
                        value={value.ageGroup || ""}
                        onChange={handleChange("ageGroup")}
                    >
                        {ageGroups.map((o) => (
                            <MenuItem key={o.code} value={o.code}>
                                {o.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* LANGUAGE */}
                <FormControl fullWidth required>
                    <InputLabel>Язык</InputLabel>
                    <Select
                        label="Язык"
                        value={value.lang || ""}
                        onChange={handleChange("lang")}
                    >
                        {langs.map((o) => (
                            <MenuItem key={o.code} value={o.code}>
                                {o.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={submitting}
                >
                    {submitLabel}
                </Button>
            </Stack>
        </Paper>
    );
}
