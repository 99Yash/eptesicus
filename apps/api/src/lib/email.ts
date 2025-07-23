import { Resend } from 'resend';
import { env } from '../env';
import { AppError } from './error';

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await resend.emails.send({
      from: 'Eptesicus <yashgouravkar@gmail.com>',
      to: [to],
      subject: subject,
      html: html,
    });
  } catch (error) {
    throw new AppError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to send email to ${to}: Subject: ${subject}`,
      cause: error,
    });
  }
};
