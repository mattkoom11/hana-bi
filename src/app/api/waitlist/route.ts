import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_AUDIENCE_ID, WAITLIST_NOTIFY_EMAIL } from '@/lib/env';
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

  if (isRateLimited(`waitlist:${getClientIp(request)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let body: { name?: string; email: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const displayName = escapeHtml(name?.trim() || email);
  const safeEmail = escapeHtml(email);

  const resend = getResend();

  // Add to Resend audience for tracking if configured
  if (RESEND_AUDIENCE_ID) {
    await resend.contacts.create({
      email,
      firstName: name?.trim() || undefined,
      audienceId: RESEND_AUDIENCE_ID,
      unsubscribed: false,
    });
  }

  await resend.emails.send({
    from: 'Hana-Bi <hello@hanabiny.com>',
    to: email,
    subject: "You're on the Hana-Bi drop list",
    html: `<p>Hi ${displayName},</p><p>You're on the waitlist for Layered Denim. We'll notify you when it drops.</p><p>— Hana-Bi Studio</p>`,
  });

  if (WAITLIST_NOTIFY_EMAIL) {
    await resend.emails.send({
      from: 'Hana-Bi Waitlist <hello@hanabiny.com>',
      to: WAITLIST_NOTIFY_EMAIL,
      subject: `New waitlist signup: ${email}`,
      html: `<p><strong>${displayName}</strong> (${safeEmail}) joined the Layered Denim waitlist.</p>`,
    });
  }

  return NextResponse.json({ success: true });
}
