import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId parameter is required' },
        { status: 400 }
      );
    }

    const soldiers = await prisma.soldier.findMany({
      where: { teamId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        personalId: true,
      },
    });

    return NextResponse.json(soldiers);
  } catch (error) {
    console.error('Error fetching soldiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch soldiers' },
      { status: 500 }
    );
  }
}
