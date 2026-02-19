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
        const data = await readDB();

        // Simple deep merge or replacement based on body structure
        // For now, let's allow updating specific keys: profile, history, plans
        const updatedData = { ...data, ...body };

        await writeDB(updatedData);
        return NextResponse.json({ success: true, data: updatedData });
    } catch (error) {
        console.error('Error updating DB:', error);
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
    }
}
