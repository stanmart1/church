import { body, param, query, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Auth validations
export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

export const validateRegister = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  validate
];

// User validations
export const validateUserId = [
  param('userId').notEmpty().withMessage('Valid user ID required'),
  validate
];

export const validateUpdateUser = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  validate
];

// Content validations
export const validateContent = [
  body('value').trim().notEmpty().withMessage('Content value is required'),
  validate
];

export const validateServiceTime = [
  body('day').isIn(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).withMessage('Valid day required'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
  body('service').trim().isLength({ min: 2 }).withMessage('Service name required'),
  body('description').optional().trim(),
  validate
];

// Password change validation
export const validatePasswordChange = [
  body('current_password').notEmpty().withMessage('Current password required'),
  body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  validate
];

// Giving validations
export const validateGiving = [
  body('member_id').isUUID().withMessage('Valid member ID required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('type').isIn(['tithe', 'offering', 'missions', 'building_fund', 'special'])
    .withMessage('Invalid giving type'),
  body('method').isIn(['cash', 'check', 'online', 'card'])
    .withMessage('Invalid payment method'),
  body('date').optional().isISO8601().withMessage('Valid date required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long'),
  validate
];

// Sermon validations
export const validateSermon = [
  body('title').trim().isLength({ min: 3, max: 255 })
    .withMessage('Title must be 3-255 characters'),
  body('speaker').trim().isLength({ min: 2, max: 100 })
    .withMessage('Speaker name required'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('duration').optional().isInt({ min: 0 })
    .withMessage('Duration must be positive integer'),
  body('series_id').optional().isUUID().withMessage('Valid series ID required'),
  body('description').optional().trim().isLength({ max: 2000 })
    .withMessage('Description too long'),
  body('tags').optional().trim(),
  validate
];

export const validateSermonUpdate = [
  param('id').isUUID().withMessage('Valid sermon ID required'),
  body('title').optional().trim().isLength({ min: 3, max: 255 })
    .withMessage('Title must be 3-255 characters'),
  body('speaker').optional().trim().isLength({ min: 2, max: 100 })
    .withMessage('Speaker name required'),
  body('date').optional().isISO8601().withMessage('Valid date required'),
  body('duration').optional().isInt({ min: 0 })
    .withMessage('Duration must be positive integer'),
  body('series_id').optional().isUUID().withMessage('Valid series ID required'),
  validate
];

// UUID param validation
export const validateUUID = [
  param('id').isUUID().withMessage('Valid UUID required'),
  validate
];

export const validateMemberId = [
  param('memberId').isUUID().withMessage('Valid member ID required'),
  validate
];

// Query param validations
export const validatePagination = [
  param('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  param('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  validate
];

export const validateYear = [
  param('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Valid year required'),
  validate
];
