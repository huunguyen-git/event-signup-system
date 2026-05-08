import { BASE_URL } from "./config";

export const authApi = {
    register: async (data: {
        email: string,
        password: string,
        full_name: string,
        birthdate: string,
    }) => {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw await res.json();
        }
        return res.json();
    },

    login: async (data: {
        email: string,
        password: string,
    }) => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw res.json();
        }

        return res.json();
    }
}