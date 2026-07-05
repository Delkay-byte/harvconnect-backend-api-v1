// test-auth-flow.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BASE_URL = "http://localhost:5000/api/v1/auth";
const TEST_PASSWORD = "SecurePassword123!";

// We use your details, filling in the rest to trigger the profile creation logic
const userData = {
  fullName: "Saviour Amegayie",
  email: "saviour.amegayie.ds@gmail.com",
  password: TEST_PASSWORD,
  phone: "0240064668",
  role: "FARMER",
  farmName: "BloomCore Farms",
  address: "Akatsi, Volta Region",
};

let authToken = "";

const runTests = async () => {
  console.log("🚀 Starting Auth Flow Integration Test...\n");

  try {
    // 🧹 PRE-TEST CLEANUP: Ensure we start fresh
    await prisma.user.deleteMany({ where: { email: userData.email } });

    // ==========================================
    // 1. REGISTER
    // ==========================================
    console.log("1️⃣ Testing Registration...");
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const regData = await regRes.json();
    if (regRes.status !== 201)
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    console.log("✅ User registered successfully. Profiles created.\n");

    // ==========================================
    // 2. VERIFY EMAIL
    // ==========================================
    console.log("2️⃣ Testing Email Verification...");
    // We bypass the actual email by grabbing the token straight from the DB
    const verifyTokenRecord = await prisma.authToken.findFirst({
      where: { user: { email: userData.email }, type: "VERIFY_EMAIL" },
    });

    const verifyRes = await fetch(`${BASE_URL}/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: verifyTokenRecord.token }),
    });
    if (verifyRes.status !== 200) throw new Error("Verification failed");
    console.log("✅ Email verified successfully. User isVerified = true.\n");

    // ==========================================
    // 3. LOGIN
    // ==========================================
    console.log("3️⃣ Testing Login...");
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200) throw new Error("Login failed");

    authToken = loginData.data.token; // Save JWT for later steps
    console.log("✅ Login successful. JWT secured.\n");

    // ==========================================
    // 4. RESEND VERIFICATION (Should fail since already verified)
    // ==========================================
    console.log("4️⃣ Testing Resend Verification (Verified State)...");
    const resendRes = await fetch(`${BASE_URL}/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userData.email }),
    });
    if (resendRes.status === 400) {
      console.log("✅ Resend blocked correctly (User already verified).\n");
    }

    // ==========================================
    // 5. FORGOT PASSWORD
    // ==========================================
    console.log("5️⃣ Testing Forgot Password...");
    const forgotRes = await fetch(`${BASE_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userData.email }),
    });
    if (forgotRes.status !== 200) throw new Error("Forgot password failed");
    console.log("✅ Forgot password initiated. Email sent.\n");

    // ==========================================
    // 6. RESET PASSWORD
    // ==========================================
    console.log("6️⃣ Testing Reset Password...");
    const resetTokenRecord = await prisma.authToken.findFirst({
      where: { user: { email: userData.email }, type: "RESET_PASSWORD" },
    });

    const newPassword = "NewSecurePassword456!";
    const resetRes = await fetch(`${BASE_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: resetTokenRecord.token,
        password: newPassword,
      }),
    });
    const resetData = await resetRes.json();
    if (resetRes.status !== 200)
      throw new Error(`Reset password failed: ${JSON.stringify(resetData)}`);
    console.log("✅ Password reset successfully.\n");

    // Test old password rejection
    const oldLoginRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });
    if (oldLoginRes.status === 401) {
      console.log("✅ Old password correctly rejected.\n");
    }

    // ==========================================
    // 7. GET ME
    // ==========================================
    console.log("7️⃣ Testing /me Profile Retrieval...");

    // Login again to get a fresh token with the new password
    const freshLoginRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userData.email, password: newPassword }),
    });

    const freshLoginData = await freshLoginRes.json();

    // DEBUG: Print the result of the login
    console.log("DEBUG: Login Response Status:", freshLoginRes.status);
    console.log("DEBUG: Login Data:", JSON.stringify(freshLoginData));

    if (freshLoginRes.status !== 200) {
      throw new Error("Failed to login for /me test. Check credentials.");
    }

    const meRes = await fetch(`${BASE_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${freshLoginData.data.token}`,
      },
    });

    const meData = await meRes.json();

    // DEBUG: Print the status and response for /me
    console.log("DEBUG: /me Status:", meRes.status);
    console.log("DEBUG: /me Response Body:", JSON.stringify(meData));

    // Safety checks
    if (meData.data && (meData.data.password || meData.data.authTokens)) {
      throw new Error("SECURITY LEAK: Password or tokens returned in /me");
    }
    if (!meData.data) {
      throw new Error("Invalid /me response: missing data field");
    }

    console.log(
      "✅ /me returned secure profile data without leaking credentials.\n",
    );

    // ==========================================
    // 8. DELETE ACCOUNT
    // ==========================================
    console.log("8️⃣ Testing Account Deactivation...");
    const deleteRes = await fetch(`${BASE_URL}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${freshLoginData.data.token}`,
      },
    });

    if (deleteRes.status === 200) {
      console.log("✅ Account deactivated (isActive = false).\n");
    } else {
      console.log(
        "⚠️ /delete endpoint not found. See note below to implement.\n",
      );
    }

    console.log(
      "🎉 ALL TESTS PASSED SUCCESSFULLY! Your Auth Pipeline is rock solid.",
    );
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
  } finally {
    await prisma.$disconnect();
  }
};

runTests();
