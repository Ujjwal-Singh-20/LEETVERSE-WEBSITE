import { cloudinary } from '../config/cloudinary';
import { ERROR_CODES } from '../constants/errorCodes';
import { AppError } from '../middlewares/error.middleware';

export class CloudinaryService {
  async uploadBuffer(
    buffer: Buffer,
    folder: string = 'leetverse'
  ): Promise<{ url: string; secureUrl: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            return reject(
              new AppError(500, ERROR_CODES.UPLOAD_FAILED, 'Image upload to Cloudinary failed.')
            );
          }
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      stream.end(buffer);
    });
  }

  async uploadMultipleBuffers(
    files: Express.Multer.File[],
    folder: string = 'leetverse'
  ): Promise<string[]> {
    const uploads = files.map((file) => this.uploadBuffer(file.buffer, folder));
    const results = await Promise.all(uploads);
    return results.map((r) => r.secureUrl);
  }
}

export const cloudinaryService = new CloudinaryService();
