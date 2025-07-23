import { Resend } from 'resend';
import { env } from '../env';

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  const res = await resend.emails.send({
    from: 'Eptesicus <yashgouravkar@gmail.com>',
    to: [to],
    subject: subject,
    html: html,
  });
};
