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
                                           levels,
                                           statuses,
                                           categories,
                                           ageGroups,
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
            <FormControl fullWidth>
                <InputLabel>Уровень</InputLabel>
                <Select
                    value={value.level}
                    label="Уровень"
                    onChange={(e) => update("level", e.target.value)}
                >
                    <MenuItem value="">Все</MenuItem>
                    {levels.map((v) => (
                        <MenuItem key={v.code} value={v.code}>
                            {v.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

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

            <FormControl fullWidth>
                <InputLabel>Возраст</InputLabel>
                <Select
                    value={value.ageGroup}
                    label="Возраст"
                    onChange={(e) => update("ageGroup", e.target.value)}
                >
                    <MenuItem value="">Все</MenuItem>
                    {ageGroups.map((v) => (
                        <MenuItem key={v.code} value={v.code}>
                            {v.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                fullWidth
                label="По названию"
                value={value.title}
                onChange={(e) => update("title", e.target.value)}
            />

            {/* ✅ FIXED RESET BUTTON */}
            <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={onReset}
                sx={{
                    height: 56,              // 🔥 КЛЮЧ
                    minWidth: 120,
                    whiteSpace: "nowrap",
                }}
            >
                Сброс
            </Button>
        </Stack>
    );
}
