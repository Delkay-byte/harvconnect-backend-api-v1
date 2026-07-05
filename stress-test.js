// stress-test.js
const runStressTest = async () => {
  const url = "http://localhost:5000/api/v1/auth/login";

  console.log("🚀 Firing 101 requests at the Bouncer...");

  for (let i = 1; i <= 101; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "buyer1@harv.com",
          password: "MarketPassword123!",
        }),
      });

      console.log(`Request ${i}: Status ${response.status}`);

      if (response.status === 429) {
        console.log("🛑 HIT THE LIMIT! The Bouncer stopped us.");
        break;
      }
    } catch (err) {
      console.error(`Request ${i} failed: ${err.message}`);
    }
  }
};

runStressTest();
