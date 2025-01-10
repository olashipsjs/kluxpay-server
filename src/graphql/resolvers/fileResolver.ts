import path from 'path';
import random from '../../utils/random';
import { supabase } from '../../libs/supabase';
import handleError from '../../utils/handleError';
import { GraphQLUpload } from 'graphql-upload-ts';
import File, { FileDocument } from '../../models/file';
import bearerAuthorization from '../../middlewares/bearerAuthorization';

const fileResolver = {
  Upload: GraphQLUpload,

  File: {
    uploadedBy: async (parent: FileDocument) => {
      try {
        const file = await File.findById(parent._id).populate({
          path: 'uploadedBy',
          select: '-password',
        });

        return file?.uploadedBy;
      } catch (error) {
        handleError(error);
      }
    },
  },

  Mutation: {
    uploadFile: async (_: any, variables: any, { req }: any) => {
      const { file } = variables;

      if (!file) {
        throw new Error('No file uploaded');
      }

      try {
        const loggedInUser = await bearerAuthorization(req);

        const { filename, mimetype, createReadStream } = await file;

        const fileStream = createReadStream();

        const RANDOM_STR = random.string(8);
        const FILE_EXTENSION = path.extname(filename);
        const UNIQUE_FILE_NAME = `${loggedInUser.id}-${RANDOM_STR}${FILE_EXTENSION}`;

        // Upload the file to Supabase
        const { data, error } = await supabase.storage
          .from('kluxpay bucket')
          .upload(UNIQUE_FILE_NAME, fileStream, {
            contentType: mimetype,
            duplex: 'half',
          });

        if (error) {
          throw new Error(error.message);
        }

        // Get the public URL
        const { data: upload } = supabase.storage
          .from('kluxpay bucket')
          .getPublicUrl(data.path);

        if (!upload.publicUrl) {
          throw new Error('Failed to generate public URL');
        }

        const fileDocument = await File.create({
          mimetype,
          url: upload.publicUrl,
          filename: UNIQUE_FILE_NAME,
          uploadedBy: loggedInUser.id,
        });

        return fileDocument;
      } catch (error) {
        handleError(error);
        throw new Error('File upload failed');
      }
    },
  },
};

export default fileResolver;
