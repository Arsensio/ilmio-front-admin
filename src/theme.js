import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light",  // светлая тема
        primary: {
            main: "#1976d2",  // основной цвет (Navbar, кнопки)
            contrastText: "#fff",
        },
        secondary: {
            main: "#9c27b0",  // вторичный
            contrastText: "#fff",
        },
        background: {
            default: "#ffffff", // фон страницы
            paper: "#ffffff"    // фон контейнеров
        },
        text: {
            primary: "#000000",
            secondary: "#444444"
        }
    }
});

export default theme;
