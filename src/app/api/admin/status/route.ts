import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToday } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface VerificationItemData {
  equipmentType: string;
  serialNumber: string;
  verified: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Check admin auth cookie
    const authCookie = request.cookies.get('admin_auth');
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getToday();

    // Get verification interval from config or env
    let intervalHours = 24;
    try {
      const config = await prisma.appConfig.findUnique({
        where: { key: 'VERIFICATION_INTERVAL_HOURS' },
      });
      if (config) {
        intervalHours = parseInt(config.value, 10);
      }
    } catch {
      // Use default if config not found
    }
    if (process.env.VERIFICATION_INTERVAL_HOURS) {
      intervalHours = parseInt(process.env.VERIFICATION_INTERVAL_HOURS, 10);
    }

    // Get all teams with soldiers
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: {
        soldiers: {
          orderBy: { name: 'asc' },
          include: {
            verifications: {
              where: { date },
              orderBy: { timestamp: 'desc' },
              take: 1,
            },
            _count: {
              select: { equipment: true },
            },
          },
        },
      },
    });

    // Transform to status view with tri-state verification
    const status = teams.map((team) => {
      const soldiers = team.soldiers.map((soldier) => {
        const lastVerification = soldier.verifications[0] || null;
        const totalEquipment = soldier._count.equipment;

        let verificationStatus: 'full' | 'partial' | 'none' = 'none';
        let verifiedItemCount = 0;
        let missingItems: string[] = [];

        if (lastVerification) {
          const items = (lastVerification.items as unknown as VerificationItemData[]) || [];
          verifiedItemCount = items.filter((i) => i.verified).length;
          missingItems = items.filter((i) => !i.verified).map((i) => i.equipmentType);

          if (verifiedItemCount >= totalEquipment && verifiedItemCount > 0) {
            verificationStatus = 'full';
          } else if (verifiedItemCount > 0) {
            verificationStatus = 'partial';
          }
        }

        return {
          soldierId: soldier.id,
          soldierName: soldier.name,
          equipmentCount: totalEquipment,
          verificationStatus,
          verifiedItemCount,
          missingItems,
          verificationTime: lastVerification?.timestamp || null,
          // Keep backward compatibility
          verified: verificationStatus === 'full',
        };
      });

      const fullCount = soldiers.filter((s) => s.verificationStatus === 'full').length;
      const partialCount = soldiers.filter((s) => s.verificationStatus === 'partial').length;

      return {
        teamId: team.id,
        teamName: team.name,
        soldiers,
        verifiedCount: fullCount,
        partialCount,
        totalCount: soldiers.length,
      };
    });

    return NextResponse.json({
      date,
      intervalHours,
      teams: status,
      summary: {
        totalSoldiers: status.reduce((sum, t) => sum + t.totalCount, 0),
        totalVerified: status.reduce((sum, t) => sum + t.verifiedCount, 0),
        totalPartial: status.reduce((sum, t) => sum + t.partialCount, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching admin status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
