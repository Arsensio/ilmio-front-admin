// src/api/images.js
import client from "./client";

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await client.post("/api/images/upload", formData, {
        headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data", // ✅ важно
        },
    });

    return res.data;
};



export const buildImagePreviewUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;

    // берем baseURL из axios instance
    const base = client.defaults.baseURL || "";
    return `${base}${url}`;
};

/**
 * If backend returns mediaUrl as full link:
 *  "http://localhost:8081/api/images/view?objectKey=images/xxx.jpg"
 * we need to extract objectKey for update payload:
 *  "images/xxx.jpg"
 */
export const extractObjectKey = (mediaUrl) => {
    if (!mediaUrl) return "";
    if (mediaUrl.startsWith("images/")) return mediaUrl;

    try {
        const url = new URL(mediaUrl);
        return url.searchParams.get("objectKey") || "";
    } catch {
        return "";
    }
};
