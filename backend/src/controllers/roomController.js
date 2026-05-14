const prisma = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');
const { RoomStatus } = require('@prisma/client');

const createRoom = asyncHandler(async (req, res) => {
  const { name, description, startTime, endTime, maxParticipants } = req.body;
  const teacherId = req.user.id;

  const room = await prisma.room.create({
    data: {
      name,
      description,
      teacherId,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      maxParticipants: maxParticipants || 50,
    },
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  logger.info(`Room created: ${room.id} by teacher ${teacherId}`);

  res.status(201).json({
    success: true,
    data: room,
  });
});

const getRooms = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const userId = req.user.id;
  const userRole = req.user.role;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {};

  if (status) {
    where.status = status;
  }

  if (userRole === 'STUDENT') {
    where.enrollments = {
      some: {
        userId,
      },
    };
  } else if (userRole === 'TEACHER') {
    where.teacherId = userId;
  }

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.room.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      rooms,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

const getRoomById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
      enrollments: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      files: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      recordings: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found',
    });
  }

  res.json({
    success: true,
    data: room,
  });
});

const updateRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, startTime, endTime, maxParticipants, status } = req.body;

  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found',
    });
  }

  if (room.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this room',
    });
  }

  const updatedRoom = await prisma.room.update({
    where: { id },
    data: {
      name,
      description,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      maxParticipants,
      status,
    },
  });

  logger.info(`Room updated: ${id}`);

  res.json({
    success: true,
    data: updatedRoom,
  });
});

const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found',
    });
  }

  if (room.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this room',
    });
  }

  await prisma.room.delete({
    where: { id },
  });

  logger.info(`Room deleted: ${id}`);

  res.json({
    success: true,
    message: 'Room deleted successfully',
  });
});

const enrollStudent = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { studentId } = req.body;

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found',
    });
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      roomId,
      userId: studentId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  logger.info(`Student ${studentId} enrolled in room ${roomId}`);

  res.status(201).json({
    success: true,
    data: enrollment,
  });
});

const startClass = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found',
    });
  }

  if (room.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to start this class',
    });
  }

  const updatedRoom = await prisma.room.update({
    where: { id },
    data: {
      status: RoomStatus.ACTIVE,
      startTime: new Date(),
    },
  });

  logger.info(`Class started: ${id}`);

  res.json({
    success: true,
    data: updatedRoom,
  });
});

const endClass = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found',
    });
  }

  if (room.teacherId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to end this class',
    });
  }

  const updatedRoom = await prisma.room.update({
    where: { id },
    data: {
      status: RoomStatus.ENDED,
      endTime: new Date(),
    },
  });

  logger.info(`Class ended: ${id}`);

  res.json({
    success: true,
    data: updatedRoom,
  });
});

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  enrollStudent,
  startClass,
  endClass,
};
