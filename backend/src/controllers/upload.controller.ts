import { Response, NextFunction } from 'express';
import { cloudinaryService } from '../services/cloudinary.service';
import { ERROR_CODES } from '../constants/errorCodes';
import { AppError } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../types';

export class UploadController {
  /**
   * POST /api/admin/upload/single — Upload a single image file
   */
  async uploadSingle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'No image file uploaded.');
      }

      const folder = (req.query.folder as string) || 'leetverse';
      const result = await cloudinaryService.uploadBuffer(req.file.buffer, folder);

      res.status(200).json({
        url: result.secureUrl,
        publicId: result.publicId,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/upload/multiple — Upload multiple image files
   */
  async uploadMultiple(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'No image files uploaded.');
      }

      const folder = (req.query.folder as string) || 'leetverse';
      const urls = await cloudinaryService.uploadMultipleBuffers(files, folder);

      res.status(200).json({
        urls,
        count: urls.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
