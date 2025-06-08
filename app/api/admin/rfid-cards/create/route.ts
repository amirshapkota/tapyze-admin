import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Not authenticated' 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cardUid, pin, expiryDate, customerId } = body;

    // Validate required fields
    if (!cardUid || !pin || !expiryDate) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Card UID, PIN, and expiry date are required' 
        },
        { status: 400 }
      );
    }

    // Validate PIN format
    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'PIN must be 4-6 digits' 
        },
        { status: 400 }
      );
    }

    let endpoint;
    let payload;

    if (customerId && customerId !== 'unassigned') {
      // Assign card to specific customer
      endpoint = `${process.env.BACKEND_URL}/api/devices/admin/cards/assign/${customerId}`;
      payload = { cardUid, pin };
    } else {
      // Create unassigned card (you might need to add this endpoint to your backend)
      endpoint = `${process.env.BACKEND_URL}/api/devices/admin/cards/create`;
      payload = { cardUid, pin, expiryDate };
    }

    // Call your backend API
    const backendResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Create RFID card error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}