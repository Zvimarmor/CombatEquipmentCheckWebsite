import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('admin_auth');
  return authCookie?.value === 'true';
}

// GET: List all soldiers with teams and equipment
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const teamId = searchParams.get('teamId') || '';

    const soldiers = await prisma.soldier.findMany({
      where: {
        ...(search
          ? { name: { contains: search, mode: 'insensitive' as const } }
          : {}),
        ...(teamId ? { teamId } : {}),
      },
      orderBy: { name: 'asc' },
      include: {
        team: { select: { id: true, name: true } },
        equipment: {
          orderBy: { type: 'asc' },
          select: { id: true, type: true, serialNumber: true },
        },
        _count: { select: { equipment: true } },
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

// POST: Create a new soldier with equipment
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, teamId, personalId, equipment } = body as {
      name: string;
      teamId: string;
      personalId?: string;
      equipment: { type: string; serialNumber: string }[];
    };

    if (!name?.trim() || !teamId) {
      return NextResponse.json(
        { error: 'שם החייל וצוות הם שדות חובה' },
        { status: 400 }
      );
    }

    // Check if soldier already exists in this team
    const existing = await prisma.soldier.findFirst({
      where: { name: name.trim(), teamId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'חייל עם שם זה כבר קיים בצוות' },
        { status: 409 }
      );
    }

    const soldier = await prisma.soldier.create({
      data: {
        name: name.trim(),
        teamId,
        personalId: personalId?.trim() || null,
        equipment: {
          create: (equipment || [])
            .filter((e: { type: string; serialNumber: string }) => e.type?.trim() && e.serialNumber?.trim())
            .map((e: { type: string; serialNumber: string }) => ({
              type: e.type.trim(),
              serialNumber: e.serialNumber.trim(),
            })),
        },
      },
      include: {
        team: { select: { name: true } },
        equipment: true,
      },
    });

    return NextResponse.json(soldier, { status: 201 });
  } catch (error) {
    console.error('Error creating soldier:', error);
    return NextResponse.json(
      { error: 'Failed to create soldier' },
      { status: 500 }
    );
  }
}
