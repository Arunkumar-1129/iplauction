# IPL/CPL Auction Frontend (HTML/CSS/JS)

Pure static frontend with pages for Players, Teams, Auction Room, Projector, Summary, and Admin. Uses in-memory store and sample data for quick testing; ready to wire to backend APIs later.

## Pages
- `index.html`: Dashboard and navigation
- `players.html`: List/import/add players
- `teams.html`: Manage teams and budgets
- `auction.html`: Live bidding UI with timer, highest bid, log; call `sellCurrent()` in console to mark sold and move next
- `projector.html`: Read-only large view for display
- `summary.html`: Purchases summary + CSV export + print
- `admin.html`: Admin-only management (teams with purse, players panel, manual bidding and finalization)

## Quick Try
1. Open `players.html`; click **Import JSON** to load `data/sample.json`.
2. Open `teams.html`; add a few teams or rely on sample.
3. Open `auction.html`; select a team, enter amount, **Place Bid**; when ready, run `sellCurrent()`.
4. Open `summary.html`; export CSV or print.
5. Admin flow: open `admin.html`; set Initial Purse, add teams/players; select a player, **Start Bidding**, enter **Update Bid** for teams, then **Finalize Sale** to deduct purse and mark player sold.

## Notes
- All data held in memory (per tab). For multi-user and persistence, connect `js/api.js` to your backend (REST/WebSocket).
- Budget enforcement: basic check prevents bids exceeding remaining budget.
- Styling is projector-friendly and responsive.
- Admin page supports Save/Load to localStorage and JSON export/import.
