import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Return distinct equipment types from the database
export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('admin_auth');
  if (!authCookie || authCookie.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const equipment = await prisma.equipment.findMany({
      distinct: ['type'],
      select: { type: true },
      orderBy: { type: 'asc' },
    });

    const types = equipment.map((e) => e.type);
    return NextResponse.json(types);
  } catch (error) {
    console.error('Error fetching equipment types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment types' },
      { status: 500 }
    );
  }
}
