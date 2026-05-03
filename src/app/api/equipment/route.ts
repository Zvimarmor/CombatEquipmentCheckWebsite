import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const soldierId = searchParams.get('soldierId');

    if (!soldierId) {
      return NextResponse.json(
        { error: 'soldierId parameter is required' },
        { status: 400 }
      );
    }

    const equipment = await prisma.equipment.findMany({
      where: { soldierId },
      orderBy: { type: 'asc' },
      select: {
        id: true,
        type: true,
        serialNumber: true,
      },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}
