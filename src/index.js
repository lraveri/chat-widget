import './chat.css';

(function() {
    let threadId = null; // Variabile per memorizzare il threadId

    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    loadCSS('styles.css');

    function initializeChat(baseURL, baseColor, logoURL, module, assistantId) {
        console.log('Initializing chat with baseURL:', baseURL, 'baseColor:', baseColor, 'logoURL:', logoURL, 'module:', module, 'assistantId:', assistantId);

        const chatButton = document.createElement('div');
        chatButton.id = 'chat-button';
        chatButton.style.backgroundColor = baseColor;
        chatButton.innerHTML = `<img src="${logoURL}" alt="Chat Logo" />`;
        document.body.appendChild(chatButton);

        const chatWindow = document.createElement('div');
        chatWindow.id = 'chat-window';
        chatWindow.style.display = 'none';
        chatWindow.innerHTML = `
            <div id="chat-header">Chat</div>
            <div id="chat-body"></div>
            <input id="chat-input" type="text" placeholder="Type a message..." />
            <button id="chat-send">Send</button>
        `;
        document.body.appendChild(chatWindow);

        chatButton.addEventListener('click', function() {
            console.log('Chat button clicked');
            chatWindow.style.display = chatWindow.style.display === 'none' ? 'block' : 'none';
        });

        function sendMessage(message) {
            if (!threadId) {
                console.error('Thread ID is not set.');
                return;
            }

            console.log('Sending message:', message);
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${baseURL}/api/v1/${module}/chat`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('POST response received:', xhr.status, xhr.responseText);
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        displayMessage(response.responseMessage, 'assistant');
                    }
                }
            };
            xhr.send(JSON.stringify({ threadId: threadId, message: message, assistantId: assistantId }));
        }

        function displayMessage(message, sender) {
            console.log('Displaying message from', sender, ':', message);
            const messageDiv = document.createElement('div');
            messageDiv.className = sender;
            messageDiv.textContent = message;
            document.getElementById('chat-body').appendChild(messageDiv);
        }

        document.getElementById('chat-send').addEventListener('click', function() {
            const input = document.getElementById('chat-input');
            const message = input.value;
            if (message.trim() !== '') {
                displayMessage(message, 'user');
                sendMessage(message);
                input.value = '';
            }
        });

        document.getElementById('chat-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('chat-send').click();
            }
        });

        console.log('Sending initial GET request to', `${baseURL}/api/v1/${module}/start`);
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${baseURL}/api/v1/luca/start`, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                console.log('GET response received:', xhr.status, xhr.responseText);
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    threadId = response.threadId; // Memorizza il threadId
                    console.log('Received threadId:', threadId);
                    displayMessage('Chat started. How can I help you?', 'assistant');
                }
            }
        };
        xhr.send();
    }

    window.initializeChat = initializeChat;
})();
