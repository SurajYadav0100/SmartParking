let io = null;

const initSocket = (socketIoInstance) => {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    // console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    // Join user-specific room if authenticated
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Join staff/admin operational room
    socket.on('join_staff_room', () => {
      socket.join('staff_admin');
    });

    socket.on('disconnect', () => {
      // console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => io;

const emitSlotUpdated = (slot) => {
  if (io) {
    io.emit('slot_updated', slot);
  }
};

const emitSessionStarted = (data) => {
  if (io) {
    io.emit('session_started', data);
  }
};

const emitSessionEnded = (data) => {
  if (io) {
    io.emit('session_ended', data);
  }
};

const emitStatsUpdated = (stats) => {
  if (io) {
    io.emit('stats_updated', stats);
  }
};

const emitNotificationToUser = (userId, notification) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit('notification', notification);
  }
};

const emitBroadcastNotification = (notification) => {
  if (io) {
    io.emit('notification', notification);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitSlotUpdated,
  emitSessionStarted,
  emitSessionEnded,
  emitStatsUpdated,
  emitNotificationToUser,
  emitBroadcastNotification
};
