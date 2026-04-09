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

  let body: { name: string; email: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const resend = getResend();

  await resend.emails.send({
    from: 'Hana-Bi <hello@hana-bi.com>',
    to: email,
    subject: "You're on the Hana-Bi drop list",
    html: `<p>Hi ${name},</p><p>You're on the waitlist for Layered Denim. We'll notify you when it drops.</p><p>— Hana-Bi Studio</p>`,
  });

  if (WAITLIST_NOTIFY_EMAIL) {
    await resend.emails.send({
      from: 'Hana-Bi Waitlist <hello@hana-bi.com>',
      to: WAITLIST_NOTIFY_EMAIL,
      subject: `New waitlist signup: ${name}`,
      html: `<p><strong>${name}</strong> (${email}) joined the Layered Denim waitlist.</p>`,
    });
  }

  return NextResponse.json({ success: true });
}
