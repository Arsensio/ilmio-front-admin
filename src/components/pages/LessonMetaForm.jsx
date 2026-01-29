import { Stack, TextField, FormControl, Select, MenuItem, InputLabel } from "@mui/material";

export default function LessonMetaForm({ form, dictionaries, onChange }) {
    const { levels, statuses, categories, langs, ageGroups } = dictionaries;

    return (
        <Stack spacing={2} maxWidth={420} mt={3}>
            <TextField
                label="Название"
                value={form.title}
                onChange={(e) => onChange("title", e.target.value)}
            />

            <TextField
                label="Описание"
                multiline
                minRows={3}
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
            />

            {[
                ["Возраст", "ageGroup", ageGroups],
                ["Уровень", "level", levels],
                ["Категория", "category", categories],
                ["Язык", "lang", langs],
                ["Статус", "status", statuses],
            ].map(([label, key, list]) => (
                <FormControl fullWidth key={key}>
                    <InputLabel>{label}</InputLabel>
                    <Select
                        value={form[key]}
                        label={label}
                        onChange={(e) => onChange(key, e.target.value)}
                    >
                        {list.map((x) => (
                            <MenuItem key={x.code} value={x.code}>
                                {x.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ))}
        </Stack>
    );
}
