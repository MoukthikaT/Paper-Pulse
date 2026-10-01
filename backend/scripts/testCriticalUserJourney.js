const mongoose = require('mongoose');
const app = require('../server');
const { connectDB } = require('../config/db');

async function runCriticalJourneyTest() {
  await connectDB();
  console.log('\n================================================================');
  console.log(' RUNNING CRITICAL USER JOURNEY & PRODUCTION VALIDATION TEST');
  console.log('================================================================\n');

  const PORT = 5095;
  const server = app.listen(PORT, async () => {
    const baseUrl = `http://localhost:${PORT}`;
    let totalTests = 0;
    let passedTests = 0;

    function assert(condition, message) {
      totalTests++;
      if (condition) {
        console.log(` ✅ PASS: ${message}`);
        passedTests++;
      } else {
        console.error(` ❌ FAIL: ${message}`);
        throw new Error(`Assertion Failed: ${message}`);
      }
    }

    const testEmail = `journey_trader_${Date.now()}@paperpulse.ai`;
    const testPassword = 'SecurePassword2026!';
    const testName = 'Aarav Sharma';
    let userToken = null;

    try {
      // 1. Clean User Registration
      console.log('1. Registering new educational trader account...');
      const regRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: testName, email: testEmail, password: testPassword })
      });
      const regData = await regRes.json();
      assert(regRes.status === 201, 'Registration returns HTTP 201 Created');
      assert(regData.success === true, 'Registration response success is true');
      assert(regData.data.email === testEmail, 'Email matches registered address');
      assert(regData.data.password === undefined, 'Password hash is strictly omitted from registration payload');

      // 2. User Authentication (Login)
      console.log('2. Authenticating trader account (POST /api/auth/login)...');
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword })
      });
      const loginData = await loginRes.json();
      assert(loginRes.status === 200, 'Login returns HTTP 200 OK');
      assert(loginData.data.token && loginData.data.token.length > 20, 'Cryptographic JWT bearer token issued');
      assert(loginData.data.user.email === testEmail, 'Authenticated user email matches');
      userToken = loginData.data.token;

      // 3. User Identity Profile Verification (/api/auth/me)
      console.log('3. Verifying user profile from token (/api/auth/me)...');
      const meRes = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const meData = await meRes.json();
      assert(meRes.status === 200, 'Profile fetch returns HTTP 200 OK');
      assert(meData.data.user.name === testName, 'Profile name matches');

      // 4. Initial Virtual Cash Allocation Check (/api/wallet)
      console.log('4. Checking initial virtual paper cash balance (/api/wallet)...');
      const walletRes = await fetch(`${baseUrl}/api/wallet`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const walletData = await walletRes.json();
      assert(walletRes.status === 200, 'Wallet query returns HTTP 200 OK');
      assert(walletData.data.balance === 100000, `Initial paper trading balance allocated at ₹100,000 (Actual: ₹${walletData.data.balance})`);

      // 5. Market Exploration (/api/stocks)
      console.log('5. Exploring supported market stocks (/api/stocks)...');
      const stocksRes = await fetch(`${baseUrl}/api/stocks`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const stocksData = await stocksRes.json();
      assert(stocksRes.status === 200, 'Market stocks list fetched successfully');
      assert(stocksData.data.includes('TCS') && stocksData.data.includes('INFOSYS'), 'Supported CSV stocks (TCS, INFOSYS) available');

      // 6. AI Machine Learning Telemetry (/api/ml/predict/TCS)
      console.log('6. Querying AI ML prediction pipeline for TCS (/api/ml/predict/TCS)...');
      const mlRes = await fetch(`${baseUrl}/api/ml/predict/TCS`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const mlData = await mlRes.json();
      assert(mlRes.status === 200, 'ML Prediction API returned HTTP 200 OK');
      assert(['BUY', 'SELL', 'HOLD'].includes(mlData.data.prediction), `Valid ML signal class returned: ${mlData.data.prediction}`);
      assert(typeof mlData.data.confidence === 'number' && mlData.data.confidence > 0, `Calibrated confidence probability returned: ${mlData.data.confidence}`);
      assert(mlData.data.source === 'ml' || mlData.data.source === 'fallback', `Signal source is explicitly transparent: ${mlData.data.source}`);

      // 7. Execute First Paper Trade: BUY 10 TCS @ ₹2,270
      console.log('7. Executing paper BUY order (10 TCS @ ₹2,270)...');
      const buyRes = await fetch(`${baseUrl}/api/trades/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
          symbol: 'TCS',
          action: 'BUY',
          quantity: 10,
          price: 2270,
          strategyTag: 'AI Signal'
        })
      });
      const buyData = await buyRes.json();
      assert(buyRes.status === 200, 'BUY order executed successfully');
      assert(buyData.data.walletBalance === 77300, `Cash deducted correctly to ₹77,300 (Actual: ₹${buyData.data.walletBalance})`);
      assert(buyData.data.portfolioHolding.quantity === 10, 'Portfolio reflects 10 shares of TCS');

      // 8. Portfolio Holdings Verification (/api/portfolio)
      console.log('8. Inspecting portfolio valuation (/api/portfolio)...');
      const portRes = await fetch(`${baseUrl}/api/portfolio`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const portData = await portRes.json();
      const holdings = portData.data.holdings || portData.data || [];
      assert(holdings.length === 1, 'Portfolio reflects exactly 1 open holding');
      assert(holdings[0].symbol === 'TCS' && holdings[0].quantity === 10, 'Holding details verified (10 TCS)');

      // 9. Execute Partial Paper Trade: SELL 5 TCS @ ₹2,500
      console.log('9. Executing partial paper SELL order (5 TCS @ ₹2,500)...');
      const sellRes = await fetch(`${baseUrl}/api/trades/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
          symbol: 'TCS',
          action: 'SELL',
          quantity: 5,
          price: 2500,
          strategyTag: 'Momentum'
        })
      });
      const sellData = await sellRes.json();
      assert(sellRes.status === 200, 'SELL order executed successfully');
      assert(sellData.data.walletBalance === 89800, `Cash updated to ₹89,800 (Actual: ₹${sellData.data.walletBalance})`);
      assert(sellData.data.realizedProfitLoss === 1150, `Realized P/L calculated as ₹1,150 (Actual: ₹${sellData.data.realizedProfitLoss})`);
      assert(sellData.data.portfolioHolding.quantity === 5, 'Remaining holding is 5 TCS');

      // 10. Review Trade History Logs (/api/trades)
      console.log('10. Reviewing trade audit log (/api/trades)...');
      const tradesRes = await fetch(`${baseUrl}/api/trades`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      const tradesData = await tradesRes.json();
      assert(tradesData.data.length === 2, `Trade history records 2 executed trades (Actual: ${tradesData.data.length})`);
      assert(tradesData.data[0].action === 'SELL' && tradesData.data[1].action === 'BUY', 'Chronological order of trade history verified');

      // 11. Complete Full Liquidation: SELL 5 TCS @ ₹2,270
      console.log('11. Executing full liquidation SELL (5 TCS @ ₹2,270)...');
      const fullSellRes = await fetch(`${baseUrl}/api/trades/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
          symbol: 'TCS',
          action: 'SELL',
          quantity: 5,
          price: 2270
        })
      });
      const fullSellData = await fullSellRes.json();
      assert(fullSellRes.status === 200, 'Full liquidation executed successfully');
      assert(fullSellData.data.portfolioHolding === null || fullSellData.data.portfolioHolding.quantity === 0, 'Portfolio position fully liquidated to 0');
      assert(fullSellData.data.walletBalance === 101150, `Final wallet balance is ₹101,150 (Initial ₹100k + ₹1,150 profit)`);

      // 12. State Persistence across Logout and Re-Login
      console.log('12. Testing session re-login & state persistence...');
      const reLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword })
      });
      const reLoginData = await reLoginRes.json();
      const newToken = reLoginData.data.token;

      const reWalletRes = await fetch(`${baseUrl}/api/wallet`, {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      const reWalletData = await reWalletRes.json();
      assert(reWalletData.data.balance === 101150, `Wallet balance persisted accurately after re-login (Actual: ₹${reWalletData.data.balance})`);

      // 13. Security & Validation Edge Cases
      console.log('\n--- Scenario 13: Security & Validation Edge Cases ---');
      // A. Invalid credentials
      const badLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: 'WrongPassword!' })
      });
      assert(badLogin.status === 401, 'Invalid password rejected with 401 Unauthorized');

      // B. Duplicate registration
      const dupReg = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: testName, email: testEmail, password: testPassword })
      });
      assert(dupReg.status === 409, 'Duplicate registration rejected with 409 Conflict');

      // C. Unauthenticated access
      const unauthRes = await fetch(`${baseUrl}/api/wallet`);
      assert(unauthRes.status === 401, 'Unauthenticated wallet query rejected with 401');

      // D. Excessive BUY
      const overBuy = await fetch(`${baseUrl}/api/trades/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newToken}` },
        body: JSON.stringify({ symbol: 'TCS', action: 'BUY', quantity: 1000, price: 2270 })
      });
      assert(overBuy.status === 400, 'BUY exceeding wallet balance rejected with 400');

      // E. Invalid quantity
      const negBuy = await fetch(`${baseUrl}/api/trades/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newToken}` },
        body: JSON.stringify({ symbol: 'TCS', action: 'BUY', quantity: -5, price: 2270 })
      });
      assert(negBuy.status === 400, 'Negative quantity rejected with 400');

      // F. Over-selling unowned stock
      const overSell = await fetch(`${baseUrl}/api/trades/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newToken}` },
        body: JSON.stringify({ symbol: 'HDFC', action: 'SELL', quantity: 10, price: 1500 })
      });
      assert(overSell.status === 400, 'Selling unowned shares rejected with 400');

      console.log('\n================================================================');
      console.log(` ALL ${passedTests} OF ${totalTests} CRITICAL USER JOURNEY TESTS PASSED!`);
      console.log('================================================================\n');

    } catch (err) {
      console.error(`\n❌ User Journey Test Failed: ${err.message}`);
      process.exitCode = 1;
    } finally {
      // Clean up test user records
      try {
        const User = require('../models/User');
        const Wallet = require('../models/Wallet');
        const Portfolio = require('../models/Portfolio');
        const Trade = require('../models/Trade');
        const user = await User.findOne({ email: testEmail });
        if (user) {
          const uid = user._id.toString();
          await User.deleteOne({ _id: user._id });
          await Wallet.deleteMany({ userId: uid });
          await Portfolio.deleteMany({ userId: uid });
          await Trade.deleteMany({ userId: uid });
        }
      } catch (e) {}
      server.close();
      try {
        await mongoose.connection.close();
      } catch (e) {}
      process.exit(process.exitCode || 0);
    }
  });
}

runCriticalJourneyTest();
