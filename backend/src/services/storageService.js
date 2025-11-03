import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import { UPLOAD } from '../config/constants.js';
import { createFileFilter, sanitizeFilename } from '../middleware/fileValidation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDevelopment = process.env.NODE_ENV !== 'production';
const STORAGE_BASE = isDevelopment ? 'uploads' : '/app/storage';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subPath = file.fieldname === 'audio' ? 'sermons/audio' : 'sermons/thumbnails';
    const uploadPath = path.join(STORAGE_BASE, subPath);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const sanitized = sanitizeFilename(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(sanitized);
    cb(null, uniqueSuffix + ext);
  }
});

const fieldConfig = {
  audio: { allowedTypes: UPLOAD.ALLOWED_AUDIO_TYPES },
  thumbnail: { allowedTypes: UPLOAD.ALLOWED_IMAGE_TYPES }
};

const uploader = multer({
  storage,
  limits: { 
    fileSize: UPLOAD.MAX_AUDIO_SIZE,
    files: 2
  },
  fileFilter: createFileFilter(fieldConfig)
});

export const uploadAudio = uploader.single('audio');
export const uploadThumbnail = uploader.single('thumbnail');
export const uploadSermonFiles = uploader.fields([{ name: 'audio', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]);
export const serveFiles = express.static(STORAGE_BASE);
