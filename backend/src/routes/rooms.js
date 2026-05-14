const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const roomController = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

router.use(authenticate);

router.post(
  '/',
  authorize('TEACHER', 'ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Room name is required'),
    body('description').optional().trim(),
    body('startTime').optional().isISO8601(),
    body('endTime').optional().isISO8601(),
    body('maxParticipants').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  roomController.createRoom
);

router.get('/', roomController.getRooms);

router.get('/:id', roomController.getRoomById);

router.put(
  '/:id',
  authorize('TEACHER', 'ADMIN'),
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('startTime').optional().isISO8601(),
    body('endTime').optional().isISO8601(),
    body('maxParticipants').optional().isInt({ min: 1, max: 100 }),
    body('status').optional().isIn(['SCHEDULED', 'ACTIVE', 'ENDED']),
  ],
  validate,
  roomController.updateRoom
);

router.delete('/:id', authorize('TEACHER', 'ADMIN'), roomController.deleteRoom);

router.post('/:roomId/enroll', authorize('TEACHER', 'ADMIN'), roomController.enrollStudent);

router.post('/:id/start', authorize('TEACHER', 'ADMIN'), roomController.startClass);

router.post('/:id/end', authorize('TEACHER', 'ADMIN'), roomController.endClass);

module.exports = router;
