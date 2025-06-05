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

    // just verify the token exists and is valid
    // call protected admin endpoint to verify the token
    // eg get admin list (just to verify token, not use the data)
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/admin/admins`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      // If token is invalid, clear the cookie
      const response = NextResponse.json(
        { status: 'error', message: 'Invalid token' }, 
        { status: 401 }
      );
      response.cookies.set({
        name: 'admin-token',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      return response;
    }

    // Since no admin profile data from this endpoint,
    // return a success response indicating the token is valid
    return NextResponse.json({
      status: 'success',
      message: 'Token is valid',
      data: {
        authenticated: true
      }
    });

  } catch (error) {
    console.error('Admin me error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}