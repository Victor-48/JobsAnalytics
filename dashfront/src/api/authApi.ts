import api from "./axiosconfig";
import type { AxiosResponse } from "axios";

export interface AuthResponse {
    token?: string | null;
    email: string;
    fullName: string;
    role: string;
}

export async function login(data: any): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post("/auth/login", data);
    return response.data;
}

export async function register(data: any): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await api.post("/auth/register", data);
    return response.data;
}