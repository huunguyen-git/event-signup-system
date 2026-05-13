import { BASE_URL } from "../config";

export const userApi = {
    getMe: async (token: string) => {
        const res = await fetch(`${BASE_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw await res.json();
        }

        return res.json();
    },

    updateMe: async (token: string, data: {
        full_name?: string,
        birthdate?: string,
        phone_number?: string
        avatar_url?: string,
    }) => {
        const res = await fetch(`${BASE_URL}/users/me`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw await res.json();
        }

        return res.json();
    },

    getById: async (id: string) => {
        const res = await fetch(`${BASE_URL}/users/${id}`);
        if (!res.ok) {
            throw await res.json();
        }
        return res.json();
    }
}