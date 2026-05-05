import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('admin_auth');
  return authCookie?.value === 'true';
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: Fetch single soldier with all equipment
export async function GET(request: NextRequest, context: RouteContext) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const soldier = await prisma.soldier.findUnique({
      where: { id },
      include: {
        team: { select: { id: true, name: true } },
        equipment: {
          orderBy: { type: 'asc' },
          select: { id: true, type: true, serialNumber: true },
        },
      },
    });

    if (!soldier) {
      return NextResponse.json({ error: 'Soldier not found' }, { status: 404 });
    }

    return NextResponse.json(soldier);
  } catch (error) {
    console.error('Error fetching soldier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch soldier' },
      { status: 500 }
    );
  }
}

// PUT: Update soldier details (name, team, personalId)
export async function PUT(request: NextRequest, context: RouteContext) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, teamId } = body as {
      name?: string;
      teamId?: string;
    };

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (teamId !== undefined) updateData.teamId = teamId;

    const soldier = await prisma.soldier.update({
      where: { id },
      data: updateData,
      include: {
        team: { select: { id: true, name: true } },
        equipment: {
          orderBy: { type: 'asc' },
          select: { id: true, type: true, serialNumber: true },
        },
      },
    });

    return NextResponse.json(soldier);
  } catch (error) {
    console.error('Error updating soldier:', error);
    return NextResponse.json(
      { error: 'Failed to update soldier' },
      { status: 500 }
    );
  }
}

// DELETE: Delete soldier and all related records
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    await prisma.soldier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting soldier:', error);
    return NextResponse.json(
      { error: 'Failed to delete soldier' },
      { status: 500 }
    );
  }
}
