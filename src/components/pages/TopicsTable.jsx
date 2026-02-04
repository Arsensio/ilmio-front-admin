import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Box,
} from "@mui/material";

import { filterTopics } from "@/api/topics";

export default function TopicsTable({ filters, page }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                // 🔥 ВАЖНО: отправляем ТОЛЬКО если массив не пустой
                const params = {
                    ...(filters.statuses.length && { statuses: filters.statuses }),
                    ...(filters.levels.length && { levels: filters.levels }),
                    ...(filters.ageGroups.length && { ageGroups: filters.ageGroups }),
                    ...(filters.langs.length && { langs: filters.langs }),
                    ...(filters.title && { title: filters.title }),
                    page,
                };

                const res = await filterTopics(params);
                setData(res.data.content ?? []);
            } catch (e) {
                console.error("Ошибка загрузки тем", e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [filters, page]); // 🔥 КЛЮЧ

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Название</TableCell>
                        <TableCell>Описание</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Язык</TableCell>
                        <TableCell>Порядок</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.title}</TableCell>
                            <TableCell>{row.description}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell>{row.lang}</TableCell>
                            <TableCell>{row.orderIndex}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}
