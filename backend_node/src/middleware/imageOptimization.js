import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const ext = path.extname(req.file.originalname);
    const filename = path.basename(req.file.filename, ext);
    const outputPath = path.join(path.dirname(req.file.path), `${filename}.webp`);

    await sharp(req.file.path)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Delete original file
    fs.unlinkSync(req.file.path);

    // Update file info
    req.file.path = outputPath;
    req.file.filename = `${filename}.webp`;

    next();
  } catch (error) {
    console.error('Image optimization error:', error);
    next();
  }
};

export const optimizeThumbnail = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const ext = path.extname(req.file.originalname);
    const filename = path.basename(req.file.filename, ext);
    const outputPath = path.join(path.dirname(req.file.path), `${filename}.webp`);

    await sharp(req.file.path)
      .resize(400, 300, { fit: 'cover' })
      .webp({ quality: 75 })
      .toFile(outputPath);

    fs.unlinkSync(req.file.path);

    req.file.path = outputPath;
    req.file.filename = `${filename}.webp`;

    next();
  } catch (error) {
    console.error('Thumbnail optimization error:', error);
    next();
  }
};
