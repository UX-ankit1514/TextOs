import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'messages.json');

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // In Next.js 15+, params is a Promise
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const dbContent = await fs.readFile(DB_FILE, 'utf-8');
    const db = JSON.parse(dbContent);
    
    const message = db[id];
    
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message });
    
  } catch (error) {
    console.error('Error retrieving message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
