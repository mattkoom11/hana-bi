import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { RESEND_API_KEY, WAITLIST_NOTIFY_EMAIL } from '@/lib/env';
import { escapeHtml } from '@/lib/escape-html';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (_resend) return _resend;
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  _resend = new Resend(RESEND_API_KEY);
  return _resend;
}

export async function POST(request: NextRequest) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }

  if (isRateLimited(`contact:${getClientIp(request)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
  }

  let body: { name: string; email: string; message: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email, message } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const resend = getResend();
  const notifyTo = WAITLIST_NOTIFY_EMAIL ?? 'hello@hanabiny.com';

  await resend.emails.send({
    from: 'Hana-Bi <hello@hanabiny.com>',
    to: notifyTo,
    replyTo: email,
    subject: `Message from ${name}`,
    html: `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `,
  });

  return NextResponse.json({ success: true });
}
