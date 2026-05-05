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

// POST: Add new equipment to a soldier
export async function POST(request: NextRequest, context: RouteContext) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: soldierId } = await context.params;
    const body = await request.json();
    const { type, serialNumber } = body as {
      type: string;
      serialNumber: string;
    };

    if (!type?.trim() || !serialNumber?.trim()) {
      return NextResponse.json(
        { error: 'סוג הציוד ומספר סידורי הם שדות חובה' },
        { status: 400 }
      );
    }

    const equipment = await prisma.equipment.create({
      data: {
        type: type.trim(),
        serialNumber: serialNumber.trim(),
        soldierId,
      },
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error('Error adding equipment:', error);
    return NextResponse.json(
      { error: 'Failed to add equipment' },
      { status: 500 }
    );
  }
}

// PUT: Update equipment (expects equipmentId in body)
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { equipmentId, type, serialNumber } = body as {
      equipmentId: string;
      type?: string;
      serialNumber?: string;
    };

    if (!equipmentId) {
      return NextResponse.json(
        { error: 'equipmentId is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = {};
    if (type !== undefined) updateData.type = type.trim();
    if (serialNumber !== undefined) updateData.serialNumber = serialNumber.trim();

    const equipment = await prisma.equipment.update({
      where: { id: equipmentId },
      data: updateData,
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    return NextResponse.json(
      { error: 'Failed to update equipment' },
      { status: 500 }
    );
  }
}

// DELETE: Remove specific equipment item (expects equipmentId in body)
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { equipmentId } = body as { equipmentId: string };

    if (!equipmentId) {
      return NextResponse.json(
        { error: 'equipmentId is required' },
        { status: 400 }
      );
    }

    await prisma.equipment.delete({ where: { id: equipmentId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json(
      { error: 'Failed to delete equipment' },
      { status: 500 }
    );
  }
}
