import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { EncryptedMessage } from '@/types/glyph';

// For MVP, we're storing messages in a simple JSON file on the server.
// DO NOT USE THIS IN PRODUCTION. Use a real database (Postgres, Redis, etc.)
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'messages.json');

async function ensureDb() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify({}));
    }
  } catch (error) {
    console.error('Failed to initialize local DB:', error);
  }
}

export async function POST(request: Request) {
  try {
    const message: EncryptedMessage = await request.json();
    
    if (!message.id || !message.ciphertext || !message.hint) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await ensureDb();
    
    const dbContent = await fs.readFile(DB_FILE, 'utf-8');
    const db = JSON.parse(dbContent);
    
    // Check size limit (prevent saving more than 1000 messages for this MVP)
    const keys = Object.keys(db);
    if (keys.length > 1000) {
      // Very basic LRU: delete the 100 oldest
      const sortedKeys = keys.sort((a, b) => db[a].createdAt - db[b].createdAt);
      for (let i = 0; i < 100; i++) {
        delete db[sortedKeys[i]];
      }
    }
    
    db[message.id] = message;
    
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
    
    return NextResponse.json({ success: true, id: message.id });
    
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
