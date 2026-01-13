import client from "./client";


export const getLessons = (params) => {
    return client.get("/admin/lesson", { params });
};

export const getLessonById = (id) => {
    return client.get(`/admin/lesson/${id}`);
};

export const createLesson = (data) => {
    return client.post("/admin/lesson", data);
};

export const updateLesson = (id, data) => {
    return client.put(`/admin/lesson/${id}`, data);
};

export const deleteLesson = (id) => {
    return client.delete(`/admin/lesson/${id}`);
};

/**
 * Получить один словарь по типу
 * type = LEVEL | STATUS | CATEGORY | BLOCK_TYPE
 */
export const getDictionary = (type) => {
    return client.get(`/admin/lessons/dictionaries/${type}`);
};

/**
 * Словари для фильтров в списке уроков
 */
export const getFilterData = async () => {
    const [levels, statuses, categories, langs, blockTypes] = await Promise.all([
        getDictionary("LEVEL"),
        getDictionary("STATUS"),
        getDictionary("CATEGORY"),
        getDictionary("LANGUAGE"),
        getDictionary("BLOCK_TYPE"),
    ]);

    return {
        levels: levels.data,
        statuses: statuses.data,
        categories: categories.data,
        langs: langs.data,
        blockTypes: blockTypes.data,
    };
};


export const getBlockTypes = () => {
    return getDictionary("BLOCK_TYPE");
};
