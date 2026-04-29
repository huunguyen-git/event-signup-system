import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private client: SupabaseClient;

    constructor() {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

        console.log(url);
        console.log(key);

        if (!url || !key) {
            throw new Error('Missing Supabase environment variables');
        }

        this.client = createClient(url, key);
    }

    getClient(): SupabaseClient {
        return this.client;
    }
}