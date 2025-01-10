import render from '../../libs/render';
import mail from '../../services/mailService';

type SendMailVariables = {
  template: string;
  subject: string;
  recipients: string;
  data?: { [key: string]: string };
};

const mailResolver = {
  Mutation: {
    sendMail: async (_: any, variables: SendMailVariables) => {
      const { template, subject, recipients, data } = variables;

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
