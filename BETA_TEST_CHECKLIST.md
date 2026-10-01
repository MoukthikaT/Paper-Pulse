# PaperPulse — Beta Testing & QA Verification Checklist

This manual verification checklist covers all end-to-end user journeys, modules, security edge cases, and multi-device viewports for validating PaperPulse before and during the public beta.

---

## 1. Account & Authentication

- [ ] **Registration**:
  - [ ] Register with valid name, email, and password (min 6 chars) -> Successfully creates account and auto-allocates ₹100,000 virtual cash.
  - [ ] Register with duplicate email -> Rejects with clear "User with this email already exists" message.
  - [ ] Register with short password (< 6 chars) -> Shows validation warning.
- [ ] **Login & Session**:
  - [ ] Login with valid credentials -> Directs to Overview Dashboard.
  - [ ] Login with incorrect password -> Rejects with "Invalid email or password".
  - [ ] Rate limiting -> 30+ rapid invalid login attempts triggers 15-minute temporary rate-limit cooldown.
- [ ] **Logout & Re-Login**:
  - [ ] Logout clears session token and redirects to `/welcome`.
  - [ ] Re-login accurately restores previous wallet balance, portfolio holdings, and trade history.

---

## 2. Market Exploration & Telemetry

- [ ] **Markets Screener (`/markets`)**:
  - [ ] Displays all 5 stocks (`TCS`, `INFOSYS`, `HDFC`, `SBI`, `TATAPOWER`) with spot prices and 30D change percentages.
  - [ ] Filter by signal (`ALL`, `BUY`, `SELL`, `HOLD`) updates table properly.
  - [ ] Search input accurately filters stocks by ticker name.
  - [ ] Direct click on a stock row routes to `/trade?symbol=TICKER`.
- [ ] **Stock Comparison (`/compare`)**:
  - [ ] Compare any two stocks side-by-side with normalized performance charts and fundamental valuation metrics.

---

## 3. Paper Trading Execution Terminal (`/trade`)

- [ ] **Manual BUY Order**:
  - [ ] Select stock (e.g. `TCS`), enter valid quantity (e.g. `10`), click Preview Order.
  - [ ] Order preview modal displays total cost, cash impact, strategy tag selector, and risk disclaimer.
  - [ ] Confirmed BUY immediately deducts wallet cash, creates portfolio holding, and writes trade log.
  - [ ] Audio feedback (audio chime) plays on successful order.
- [ ] **Manual SELL Order**:
  - [ ] Enter quantity up to owned shares (e.g. `5`), preview, and execute.
  - [ ] Proceeds credited back to wallet; realized P/L calculated accurately.
  - [ ] Attempting to sell more shares than owned displays "Insufficient shares" error and disables order submission.
- [ ] **Validation Guardrails**:
  - [ ] Attempting to buy with quantity exceeding wallet balance displays "Insufficient balance" error.
  - [ ] Negative or zero quantities rejected by form validation.

---

## 4. AI Machine Learning Telemetry & Honesty

- [ ] **Signal Card Telemetry**:
  - [ ] When Python FastAPI service is online: Card displays `AI MODEL (TRAINED)` badge, model type (`RandomForestClassifier`, `LogisticRegression`, etc.), and calibrated confidence percentage.
  - [ ] When Python FastAPI service is offline: Card displays `HEURISTIC FALLBACK` badge with amber warning explaining that Python ML is offline and signal is rule-based.
  - [ ] Expanding "Why this signal?" displays momentum score, trend score, and RSI factors.
- [ ] **AI Copilot & Explanations**:
  - [ ] Clicking AI Chat launcher opens interactive financial concept explainer.
  - [ ] Explanations accurately describe technical terms (`P/E Ratio`, `SMA 20`, `RSI`, `Realized P/L`) without promising real-world returns.

---

## 5. Portfolio & Journal

- [ ] **Portfolio Valuation (`/portfolio`)**:
  - [ ] Total portfolio value equals `Cash Balance + Sum of (Holding Qty * Spot Price)`.
  - [ ] Unrealized P/L updates dynamically based on current market close price.
  - [ ] Weighted average purchase cost updates correctly after multiple buy orders.
- [ ] **Trade Journal (`/journal`)**:
  - [ ] All executed trades appear in reverse chronological order.
  - [ ] Editing journal notes, reflection lessons, and tags saves successfully.
  - [ ] Filter trades by strategy tag or search query.

---

## 6. Advanced Educational Labs

- [ ] **Strategy Lab (`/strategy-lab`)**:
  - [ ] Select strategy (`AI Momentum`, `SMA Crossover`, `Mean Reversion`), configure fast/slow periods.
  - [ ] Backtest computes historical equity curve against Buy & Hold benchmark without lookahead bias.
- [ ] **Risk Lab (`/risk-lab`)**:
  - [ ] Adjust capital-at-risk slider (1% to 5%) and stop-loss percentage.
  - [ ] Position sizer calculates exact recommended share count.
  - [ ] What-If stress test scenarios (±5%, ±10%) calculate portfolio equity impact.
- [ ] **Decision Lab (`/decision-lab`)**:
  - [ ] Historical blind candle replay challenge loads hidden next-day price movement.
  - [ ] Submitting user prediction reveals outcome, compares against AI prediction, and calculates decision accuracy score.
- [ ] **Market Replay (`/market-replay`)**:
  - [ ] Interactive timeline progression plays historical market sessions candle by candle.
- [ ] **FinQuest Quiz (`/learn`)**:
  - [ ] Complete educational quiz questions on risk management, valuation, and market mechanics.

---

## 7. Multi-User Isolation & Security Verification

- [ ] **Cross-User Data Isolation**:
  - [ ] Register **User A** -> Buy 10 TCS.
  - [ ] In incognito window, register **User B** -> Verify User B wallet is ₹100,000 and portfolio is empty.
  - [ ] User B attempting to sell TCS shares receives "Insufficient holdings" error.
  - [ ] User B cannot view User A's trade journal or portfolio via direct API queries.

---

## 8. Mobile & Cross-Browser Viewport Testing

- [ ] **Desktop Viewport (1920x1080 / 1440x900)**: Full dashboard grid, navigation sidebar, charts.
- [ ] **Tablet Viewport (768px - 1024px)**: Responsive sidebar collapse, horizontal scrolling data tables.
- [ ] **Mobile Viewport (375px - 425px)**: Hamburger navigation drawer, stacked metric cards, touch-friendly order inputs.
- [ ] **Direct URL Refresh**: Refreshing browser on `/markets`, `/trade`, `/portfolio`, `/strategy-lab` loads page cleanly without 404 errors.
