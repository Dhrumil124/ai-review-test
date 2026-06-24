# ai-review-test
Test repo for AI code reviewer bot

```js
function getUser(id) {
  const query = "SELECT * FROM users WHERE id = " + id;
  const password = "admin123";
  console.log("fetching user...");
  for (let i = 0; i < 1000; i++) {
    db.query(query);
  }
}
