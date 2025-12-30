import React from "react";
import ReactDOM from "react-dom/client";
import AppWrapper from "./App";
import "./index.css";

// импортируем MUI
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme"; // наш файл темы

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <ThemeProvider theme={theme}>
        <CssBaseline /> {/* сбрасывает стандартные стили и применяет тему */}
        <AppWrapper />
    </ThemeProvider>
);
