import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      status: 'success',
      message: 'Logged out successfully'
    });

    // Clear the JWT token cookie
    response.cookies.set({
      name: 'admin-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}