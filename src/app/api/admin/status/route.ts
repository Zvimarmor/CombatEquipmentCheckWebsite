import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToday } from '@/lib/utils';

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

    // Transform to status view
    const status = teams.map((team) => ({
      teamId: team.id,
      teamName: team.name,
      soldiers: team.soldiers.map((soldier) => {
        const lastVerification = soldier.verifications[0] || null;
        const verified = !!lastVerification;
        return {
          soldierId: soldier.id,
          soldierName: soldier.name,
          personalId: soldier.personalId,
          equipmentCount: soldier._count.equipment,
          verified,
          verificationTime: lastVerification?.timestamp || null,
        };
      }),
      verifiedCount: team.soldiers.filter((s) => s.verifications.length > 0).length,
      totalCount: team.soldiers.length,
    }));

    return NextResponse.json({
      date,
      intervalHours,
      teams: status,
      summary: {
        totalSoldiers: status.reduce((sum, t) => sum + t.totalCount, 0),
        totalVerified: status.reduce((sum, t) => sum + t.verifiedCount, 0),
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
