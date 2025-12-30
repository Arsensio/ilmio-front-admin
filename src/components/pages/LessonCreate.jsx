import axios from "axios";
import { useNavigate } from "react-router-dom";
import LessonForm from "../components/LessonForm";
import { useEffect, useState } from "react";

export default function LessonCreate() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [meta, setMeta] = useState(null);

    useEffect(() => {
        Promise.all([
            axios.get("/admin/lesson/levels"),
            axios.get("/admin/lesson/statuses"),
            axios.get("/admin/lesson/categories"),
            axios.get("/admin/lesson/blocks"),
        ]).then(([l, s, c, b]) =>
            setMeta({
                levels: l.data,
                statuses: s.data,
                categories: c.data,
                blockTypes: b.data,
            })
        );
    }, []);

    if (!meta) return null;

    const emptyLesson = {
        level: "",
        status: "",
        category: "",
        ageGroup: "",
        translations: [
            { language: "KZ", title: "", description: "" },
            { language: "RU", title: "", description: "" },
            { language: "EN", title: "", description: "" },
        ],
        blocks: [],
    };

    const createLesson = async (payload) => {
        await axios.post("/admin/lesson", payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        navigate("/lessons");
    };

    return (
        <LessonForm
            initialData={emptyLesson}
            {...meta}
            onSubmit={createLesson}
        />
    );
}
