import render from '../libs/render';
import mail from '../services/mail';

type SendMailPayload = {
  template: string;
  subject: string;
  recipients: string;
  data?: { [key: string]: string };
};

const mailResolver = {
  Mutation: {
    sendMail: async (_: any, { payload }: { payload: SendMailPayload }) => {
      const { template, subject, recipients, data } = payload;

      try {
        await mail.send({
          subject,
          recipients,
          html: render(template, data),
        });

        return { isSuccess: true };
      } catch (error) {
        console.log((error as Error).message);
        throw new Error((error as Error).message);
      }
    },
  },
};

export default mailResolver;
