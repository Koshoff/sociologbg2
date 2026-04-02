import { Resend } from 'resend';
import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, email, message } = await req.json();
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'ivo.koshov@gmail.com',
      subject: `Ново съобщение от ${name}`,
      html: `
        <p><strong>Име:</strong> ${name}</p>
        <p><strong>Имейл:</strong> ${email}</p>
        <p><strong>Съобщение:</strong> ${message}</p>
      `,
    });
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
