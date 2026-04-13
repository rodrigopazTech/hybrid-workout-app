import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('token');
  const days = parseInt(searchParams.get('days') || '1');

  if (!accessToken) return NextResponse.json({ error: 'Token missing' }, { status: 400 });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endRange = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endRange.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return NextResponse.json(response.data.items || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('token');
  const body = await request.json();
  const { eventId, start, end, summary } = body;

  if (!accessToken || !eventId) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: {
        summary,
        start: start ? { dateTime: start, timeZone: 'America/Mexico_City' } : undefined,
        end: end ? { dateTime: end, timeZone: 'America/Mexico_City' } : undefined,
      }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}
