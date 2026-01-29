import { useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItemButton,
    ListItemText,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import LessonBlock from "./LessonBlock";

export default function LessonBlocks({ blocks, setBlocks, dictionaries }) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const addBlock = (type) => {
        setBlocks([
            ...blocks,
            {
                type,
                items: [],
                questions: [],
            },
        ]);
        setDialogOpen(false);
    };

    return (
        <>
            {blocks.map((block, index) => (
                <LessonBlock
                    key={index}
                    index={index}
                    block={block}
                    blocks={blocks}
                    setBlocks={setBlocks}
                    dictionaries={dictionaries}
                />
            ))}

            {/* ADD BLOCK BUTTON */}
            <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => setDialogOpen(true)}
            >
                Добавить блок
            </Button>

            {/* BLOCK TYPE DIALOG */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            >
                <DialogTitle>Тип блока</DialogTitle>
                <DialogContent>
                    <List>
                        {(dictionaries.blockTypes ?? []).map((bt) => (
                            <ListItemButton
                                key={bt.code}
                                onClick={() => addBlock(bt.code)}
                            >
                                <ListItemText primary={bt.label} />
                            </ListItemButton>
                        ))}

                        {(dictionaries.blockTypes ?? []).length === 0 && (
                            <ListItemText
                                primary="Типы блоков не загружены"
                                sx={{ color: "text.secondary", px: 2 }}
                            />
                        )}
                    </List>
                </DialogContent>
            </Dialog>
        </>
    );
}
