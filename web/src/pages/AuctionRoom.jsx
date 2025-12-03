import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import PlayerCard from '../components/PlayerCard.jsx';
import BidForm from '../components/BidForm.jsx';
import BudgetDisplay from '../components/BudgetDisplay.jsx';

const AuctionRoom = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { socket } = useSocket();
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    api
      .get('/players')
      .then((res) => {
        setPlayers(res.data);
      })
      .catch(() =>
        setStatus('Unable to load players. Please refresh after logging in.')
      );
    const teamId =
      typeof user?.team === 'string' ? user.team : user?.team?._id;
    if (teamId) {
      api.get(`/teams/${teamId}`).then((res) => setTeamInfo(res.data));
    }
  }, [user?.team]);

  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      setPlayers((prev) =>
        prev.map((player) =>
          player._id === payload.playerId
            ? {
                ...player,
                currentBid: payload.amount,
                currentBidder: payload.teamId,
              }
            : player
        )
      );
      if (teamInfo && payload.teamId === teamInfo._id) {
        setTeamInfo((prev) => ({
          ...prev,
          remainingBudget: payload.remainingBudget,
        }));
      }
    };
    socket.on('bid:update', handler);
    return () => socket.off('bid:update', handler);
  }, [socket, teamInfo]);

  const activePlayers = useMemo(
    () => players.filter((player) => player.status !== 'sold'),
    [players]
  );

  useEffect(() => {
    if (!selectedPlayer && activePlayers.length > 0) {
      setSelectedPlayer(activePlayers[0]);
    }
  }, [activePlayers, selectedPlayer]);

  const handleBid = async (amount) => {
    const teamId =
      typeof user?.team === 'string' ? user.team : user?.team?._id;
    if (!selectedPlayer || !teamId) return;
    try {
      await api.post('/bids', {
        amount,
        playerId: selectedPlayer._id,
        teamId,
      });
      setStatus('');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Bid failed');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <p>Loading auction...</p>
      </div>
    );
  }

  return (
    <div className="page page--auction">
      <header className="page__header">
        <div>
          <h1>Live Auction Room</h1>
          <p>All bids are virtual and budget restricted</p>
        </div>
        <BudgetDisplay team={teamInfo} />
      </header>

      <div className="auction-layout">
        <section>
          <h2>Players</h2>
          {activePlayers.length === 0 ? (
            <p>No active players at the moment.</p>
          ) : (
            <div className="grid grid--players">
              {activePlayers.map((player) => (
                <PlayerCard
                  key={player._id}
                  player={player}
                  isActive={selectedPlayer?._id === player._id}
                  onSelect={setSelectedPlayer}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2>Bid Panel</h2>
          {status && <p className="error-text">{status}</p>}
          <BidForm
            player={selectedPlayer}
            onSubmit={handleBid}
            disabled={!user?.team}
          />
        </section>
      </div>
    </div>
  );
};

export default AuctionRoom;

