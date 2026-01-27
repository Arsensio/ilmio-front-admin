import client from "./client";

export const getLessons = (params) => client.get("/admin/lesson", { params });

export const getLessonById = (id) => client.get(`/admin/lesson/${id}`);

export const createLesson = (data) => client.post("/admin/lesson", data);

export const updateLesson = (id, data) => client.put(`/admin/lesson/${id}`, data);

export const deleteLesson = (id) => client.delete(`/admin/lesson/${id}`);

/**
 * Словари теперь возвращают:
 * [{code: "...", label: "..."}]
 */
export const getDictionary = (type) => client.get(`/admin/lessons/dictionaries/${type}`);

/* ✅ универсальный маппер на всякий */
const normalizeDict = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((x) => ({
        code: x.code,
        label: x.label ?? x.code,
    }));
};

/**
 * Словари для UI
 */
export const getFilterData = async () => {
    const [
        levels,
        statuses,
        categories,
        langs,
        blockTypes,
        ageGroups,
        questionTypes,
    ] = await Promise.all([
        getDictionary("LEVEL"),
        getDictionary("STATUS"),
        getDictionary("CATEGORY"),
        getDictionary("LANGUAGE"),
        getDictionary("BLOCK_TYPE"),
        getDictionary("AGE_GROUP"),
        getDictionary("QUESTION_TYPE"), // ✅ НОВОЕ
    ]);

    return {
        levels: normalizeDict(levels.data),
        statuses: normalizeDict(statuses.data),
        categories: normalizeDict(categories.data),
        langs: normalizeDict(langs.data),
        blockTypes: normalizeDict(blockTypes.data),
        ageGroups: normalizeDict(ageGroups.data),
        questionTypes: normalizeDict(questionTypes.data), // ✅
    };
};


export const getBlockTypes = () => getDictionary("BLOCK_TYPE");


export const updateLessonOrder = (lessonId, orderIndex) =>
    client.put(`/admin/lesson/${lessonId}/index`, {
        orderIndex,
    });