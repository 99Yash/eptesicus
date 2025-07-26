import { Resend } from 'resend';
import { env } from '../env';
import { AppError } from './error';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Eptesicus <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
    });

    if (error) {
      throw new AppError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to send email to ${to}: Subject: ${subject}`,
        cause: error,
      });
    }
  } catch (error) {
    throw new AppError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to send email to ${to}: Subject: ${subject}`,
      cause: error,
    });
  }
}
