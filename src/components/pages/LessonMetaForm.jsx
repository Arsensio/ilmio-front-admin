import { useEffect, useState, useMemo } from "react";
import {
    Stack,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Autocomplete,
    CircularProgress,
} from "@mui/material";

import { filterTopics } from "@/api/topics";

export default function LessonMetaForm({ form, dictionaries, onChange }) {
    const { statuses, categories, langs } = dictionaries;

    /* =======================
       TOPICS AUTOCOMPLETE
    ======================= */
    const [searchOptions, setSearchOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");

    /* ===== already selected topics (from lesson) ===== */
    const selectedTopics = useMemo(() => {
        return (form.lessonThemes ?? []).map((t) => ({
            id: t.id,
            title: t.title,
        }));
    }, [form.lessonThemes]);

    /* ===== load topics by search ===== */
    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);
            try {
                const res = await filterTopics(
                    input ? { title: input } : {}
                );

                if (!active) return;

                setSearchOptions(res.data?.content ?? []);
            } catch (e) {
                console.error("Ошибка загрузки тем", e);
            } finally {
                active && setLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, [input]);

    /* ===== merge selected + search options ===== */
    const options = useMemo(() => {
        const map = new Map();

        selectedTopics.forEach((t) => map.set(t.id, t));
        searchOptions.forEach((t) => map.set(t.id, t));

        return Array.from(map.values());
    }, [selectedTopics, searchOptions]);

    return (
        <Stack spacing={2} maxWidth={520} mt={3}>
            {/* TITLE */}
            <TextField
                label="Название"
                required
                value={form.title || ""}
                onChange={(e) => onChange("title", e.target.value)}
            />

            {/* DESCRIPTION */}
            <TextField
                label="Описание"
                multiline
                minRows={3}
                value={form.description || ""}
                onChange={(e) => onChange("description", e.target.value)}
            />

            {/* CATEGORY */}
            <FormControl fullWidth required>
                <InputLabel>Категория</InputLabel>
                <Select
                    value={form.category || ""}
                    label="Категория"
                    onChange={(e) => onChange("category", e.target.value)}
                >
                    {categories.map((c) => (
                        <MenuItem key={c.code} value={c.code}>
                            {c.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* STATUS */}
            <FormControl fullWidth required>
                <InputLabel>Статус</InputLabel>
                <Select
                    value={form.status || ""}
                    label="Статус"
                    onChange={(e) => onChange("status", e.target.value)}
                >
                    {statuses.map((s) => (
                        <MenuItem key={s.code} value={s.code}>
                            {s.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* LANGUAGE */}
            <FormControl fullWidth required>
                <InputLabel>Язык</InputLabel>
                <Select
                    value={form.lang || ""}
                    label="Язык"
                    onChange={(e) => onChange("lang", e.target.value)}
                >
                    {langs.map((l) => (
                        <MenuItem key={l.code} value={l.code}>
                            {l.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* 🔥 THEMES MULTI SELECT */}
            <Autocomplete
                multiple
                options={options}
                loading={loading}
                value={selectedTopics}
                getOptionLabel={(o) => o.title}
                filterSelectedOptions
                onChange={(_, selected) => {
                    onChange(
                        "lessonThemeIds",
                        selected.map((t) => t.id)
                    );
                    onChange("lessonThemes", selected);
                }}
                onInputChange={(_, value) => setInput(value)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Темы"
                        placeholder="Поиск темы…"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading && (
                                        <CircularProgress size={18} />
                                    )}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
            />
        </Stack>
    );
}
