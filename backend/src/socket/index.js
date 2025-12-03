const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-auction', (auctionId) => {
      socket.join(`auction-${auctionId}`);
    });

    socket.on('leave-auction', (auctionId) => {
      socket.leave(`auction-${auctionId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = registerSocketHandlers;



