import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const TeamDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const teamId =
        typeof user?.team === 'string' ? user.team : user?.team?._id;
      if (!teamId) {
        setDataLoading(false);
        return;
      }
      try {
        const [teamRes, playersRes] = await Promise.all([
          api.get(`/teams/${teamId}`),
          api.get('/players'),
        ]);
        setTeam(teamRes.data);
        setPlayers(playersRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load team data');
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, [user?.team]);

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.team) {
    return (
      <div className="page">
        <p>You need to belong to a team to view this dashboard.</p>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="page">
        <p>Loading team info...</p>
      </div>
    );
  }

  const leadingPlayers = team
    ? players.filter(
        (player) =>
          (typeof player.currentBidder === 'string'
            ? player.currentBidder
            : player.currentBidder?._id) === team._id
      )
    : [];

  return (
    <div className="page">
      <h1>Team Dashboard</h1>
      {error && <p className="error-text">{error}</p>}
      {team && (
        <section className="card">
          <p>
            <strong>{team.name}</strong>
          </p>
          <p>Budget: {team.budget}</p>
          <p>Remaining: {team.remainingBudget}</p>
        </section>
      )}

      <section>
        <h2>Won / leading players</h2>
        {team && leadingPlayers.length > 0 ? (
          <ul>
            {leadingPlayers.map((player) => (
              <li key={player._id}>
                {player.name} — {player.currentBid} ({player.status})
              </li>
            ))}
          </ul>
        ) : (
          <p>No leading bids yet.</p>
        )}
      </section>
    </div>
  );
};

export default TeamDashboard;

