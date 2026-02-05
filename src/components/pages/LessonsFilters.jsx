import {
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
} from "@mui/material";

import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default function LessonsFilters({
                                           statuses,
                                           categories,
                                           langs,          // ✅ добавили
                                           value,
                                           onChange,
                                           onReset,
                                       }) {
    const update = (key, val) => {
        onChange({
            ...value,
            [key]: val,
        });
    };

    return (
        <Stack
            spacing={2}
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "flex-end" }}
        >
            {/* STATUS */}
            <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                    value={value.status}
                    label="Статус"
                    onChange={(e) => update("status", e.target.value)}
                >
                    <MenuItem value="">Все</MenuItem>
                    {statuses.map((v) => (
                        <MenuItem key={v.code} value={v.code}>
                            {v.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* CATEGORY */}
            <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                    value={value.category}
                    label="Категория"
                    onChange={(e) => update("category", e.target.value)}
                >
                    <MenuItem value="">Все</MenuItem>
                    {categories.map((v) => (
                        <MenuItem key={v.code} value={v.code}>
                            {v.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* LANGUAGE */}
            <FormControl fullWidth>
                <InputLabel>Язык</InputLabel>
                <Select
                    value={value.lang}
                    label="Язык"
                    onChange={(e) => update("lang", e.target.value)}
                >
                    <MenuItem value="">Все</MenuItem>
                    {langs.map((v) => (
                        <MenuItem key={v.code} value={v.code}>
                            {v.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* TITLE */}
            <TextField
                fullWidth
                label="По названию"
                value={value.title}
                onChange={(e) => update("title", e.target.value)}
            />

            {/* RESET */}
            <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={onReset}
                sx={{
                    height: 56,
                    minWidth: 120,
                    whiteSpace: "nowrap",
                }}
            >
                Сброс
            </Button>
        </Stack>
    );
}
