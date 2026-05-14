async function runTest() {
  const BASE_URL = 'http://localhost:3001/api/v1';

  try {
    console.log("1. Signing up...");
    const email = `test_${Date.now()}@test.com`;
    let res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123', name: 'Test User' })
    });
    let data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const token = data.access_token;
    console.log("Token obtained!");

    console.log("2. Creating chat...");
    res = await fetch(`${BASE_URL}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: 'New Test Chat' })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const chatId = data.id || data._id;
    console.log("Chat created:", chatId);

    console.log("3. Sending message...");
    res = await fetch(`${BASE_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content: 'Hello, are you there?' })
    });
    const text = await res.text();
    console.log("Response text:", text);

  } catch (err) {
    console.error("TEST FAILED:", err);
  }
}

runTest();
