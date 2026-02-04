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
