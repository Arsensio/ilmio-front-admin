import { useEffect, useState } from "react";
import { buildImagePreviewUrl, extractObjectKey } from "@/api/images.js";

export function useLessonForm(initialData) {
    const [form, setForm] = useState(null);

    useEffect(() => {
        if (!initialData) return;

        setForm({
            ...initialData,
            blocks: (initialData.blocks ?? []).map((b) => ({
                ...b,

                items: (b.items ?? []).map((it) =>
                    it.itemType === "IMAGE"
                        ? {
                            ...it,
                            previewUrl: it.mediaUrl
                                ? buildImagePreviewUrl(it.mediaUrl)
                                : null,
                            file: null,
                        }
                        : it
                ),

                // 🔥 ВАЖНО
                questions: (b.test?.questions ?? []).map((q) => ({
                    id: q.id,
                    text: q.text,
                    type: q.type,

                    imageUrl: q.mediaUrl ?? null,               // ✅
                    previewUrl: q.mediaUrl
                        ? buildImagePreviewUrl(q.mediaUrl)
                        : null,                                  // ✅
                    imageFile: null,                             // ✅

                    answerItems: (q.items ?? []).map((a) => ({
                        key: a.key,
                        value: a.value,
                        isCorrect: a.isCorrect ?? false,
                    })),
                })),
            })),
        });
    }, [initialData]);


    const updateMeta = (key, value) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const buildPayload = () => ({
        ...form,

        blocks: form.blocks.map((b, bi) => ({
            type: b.type,
            orderIndex: bi + 1,

            items: b.items.map((it, ii) =>
                it.itemType === "IMAGE"
                    ? {
                        itemType: "IMAGE",
                        orderIndex: ii + 1,
                        mediaUrl: extractObjectKey(it.mediaUrl),
                    }
                    : {
                        ...it,
                        orderIndex: ii + 1,
                    }
            ),

            // 🔥 САМОЕ ВАЖНОЕ
            questions: b.questions.map((q) => {
                const payload = {
                    text: q.text,
                    type: q.type,
                    answerItems: q.answerItems,
                };

                // ✅ ТОЛЬКО ЕСЛИ ЕСТЬ КАРТИНКА
                if (q.imageUrl) {
                    payload.mediaUrl = extractObjectKey(q.imageUrl);
                }

                return payload;
            }),
        })),
    });


    return {
        form,
        setForm,
        updateMeta,
        buildPayload,
    };
}
