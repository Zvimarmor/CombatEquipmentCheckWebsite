import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToday } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface VerificationItemData {
  equipmentId?: string;
  equipmentType: string;
  serialNumber: string;
  verified: boolean;
}

/**
 * GET /api/admin/inventory?type=ליאור&date=2026-05-07&teamId=optional
 * Returns all equipment units of a given type, with their verification status for the given date.
 */
export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('admin_auth');
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const date = searchParams.get('date') || getToday();
    const teamId = searchParams.get('teamId') || null;

    if (!type) {
      return NextResponse.json(
        { error: 'Missing required parameter: type' },
        { status: 400 }
      );
    }

    // Find all equipment of this type, optionally filtered by team
    const equipment = await prisma.equipment.findMany({
      where: {
        type,
        ...(teamId ? { soldier: { teamId } } : {}),
      },
      include: {
        soldier: {
          include: {
            team: true,
            verifications: {
              where: { date },
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: [
        { soldier: { team: { name: 'asc' } } },
        { soldier: { name: 'asc' } },
      ],
    });

    // Build response with verification status per item
    const items = equipment.map((eq) => {
      const lastVerification = eq.soldier.verifications[0] || null;
      let verified = false;

      if (lastVerification) {
        const verItems = (lastVerification.items as unknown as VerificationItemData[]) || [];
        verified = verItems.some(
          (vi) =>
            vi.verified &&
            vi.equipmentType === eq.type &&
            vi.serialNumber === eq.serialNumber
        );
      }

      return {
        equipmentId: eq.id,
        serialNumber: eq.serialNumber,
        soldierId: eq.soldier.id,
        soldierName: eq.soldier.name,
        teamId: eq.soldier.team.id,
        teamName: eq.soldier.team.name,
        verified,
        verificationId: lastVerification?.id || null,
      };
    });

    return NextResponse.json({
      type,
      date,
      teamId,
      items,
      totalCount: items.length,
      verifiedCount: items.filter((i) => i.verified).length,
    });
  } catch (error) {
    console.error('Error fetching inventory drilldown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory details' },
      { status: 500 }
    );
  }
}
