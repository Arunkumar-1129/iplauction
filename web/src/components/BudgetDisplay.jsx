const BudgetDisplay = ({ team }) => {
  if (!team) return null;
  return (
    <div className="budget-display">
      <p>
        Team: <strong>{team.name}</strong>
      </p>
      <p>
        Budget: {team.budget} | Remaining:{' '}
        <strong>{team.remainingBudget}</strong>
      </p>
    </div>
  );
};

export default BudgetDisplay;



