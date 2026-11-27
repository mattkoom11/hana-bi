import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_AUDIENCE_ID, WAITLIST_NOTIFY_EMAIL } from '@/lib/env';
import { escapeHtml } from '@/lib/escape-html';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';
import { isPlausibleEmail } from '@/lib/email-address';

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

  if (!isPlausibleEmail(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  // The caller-supplied name never goes into the email sent to the submitted address:
  // anyone can submit any address, so that text would let strangers send messages from our
  // domain. It only reaches our own notification, capped and escaped.
  const cleanName = typeof name === 'string' ? name.trim().slice(0, 80) : '';
  const safeName = escapeHtml(cleanName || email);
  const safeEmail = escapeHtml(email);

  // At most one confirmation per address per day, so repeat submissions cannot be used to
  // flood someone's inbox from our domain.
  const firstTimeToday = !isRateLimited(`waitlist:to:${email.toLowerCase()}`, 1, 24 * 60 * 60 * 1000);

  const resend = getResend();

  // Add to Resend audience for tracking if configured
  if (RESEND_AUDIENCE_ID) {
    await resend.contacts.create({
      email,
      firstName: cleanName || undefined,
      audienceId: RESEND_AUDIENCE_ID,
      unsubscribed: false,
    });
  }

  if (!firstTimeToday) return NextResponse.json({ success: true });

  await resend.emails.send({
    from: 'Hana-Bi <hello@hanabiny.com>',
    to: email,
    subject: "You're on the Hana-Bi drop list",
    html: `<p>Hi,</p><p>You're on the waitlist for Layered Denim. We'll notify you when it drops.</p><p>— Hana-Bi Studio</p>`,
  });

  if (WAITLIST_NOTIFY_EMAIL) {
    await resend.emails.send({
      from: 'Hana-Bi Waitlist <hello@hanabiny.com>',
      to: WAITLIST_NOTIFY_EMAIL,
      subject: `New waitlist signup: ${email}`,
      html: `<p><strong>${safeName}</strong> (${safeEmail}) joined the Layered Denim waitlist.</p>`,
    });
  }

  return NextResponse.json({ success: true });
}
