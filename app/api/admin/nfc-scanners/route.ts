import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const status = searchParams.get('status');
    const isActive = searchParams.get('isActive');

    // Build query string
    const queryParams = new URLSearchParams({
      page,
      limit
    });

    if (status) queryParams.append('status', status);
    if (isActive) queryParams.append('isActive', isActive);

    // Call your backend API
    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/api/devices/admin/scanners?${queryParams.toString()}`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Admin NFC scanners fetch error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}