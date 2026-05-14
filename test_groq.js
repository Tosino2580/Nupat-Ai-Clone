require('dotenv').config({ path: './backend/.env' });
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'hello' }]
    });
    console.log("SUCCESS:", completion.choices[0].message.content);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();
