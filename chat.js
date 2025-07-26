import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🔁 Replace with your own Supabase project keys
const supabase = createClient(
  'https://wggypsrylatqicuozout.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZ3lwc3J5bGF0cWljdW96b3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzgxODIsImV4cCI6MjA2ODgxNDE4Mn0.oBtTNLgLL-fZnH-6Q1KmveCTu4_3_ZL-f42A14z_8YA'
)



supabase.auth.getSession().then(({ data, error }) => {
  if (error || !data.session) {
    window.location.href = 'login.html'
  }
})

// Optional: respond to future changes in auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (!session) {
    window.location.href = 'login.html'
  }
})

// Load previous messages
// USERNAME (fallback anonymous)
const username = localStorage.getItem('username') || prompt('Enter your name') || 'Anonymous'
localStorage.setItem('username', username)

// DOM
const messagesDiv = document.getElementById('messages')
const input = document.getElementById('msg')

// 🔁 Fetch existing messages
async function loadMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })

  if (!error) {
    messagesDiv.innerHTML = ''
    data.forEach(({ username, msg }) => displayMessage(username, msg))
  }
}

// 📤 Send message
window.sendMessage = async function () {
  const message = input.value.trim()
  if (!message) return

  const { error } = await supabase.from('messages').insert({
    username,
    msg: message
  })

  if (!error) input.value = ''
}

// 💬 Realtime subscription
supabase
  .channel('public:messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    const { username, msg } = payload.new
    displayMessage(username, msg)
  })
  .subscribe()

// 🖼️ Display message
function displayMessage(sender, message) {
  const msgDiv = document.createElement('div')
  msgDiv.textContent = `${sender}: ${message}`
  addCopyButton(msgDiv)
  messagesDiv.appendChild(msgDiv)
  messagesDiv.scrollTop = messagesDiv.scrollHeight
}

// 🔘 Add copy button
function addCopyButton(div) {
  const copyBtn = document.createElement('button')
  copyBtn.className = 'copy-btn'
  copyBtn.textContent = 'Copy'
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(div.textContent.replace('Copy', '').trim())
    copyBtn.textContent = 'Copied!'
    setTimeout(() => copyBtn.textContent = 'Copy', 2000)
  }
  div.appendChild(copyBtn)
}



document.getElementById('log-but').addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Logout failed:', error.message)
  } else {
    // Redirect to login page after logout
    window.location.href = 'login.html'
  }
})



  if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

    



// ⏳ On load
loadMessages()
