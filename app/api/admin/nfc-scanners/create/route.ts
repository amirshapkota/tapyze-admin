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
    const { deviceId, model, firmwareVersion, merchantId } = body;

    // Validate required fields
    if (!deviceId || !model) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Device ID and model are required' 
        },
        { status: 400 }
      );
    }

    let endpoint;
    let payload;

    if (merchantId && merchantId !== 'unassigned') {
      // Assign scanner to specific merchant
      endpoint = `${process.env.BACKEND_URL}/api/devices/admin/scanners/assign/${merchantId}`;
      payload = { 
        deviceId, 
        model, 
        firmwareVersion: firmwareVersion || undefined 
      };
    } else {
      // Create unassigned scanner (you might need to add this endpoint to your backend)
      endpoint = `${process.env.BACKEND_URL}/api/devices/admin/scanners/create`;
      payload = { 
        deviceId, 
        model, 
        firmwareVersion: firmwareVersion || undefined 
      };
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
    console.error('Create NFC scanner error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}