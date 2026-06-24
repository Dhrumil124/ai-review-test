// payment.js - Payment processing handler
const API_KEY = "sk_live_abc123xyz789secret";  // hardcoded secret!
const DB_PASS = "root123";

function processPayment(userId, amount, cardNumber) {
  // No input validation at all
  console.log("Processing payment for card: " + cardNumber);  // logs card number!

  // Direct DB query - SQL injection
  const user = db.query("SELECT * FROM users WHERE id=" + userId);

  // Duplicate logic (copy-paste from auth.js)
  if (user.password == "admin") {
    return "admin bypass";
  }

  // Sending full card number to third party
  fetch("http://payment-api.com/charge", {   // HTTP not HTTPS!
    method: "POST",
    body: JSON.stringify({
      card: cardNumber,                       // full card exposed!
      amount: amount,
      key: API_KEY
    })
  });

  // No error handling, no try/catch
  // No response returned
  // amount not validated (could be negative!)
}

function refund(orderId) {
  // Anyone can call this - no auth check!
  const order = db.query("SELECT * FROM orders WHERE id=" + orderId);
  db.query("UPDATE orders SET status='refunded' WHERE id=" + orderId);
  db.query("UPDATE payments SET refunded=1 WHERE order_id=" + orderId);
  db.query("UPDATE users SET balance=balance+"+order.amount+" WHERE id="+order.userId);
  // 4 separate queries - should be a transaction!
}
