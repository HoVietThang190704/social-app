import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/httpStatus';

export function requireFile(fieldName: string = 'avatar') {
  return (req: Request, res: Response, next: NextFunction) => {
    const file = (req as any).file;
    if (!file) {
      return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: `Vui lòng chọn file ${fieldName}` });
    }
    return next();
  };
}

export function requireFiles(fieldName: string = 'images', min = 1, max = 10) {
  return (req: Request, res: Response, next: NextFunction) => {
    const files = (req as any).files as Express.Multer.File[] | undefined;
    if (!files || files.length < min) {
      return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: `Vui lòng tải lên ít nhất ${min} file ${fieldName}` });
    }
    if (files.length > max) {
      return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: `Tối đa ${max} file ${fieldName} được phép` });
    }
    return next();
  };
}
