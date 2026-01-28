import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    Box,
    Divider,
    Button,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

export default function Navbar({ onLogout }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const toggleDrawer = (state) => () => {
        setOpen(state);
    };

    const handleNavigate = (path) => {
        setOpen(false);
        navigate(path);
    };

    return (
        <>
            {/* Верхняя панель во всю ширину */}
            <AppBar position="fixed" color="primary">
                <Toolbar>
                    {/* Бургер слева */}
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={toggleDrawer(true)}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Заголовок */}
                    <Typography variant="h6" component="div">
                        Админка
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Отступ, чтобы контент не заходил под AppBar */}
            <Toolbar />

            {/* Боковое меню Drawer слева */}
            <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
                <Box
                    sx={{ width: 250, p: 2, height: "100%", bgcolor: "#fafafa" }}
                    role="presentation"
                >
                    <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                        Меню
                    </Typography>

                    <Divider />

                    <List>
                        <ListItemButton onClick={() => handleNavigate("/dashboard")}>
                            <ListItemText primary="Главная" />
                        </ListItemButton>

                        <ListItemButton onClick={() => handleNavigate("/lessons")}>
                            <ListItemText primary="Уроки" />
                        </ListItemButton>

                        <ListItemButton onClick={() => handleNavigate("/users")}>
                            <ListItemText primary="Пользователи" />
                        </ListItemButton>
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={onLogout}
                    >
                        Выйти
                    </Button>
                </Box>
            </Drawer>
        </>
    );
}
