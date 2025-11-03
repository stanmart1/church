import path from 'path';
import { UPLOAD, MIME_TO_EXT } from '../config/constants.js';

export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+/, '')
    .substring(0, 255);
};

export const validateFileType = (allowedTypes) => {
  return (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`));
    }

    file.originalname = sanitizeFilename(file.originalname);

    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = MIME_TO_EXT[file.mimetype] || [];
    
    if (allowedExts.length > 0 && !allowedExts.includes(ext)) {
      return cb(new Error('File extension does not match MIME type'));
    }

    cb(null, true);
  };
};

export const createFileFilter = (fieldConfig) => {
  return (req, file, cb) => {
    const config = fieldConfig[file.fieldname];
    
    if (!config) {
      return cb(new Error('Invalid field name'));
    }

    if (!config.allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid ${file.fieldname} type. Allowed: ${config.allowedTypes.join(', ')}`));
    }

    file.originalname = sanitizeFilename(file.originalname);

    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = MIME_TO_EXT[file.mimetype] || [];
    
    if (allowedExts.length > 0 && !allowedExts.includes(ext)) {
      return cb(new Error(`${file.fieldname} extension does not match MIME type`));
    }

    cb(null, true);
  };
};

export const validateFileSize = (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const files = req.files ? Object.values(req.files).flat() : [req.file];
  
  for (const file of files) {
    let maxSize = UPLOAD.MAX_FILE_SIZE;
    
    if (file.mimetype.startsWith('audio/')) {
      maxSize = UPLOAD.MAX_AUDIO_SIZE;
    } else if (file.mimetype.startsWith('video/')) {
      maxSize = UPLOAD.MAX_VIDEO_SIZE;
    }

    if (file.size > maxSize) {
      return res.status(413).json({ 
        error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB` 
      });
    }
  }

  next();
};
