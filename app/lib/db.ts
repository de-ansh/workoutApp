import { DBData } from "../types";

export async function fetchDB(): Promise<DBData | null> {
    try {
        const res = await fetch('/api/db');
        return await res.json();
    } catch (e) {
        console.error('Fetch error:', e);
        return null;
    }
}

export async function updateDB(partial: Partial<DBData>) {
    try {
        await fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partial)
        });
    } catch (e) {
        console.error('Update error:', e);
    }
}
