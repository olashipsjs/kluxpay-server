import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  port: process.env.SMTP_PORT! as unknown as number,
  service: process.env.SMTP_HOST,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

type Args = {
  html: string;
  subject?: string;
  recipients: string;
};

const mailService = {
  send: async ({ html, subject, recipients }: Args) => {
    const options = {
      html,
      to: recipients,
      subject: subject,
      from: 'FluxPay LLC.',
    };

    try {
      const info = await transporter.sendMail(options);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.log((error as Error).message);
      throw new Error((error as Error).message);
    }
  },
};

export default mailService;
