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

export default function TopicsFilters({
                                          statuses = [],
                                          ageGroups = [],
                                          langs = [],
                                          value,
                                          onChange,
                                          onReset,
                                      }) {
    const handleMultiChange = (field) => (e) => {
        onChange({
            ...value,
            [field]: e.target.value,
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
                    multiple
                    value={value.statuses}
                    onChange={handleMultiChange("statuses")}
                    renderValue={(selected) => selected.join(", ")}
                >
                    {statuses.map((o) => (
                        <MenuItem key={o.code} value={o.code}>
                            {o.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* AGE GROUP */}
            <FormControl fullWidth>
                <InputLabel>Возраст</InputLabel>
                <Select
                    multiple
                    value={value.ageGroups}
                    onChange={handleMultiChange("ageGroups")}
                    renderValue={(selected) => selected.join(", ")}
                >
                    {ageGroups.map((o) => (
                        <MenuItem key={o.code} value={o.code}>
                            {o.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* LANGUAGE */}
            <FormControl fullWidth>
                <InputLabel>Язык</InputLabel>
                <Select
                    multiple
                    value={value.langs}
                    onChange={handleMultiChange("langs")}
                    renderValue={(selected) => selected.join(", ")}
                >
                    {langs.map((o) => (
                        <MenuItem key={o.code} value={o.code}>
                            {o.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* TITLE */}
            <TextField
                label="По названию"
                value={value.title}
                onChange={(e) =>
                    onChange({ ...value, title: e.target.value })
                }
                sx={{ flexGrow: 1, minWidth: 200 }}
            />

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
