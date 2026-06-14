const API_URL = 'http://localhost:3000/api';

async function request(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${API_URL}${endpoint}`, options);
  const text = await res.text();
  try {
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(JSON.stringify(data));
      return data;
  } catch(e) {
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: ${text.substring(0, 200)}...`);
      throw new Error(`Parse error: ${text.substring(0, 200)}...`);
  }
}

async function runTests() {
  console.log('--- מריץ בדיקות אוטומטיות למערכת ---');
  let userId;
  
  // 1. Register or Login
  try {
    console.log('\n[1] מנסה להתחבר (Login) או להירשם (Register)...');
    try {
      const data = await request('/login', 'POST', { username: 'testuser', password: 'password123' });
      userId = data.id;
      console.log('✅ התחברות הצליחה. מזהה משתמש:', userId);
    } catch (e) {
      if (e.message.includes('Invalid username or password') || e.message.includes('401')) {
        // Create user
        const data = await request('/register', 'POST', { name: 'Test User', username: 'testuser', password: 'password123' });
        userId = data.id;
        console.log('✅ הרשמה הצליחה. מזהה משתמש:', userId);
      } else {
        throw e;
      }
    }

    // 2. Create Todo
    console.log('\n[2] מנסה ליצור משימה (Todo)...');
    const todoRes = await request('/todos', 'POST', { user_id: userId, title: 'משימת בדיקה', completed: false });
    console.log('✅ יצירת משימה הצליחה:', todoRes);

    // 3. Get Todos
    console.log('\n[3] מנסה לשלוף משימות (Todos)...');
    const getTodosRes = await request(`/todos?userId=${userId}`);
    console.log(`✅ שליפת משימות הצליחה: ${getTodosRes.length} משימות נמצאו.`);

    // 4. Create Post
    console.log('\n[4] מנסה ליצור פוסט (Post)...');
    const postRes = await request('/posts', 'POST', { user_id: userId, title: 'פוסט בדיקה', body: 'זהו תוכן הפוסט לבדיקה' });
    console.log('✅ יצירת פוסט הצליחה:', postRes);

    // 5. Get Posts
    console.log('\n[5] מנסה לשלוף פוסטים (Posts)...');
    const getPostsRes = await request(`/posts?userId=${userId}`);
    console.log(`✅ שליפת פוסטים הצליחה: ${getPostsRes.length} פוסטים נמצאו.`);

    console.log('\n🎉 כל הבדיקות עברו בהצלחה!');

  } catch (error) {
    console.error('❌ שגיאה במהלך הבדיקה:', error.message);
  }
}

runTests();
