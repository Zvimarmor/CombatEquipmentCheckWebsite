import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface VerificationItemData {
  equipmentId?: string;
  equipmentType: string;
  serialNumber: string;
  verified: boolean;
}

/**
 * POST /api/admin/inventory/verify
 * Admin manually verifies a single equipment item for a soldier.
 * Creates or updates the soldier's verification record for today to mark this specific item as verified.
 */
export async function POST(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('admin_auth');
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { soldierId, equipmentId, equipmentType, serialNumber } = body as {
      soldierId: string;
      equipmentId: string;
      equipmentType: string;
      serialNumber: string;
    };

    if (!soldierId || !equipmentId || !equipmentType || !serialNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify that the soldier and equipment exist
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        soldier: {
          include: {
            team: true,
            equipment: true,
          },
        },
      },
    });

    if (!equipment || equipment.soldierId !== soldierId) {
      return NextResponse.json(
        { error: 'Equipment or soldier not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const dateStr = formatDate(now);

    // Check if there's already a verification for this soldier today
    const existingVerification = await prisma.verification.findFirst({
      where: {
        soldierId,
        date: dateStr,
      },
      orderBy: { timestamp: 'desc' },
    });

    if (existingVerification) {
      // Update the existing verification — mark this specific item as verified
      const existingItems = (existingVerification.items as unknown as VerificationItemData[]) || [];

      // Check if this item is already in the list
      const itemIndex = existingItems.findIndex(
        (i) => i.equipmentType === equipmentType && i.serialNumber === serialNumber
      );

      let updatedItems: VerificationItemData[];
      if (itemIndex >= 0) {
        // Update existing item
        updatedItems = existingItems.map((item, idx) =>
          idx === itemIndex ? { ...item, verified: true } : item
        );
      } else {
        // Add the newly verified item
        updatedItems = [
          ...existingItems,
          {
            equipmentId,
            equipmentType,
            serialNumber,
            verified: true,
          },
        ];
      }

      // Also ensure all soldier's equipment is represented in the items list
      for (const eq of equipment.soldier.equipment) {
        const exists = updatedItems.some(
          (i) => i.equipmentType === eq.type && i.serialNumber === eq.serialNumber
        );
        if (!exists) {
          updatedItems.push({
            equipmentId: eq.id,
            equipmentType: eq.type,
            serialNumber: eq.serialNumber,
            verified: false,
          });
        }
      }

      await prisma.verification.update({
        where: { id: existingVerification.id },
        data: {
          items: JSON.parse(JSON.stringify(updatedItems)),
          timestamp: now,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'פריט אומת בהצלחה',
        verificationId: existingVerification.id,
      });
    } else {
      // Create a new verification record with all soldier's equipment
      const items: VerificationItemData[] = equipment.soldier.equipment.map((eq) => ({
        equipmentId: eq.id,
        equipmentType: eq.type,
        serialNumber: eq.serialNumber,
        verified: eq.id === equipmentId, // Only the target item is verified
      }));

      const verification = await prisma.verification.create({
        data: {
          soldierId,
          timestamp: now,
          date: dateStr,
          items: JSON.parse(JSON.stringify(items)),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'פריט אומת בהצלחה',
        verificationId: verification.id,
      });
    }
  } catch (error) {
    console.error('Error verifying inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to verify item' },
      { status: 500 }
    );
  }
}
