// src/api/topics.js
import client from "./client";

/**
 * GET /admin/lesson-theme/filter
 * params:
 *  statuses: string[]
 *  levels: string[]
 *  ageGroups: string[]
 *  langs: string[]
 *  title: string
 */
export const filterTopics = async (params = {}) => {
    return client.get("/admin/lesson-theme/filter", {
        params,
        paramsSerializer: {
            // важно: повторяющиеся query параметры
            indexes: null,
        },
    });
};

export const getTopicById = async (id) => {
    return client.get(`/admin/lesson-theme/${id}`);
};

export const updateLessonOrderIndex = async ({ themeId, lessonId, orderIndex }) => {
    return client.put("/admin/lesson-theme/index", {
        themeId,
        lessonId,
        orderIndex,
    });
};

export const createTopic = (payload) => {
    return client.post(`/admin/lesson-theme`, payload);
};

export const updateTopicOrder = (id, orderIndex) =>
    client.put(`/admin/lesson-theme/${id}/index`, {
        orderIndex,
    })


export const updateTopic = (id, payload) => {
    return client.put(`/admin/lesson-theme/${id}`, payload);
};
