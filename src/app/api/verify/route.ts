import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';

interface VerificationItem {
  equipmentId: string;
  equipmentType: string;
  serialNumber: string;
  verified: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { soldierId, items } = body as {
      soldierId: string;
      items: VerificationItem[];
    };

    if (!soldierId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'soldierId and items array are required' },
        { status: 400 }
      );
    }

    // At least one item must be verified
    const anyVerified = items.some((item: VerificationItem) => item.verified);
    if (!anyVerified) {
      return NextResponse.json(
        { error: 'יש לאמת לפחות פריט אחד לפני שליחה' },
        { status: 400 }
      );
    }

    // Verify soldier exists
    const soldier = await prisma.soldier.findUnique({
      where: { id: soldierId },
      include: { team: true },
    });

    if (!soldier) {
      return NextResponse.json(
        { error: 'Soldier not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const dateStr = formatDate(now);

    // Create verification record with per-item state
    const verification = await prisma.verification.create({
      data: {
        soldierId,
        timestamp: now,
        date: dateStr,
        items: JSON.parse(JSON.stringify(items)),
      },
    });

    const verifiedCount = items.filter((i: VerificationItem) => i.verified).length;
    const totalCount = items.length;

    return NextResponse.json({
      success: true,
      verification: {
        id: verification.id,
        timestamp: verification.timestamp,
        date: verification.date,
        soldierName: soldier.name,
        teamName: soldier.team.name,
        verifiedCount,
        totalCount,
        isPartial: verifiedCount < totalCount,
      },
    });
  } catch (error) {
    console.error('Error creating verification:', error);
    return NextResponse.json(
      { error: 'Failed to create verification' },
      { status: 500 }
    );
  }
}
