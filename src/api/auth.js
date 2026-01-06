import client from "./client";

export const login = (credentials) => {
    return client.post("/auth/login", credentials);
};

export const logout = () => {
    localStorage.removeItem("token");
};