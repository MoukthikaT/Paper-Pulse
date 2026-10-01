const mongoose = require('mongoose');
const { connectDB, isDbConnected } = require('../config/db');
const walletService = require('../services/walletService');
const portfolioService = require('../services/portfolioService');
const tradingService = require('../services/tradingService');
const tradeHistoryService = require('../services/tradeHistoryService');

async function runAtomicityTests() {
  await connectDB();
  console.log('\n================================================================');
  console.log(' RUNNING TRANSACTION ATOMICITY & FAILURE ROLLBACK TEST SUITE');
  console.log('================================================================\n');

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

  const userId = 'atomicity_user_' + Date.now();

  try {
    // Reset state for test user
    await walletService.resetBalance(userId, 100000);
    if (isDbConnected()) {
      const Portfolio = require('../models/Portfolio');
      const Trade = require('../models/Trade');
      await Portfolio.deleteMany({ userId });
      await Trade.deleteMany({ userId });
    }

    // ----------------------------------------------------------------
    // TEST 1: BUY Transaction Atomicity on Simulated Failure
    // ----------------------------------------------------------------
    console.log('--- TEST 1: BUY Trade Failure Aborts All State Changes ---');
    const origCreateTrade = tradeHistoryService.createTradeRecord;
    
    // Inject artificial failure into trade recording step
    tradeHistoryService.createTradeRecord = async () => {
      const err = new Error('SIMULATED_DB_FAILURE_DURING_TRADE_RECORDING');
      err.code = 'SIMULATED_FAILURE';
      throw err;
    };

    let buyFailed = false;
    try {
      await tradingService.executeTrade({
        userId,
        symbol: 'TCS',
        action: 'BUY',
        price: 2270,
        quantity: 10,
        tradeType: 'MANUAL'
      });
    } catch (err) {
      buyFailed = true;
      console.log('Caught expected error in Test 1:', err.message, err.code);
      assert(err.message === 'SIMULATED_DB_FAILURE_DURING_TRADE_RECORDING', `Trade failed with injected simulation error (Caught: ${err.message})`);
    } finally {
      // Restore original function
      tradeHistoryService.createTradeRecord = origCreateTrade;
    }

    assert(buyFailed === true, 'BUY operation failed as expected');

    // Verify rollbacks: Wallet unchanged, Portfolio empty, Trade History empty
    const walletAfterFailedBuy = await walletService.getBalance(userId);
    assert(walletAfterFailedBuy === 100000, `Wallet balance is completely intact at ₹100,000 (Actual: ₹${walletAfterFailedBuy})`);

    const holdingAfterFailedBuy = await portfolioService.getHolding(userId, 'TCS');
    assert(!holdingAfterFailedBuy || holdingAfterFailedBuy.quantity === 0, 'No portfolio holding created for failed BUY');

    const tradesAfterFailedBuy = await tradeHistoryService.getTradeHistory(userId);
    assert(tradesAfterFailedBuy.length === 0, `Trade history has 0 records (Actual: ${tradesAfterFailedBuy.length})`);


    // ----------------------------------------------------------------
    // TEST 2: Successful BUY to set up SELL test
    // ----------------------------------------------------------------
    console.log('\n--- TEST 2: Execute Clean Baseline BUY (10 TCS @ ₹2,270) ---');
    const cleanBuy = await tradingService.executeTrade({
      userId,
      symbol: 'TCS',
      action: 'BUY',
      price: 2270,
      quantity: 10,
      tradeType: 'MANUAL'
    });
    assert(cleanBuy.executed === true, 'Baseline BUY executed successfully');
    const walletAfterCleanBuy = await walletService.getBalance(userId);
    assert(walletAfterCleanBuy === 77300, `Wallet deducted to ₹77,300 (Actual: ₹${walletAfterCleanBuy})`);


    // ----------------------------------------------------------------
    // TEST 3: SELL Transaction Atomicity on Simulated Failure
    // ----------------------------------------------------------------
    console.log('\n--- TEST 3: SELL Trade Failure Aborts All State Changes ---');
    // Inject artificial failure into wallet addition step
    const origAddWallet = walletService.add;
    walletService.add = async () => {
      const err = new Error('SIMULATED_DB_FAILURE_DURING_WALLET_CREDIT');
      err.code = 'SIMULATED_FAILURE';
      throw err;
    };

    let sellFailed = false;
    try {
      await tradingService.executeTrade({
        userId,
        symbol: 'TCS',
        action: 'SELL',
        price: 2500,
        quantity: 5,
        tradeType: 'MANUAL'
      });
    } catch (err) {
      sellFailed = true;
      assert(err.message === 'SIMULATED_DB_FAILURE_DURING_WALLET_CREDIT', 'SELL failed with injected simulation error');
    } finally {
      // Restore original function
      walletService.add = origAddWallet;
    }

    assert(sellFailed === true, 'SELL operation failed as expected');

    // Verify rollbacks: Wallet unchanged, Portfolio holding preserved at 10 shares, no SELL in trades
    const walletAfterFailedSell = await walletService.getBalance(userId);
    assert(walletAfterFailedSell === 77300, `Wallet balance remains exactly ₹77,300 (Actual: ₹${walletAfterFailedSell})`);

    const holdingAfterFailedSell = await portfolioService.getHolding(userId, 'TCS');
    assert(holdingAfterFailedSell && holdingAfterFailedSell.quantity === 10, `Portfolio still holds all 10 TCS shares (Actual: ${holdingAfterFailedSell?.quantity})`);

    const tradesAfterFailedSell = await tradeHistoryService.getTradeHistory(userId);
    assert(tradesAfterFailedSell.length === 1 && tradesAfterFailedSell[0].action === 'BUY', 'Trade history contains only the original 1 BUY record');


    // ----------------------------------------------------------------
    // TEST 4: Verification of Financial Mathematics
    // ----------------------------------------------------------------
    console.log('\n--- TEST 4: Financial Math Verification (Weighted Avg, Partial SELL, Full SELL) ---');
    // Buy another 5 shares @ ₹2500
    // Weighted avg: (10 * 2270 + 5 * 2500) / 15 = (22700 + 12500) / 15 = 35200 / 15 = 2346.666...
    await tradingService.executeTrade({
      userId,
      symbol: 'TCS',
      action: 'BUY',
      price: 2500,
      quantity: 5,
      tradeType: 'MANUAL'
    });

    const holdingWeighted = await portfolioService.getHolding(userId, 'TCS');
    assert(holdingWeighted.quantity === 15, `Holding quantity is 15 (Actual: ${holdingWeighted.quantity})`);
    const expectedAvg = (10 * 2270 + 5 * 2500) / 15;
    assert(Math.abs(holdingWeighted.averagePurchasePrice - expectedAvg) < 0.01, `Weighted average cost is ₹${expectedAvg.toFixed(2)} (Actual: ₹${holdingWeighted.averagePurchasePrice})`);

    // Partial SELL: 5 shares @ ₹2600
    // 5 * (2600 - 2346.67) = 5 * 253.33 = 1266.65
    const partialSell = await tradingService.executeTrade({
      userId,
      symbol: 'TCS',
      action: 'SELL',
      price: 2600,
      quantity: 5,
      tradeType: 'MANUAL'
    });
    const expectedPartialPL = Math.round(5 * (2600 - holdingWeighted.averagePurchasePrice) * 100) / 100;
    assert(Math.abs(partialSell.realizedProfitLoss - expectedPartialPL) < 0.01, `Partial SELL realized P/L is ₹${expectedPartialPL} (Actual: ₹${partialSell.realizedProfitLoss})`);

    // Full Liquidation SELL: 10 shares @ ₹2400
    // 10 * (2400 - 2346.67) = 10 * 53.33 = 533.30
    const fullSell = await tradingService.executeTrade({
      userId,
      symbol: 'TCS',
      action: 'SELL',
      price: 2400,
      quantity: 10,
      tradeType: 'MANUAL'
    });
    const expectedFullPL = Math.round(10 * (2400 - holdingWeighted.averagePurchasePrice) * 100) / 100;
    assert(Math.abs(fullSell.realizedProfitLoss - expectedFullPL) < 0.01, `Full SELL realized P/L is ₹${expectedFullPL} (Actual: ₹${fullSell.realizedProfitLoss})`);

    const finalHolding = await portfolioService.getHolding(userId, 'TCS');
    assert(!finalHolding || finalHolding.quantity === 0, 'Portfolio holding fully liquidated to 0 shares');

    console.log('\n================================================================');
    console.log(` ALL ${passedTests} OF ${totalTests} ATOMICITY & MATH TESTS PASSED!`);
    console.log('================================================================\n');
    await mongoose.connection.close();
  } catch (error) {
    console.error(`\n❌ Atomicity Test Failed: ${error.message}`);
    try {
      await mongoose.connection.close();
    } catch (e) {}
    process.exit(1);
  }
}

runAtomicityTests();
