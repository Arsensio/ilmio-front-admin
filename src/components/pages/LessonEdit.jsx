import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import LessonForm from "../components/LessonForm";
import { useEffect, useState } from "react";

export default function LessonEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [data, setData] = useState(null);

    useEffect(() => {
        Promise.all([
            axios.get(`/admin/lesson/${id}`),
            axios.get("/admin/lesson/levels"),
            axios.get("/admin/lesson/statuses"),
            axios.get("/admin/lesson/categories"),
            axios.get("/admin/lesson/blocks"),
        ]).then(([lesson, l, s, c, b]) =>
            setData({
                lesson: lesson.data,
                levels: l.data,
                statuses: s.data,
                categories: c.data,
                blockTypes: b.data,
            })
        );
    }, [id]);

    if (!data) return null;

    const updateLesson = async (payload) => {
        await axios.put(`/admin/lesson/${id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        navigate("/lessons");
    };

    return (
        <LessonForm
            initialData={data.lesson}
            levels={data.levels}
            statuses={data.statuses}
            categories={data.categories}
            blockTypes={data.blockTypes}
            onSubmit={updateLesson}
        />
    );
}
