import client from "./client";

/**
 * Получить список уроков с тестами (server-side фильтрация)
 */
export const getTestLessons = (params) =>
    client.get("/admin/test/lessons", { params });

export const getLessonTests = (lessonId) =>
    client.get(`/admin/test/lesson/${lessonId}`);

export const getQuestionTypes = () =>
    client.get("/admin/lessons/dictionaries/QUESTION_TYPE");