import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [teamsRes, playersRes, auctionsRes] = await Promise.all([
          api.get('/teams'),
          api.get('/players'),
          api.get('/auctions'),
        ]);
        setTeams(teamsRes.data);
        setPlayers(playersRes.data);
        setAuctions(auctionsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(
    () => ({
      teams: teams.length,
      players: players.length,
      auctions: auctions.length,
      activePlayers: players.filter((p) => p.status === 'active').length,
    }),
    [teams, players, auctions]
  );

  if (!authLoading && (!user || user.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>Admin Dashboard</h1>
        <Link to="/auction">Go to auction room</Link>
      </header>

      {dataLoading && <p>Loading data...</p>}
      {error && <p className="error-text">{error}</p>}

      <section className="grid grid--stats">
        <article>
          <p>Teams</p>
          <strong>{stats.teams}</strong>
        </article>
        <article>
          <p>Players</p>
          <strong>{stats.players}</strong>
        </article>
        <article>
          <p>Active lots</p>
          <strong>{stats.activePlayers}</strong>
        </article>
        <article>
          <p>Auctions</p>
          <strong>{stats.auctions}</strong>
        </article>
      </section>

      <section>
        <h2>Teams</h2>
        <div className="table">
          <div className="table__row table__row--header">
            <span>Name</span>
            <span>Budget</span>
            <span>Remaining</span>
          </div>
          {teams.map((team) => (
            <div className="table__row" key={team._id}>
              <span>{team.name}</span>
              <span>{team.budget}</span>
              <span>{team.remainingBudget}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

