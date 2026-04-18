import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { RESEND_API_KEY, WAITLIST_NOTIFY_EMAIL } from '@/lib/env';

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

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  await resend.emails.send({
    from: 'Hana-Bi <hello@hanabiny.com>',
    to: notifyTo,
    replyTo: email,
    subject: `Message from ${name}`,
    html: `
      <p><strong>Name:</strong> ${esc(name)}</p>
      <p><strong>Email:</strong> ${esc(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${esc(message).replace(/\n/g, '<br>')}</p>
    `,
  });

  return NextResponse.json({ success: true });
}
