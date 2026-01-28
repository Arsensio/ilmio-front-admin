import client from "./client";

export const register = (data) => {
    return client.post("/auth/register", data);
};

export const verifyOtp = (data) => {
    return client.post("/auth/verify", data);
};

export const login = (data) => {
    return client.post("/auth/admin/login", data);
};

export const logout = () => {
    localStorage.removeItem("token");
};
