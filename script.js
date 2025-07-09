document.addEventListener("DOMContentLoaded", () => {
  // Chat functionality
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatMessages = document.getElementById("chatMessages");
  const sendButton = document.getElementById("sendButton");
  
  // Auto-resize the textarea
  userInput.addEventListener("input", () => {
      userInput.style.height = "auto";
      userInput.style.height = userInput.scrollHeight + "px";
  });

  chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = userInput.value.trim();
      if (!message) return;
      
      addMessage(message, true);
      userInput.value = "";
      userInput.style.height = "auto";
      sendButton.disabled = true;
      
      const typingIndicator = showTypingIndicator();
      
      try {
          const response = await generateResponse(message);
          typingIndicator.remove();
          addMessage(response, false);
      } catch (error) {
          typingIndicator.remove();
          addErrorMessage(error.message);
      } finally {
          sendButton.disabled = false;
      }
  });
  
  // Theme toggle functionality
  const themeToggle = document.getElementById('themeToggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Set initial theme
  const currentTheme = localStorage.getItem('theme') || 
                     (prefersDarkScheme.matches ? 'dark' : 'light');
  document.body.classList.toggle('light-theme', currentTheme === 'light');
  
  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
  
  // Listen for system theme changes
  prefersDarkScheme.addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
          document.body.classList.toggle('light-theme', !e.matches);
      }
  });
  
  // Chat functions
  async function generateResponse(prompt) {
      const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBxNH4PAXXdalDMbaQj_DBlkRBq6PxZbsM`,
          {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  contents: [
                      {
                          parts: [
                              {
                                  text: `Please format your response professionally with clear paragraphs, bullet points when appropriate, and proper spacing. The user asked: ${prompt}`,
                              },
                          ],
                      },
                  ],
              }),
          }
      );
      if (!response.ok) {
          throw new Error("Failed to generate the response");
      }
      const data = await response.json();
      return formatResponse(data.candidates[0].content.parts[0].text);
  }
  
  function formatResponse(text) {
    // Convert markdown-like formatting to HTML
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // italic
      .replace(/^-\s(.*$)/gm, '<li>$1</li>') // bullet points
      .replace(/\n\n/g, '</p><p>') // paragraphs
      .replace(/\n/g, '<br>'); // line breaks

    // If we found list items, wrap them in ul
    if (formattedText.includes('<li>')) {
      formattedText = formattedText.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');
    }

    // Ensure we have proper paragraph tags
    if (!formattedText.startsWith('<p>')) {
      formattedText = '<p>' + formattedText;
    }
    if (!formattedText.endsWith('</p>')) {
      formattedText = formattedText + '</p>';
    }

    return formattedText;
  }

  function addMessage(text, isUser) {
      const message = document.createElement("div");
      message.className = `message ${isUser ? "user-message" : ""}`;
      
      const messageContent = document.createElement("div");
      messageContent.className = "message-content";
      
      if (isUser) {
        messageContent.textContent = text;
      } else {
        messageContent.innerHTML = text;
      }
      
      message.innerHTML = `
          <div class="avatar ${isUser ? "user-avatar" : ""}">
              ${isUser ? "U" : "AI"}
          </div>
      `;
      
      message.appendChild(messageContent);
      chatMessages.appendChild(message);
      chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function showTypingIndicator() {
      const indicator = document.createElement("div");
      indicator.className = "message";
      indicator.innerHTML = `
          <div class="avatar">AI</div>
          <div class="typing-indicator">
              <div class='dot'></div>
              <div class='dot'></div>
              <div class='dot'></div>
          </div>
      `;
      chatMessages.appendChild(indicator);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return indicator;
  }
  
  function addErrorMessage(text) {
      const message = document.createElement("div");
      message.className = "message";
      message.innerHTML = `
          <div class="avatar">AI</div>
          <div class="message-content" style="color:red">
              Error: ${text}
          </div>
      `;
      chatMessages.appendChild(message);
      chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
