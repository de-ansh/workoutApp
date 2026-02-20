import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

async function readDB() {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

async function writeDB(data: any) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
    try {
        const data = await readDB();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading DB:', error);
        return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const existing = await readDB();

        // Deep merge: nested objects like history and profile are merged,
        // not replaced, to prevent data loss on concurrent writes.
        const updatedData = {
            ...existing,
            ...body,
            // Merge profile fields individually so a partial update doesn't wipe other fields
            profile: body.profile
                ? { ...existing.profile, ...body.profile }
                : existing.profile,
            // Merge history by date key so new entries don't overwrite old ones
            history: body.history
                ? { ...existing.history, ...body.history }
                : existing.history,
            // Merge waterHistory by date key
            waterHistory: body.waterHistory
                ? { ...existing.waterHistory, ...body.waterHistory }
                : existing.waterHistory ?? {},
            // Merge plans if provided
            plans: body.plans
                ? { ...existing.plans, ...body.plans }
                : existing.plans,
        };

        await writeDB(updatedData);
        return NextResponse.json({ success: true, data: updatedData });
    } catch (error) {
        console.error('Error updating DB:', error);
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
    }
}
