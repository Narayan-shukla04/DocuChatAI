async function testFlow() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful');

    const docsRes = await fetch('http://localhost:5000/api/docs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const docsData = await docsRes.json();
    const docId = docsData[0]._id;
    console.log('Got document:', docId);

    const chatRes = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ message: 'What is the purpose of this document?', docId })
    });
    const chatData = await chatRes.json();
    console.log('Chat response full:', chatData);

  } catch (error) {
    console.error('Error:', error);
  }
}

testFlow();
