// === Script 3: Chat Functionality ===
// Contains functions specifically for handling the chat feature.
// Relies on Firebase references (chatRef), user state (currentUser),
// and DOM elements (chatMessages, chatInput, etc.) initialized in Script 2.js.

console.log("Script 3.js loaded: Chat functions defined.");

/**
 * Initializes the Firebase listener for chat messages.
 * Attaches only if not already attached and Firebase is ready.
 */
function initializeChat() {
    // Check dependencies initialized in Script 2
    if (typeof firebaseInitialized === 'undefined' || typeof chatRef === 'undefined' || typeof chatListenerAttached === 'undefined') {
        console.error("initializeChat: Core dependencies (firebaseInitialized, chatRef, chatListenerAttached) not found.");
        return;
    }
     // Also check for DOM elements needed
     if (typeof chatMessages === 'undefined' || !chatMessages || typeof chatLoadingMsg === 'undefined') {
         console.error("initializeChat: Required chat DOM elements (chatMessages, chatLoadingMsg) not found.");
         return;
     }


    if (!firebaseInitialized || !chatRef) {
        console.warn("Skipping chat initialization (Firebase issue).");
        if (chatMessages && chatLoadingMsg) {
            chatLoadingMsg.textContent = "Chat ikke tilgjengelig (Firebase feil).";
            chatLoadingMsg.style.display = 'block';
        }
        return;
    }

    if (chatListenerAttached) {
        console.warn("Chat listener already attached. Skipping initialization.");
        return;
    }

    console.log("Initializing chat listener...");
    chatListenerAttached = true; // Set flag immediately

    if (chatLoadingMsg) chatLoadingMsg.style.display = 'none'; // Hide loading message
    // Don't clear messages here, allow appending if view is revisited
    // if (chatMessages) chatMessages.innerHTML = '';

    // Listen for new messages added to the 'chat' node (limit to last 50)
    chatRef.limitToLast(50).on('child_added', (snapshot) => {
        try {
            // Remove loading message definitively if it's still there
            if (chatLoadingMsg && chatLoadingMsg.parentNode === chatMessages) {
                chatMessages.removeChild(chatLoadingMsg);
            }

            const messageData = snapshot.val();
            if (messageData && messageData.username && messageData.text && messageData.timestamp) {
                displayChatMessage(messageData); // Call function to render the message
            } else {
                console.warn("Received incomplete chat message data:", messageData);
            }
        } catch (error) {
            console.error("Error processing incoming chat message:", error);
        }
    }, (error) => {
        // Handle errors with the listener itself (e.g., permissions)
        console.error("Firebase chat listener error:", error);
        if (chatMessages) {
            chatMessages.innerHTML = '<p class="text-center italic text-sm text-red-500 p-4">Kunne ikke laste chat.</p>';
        }
        chatListenerAttached = false; // Reset flag on error to potentially allow retry?
    });
     console.log("Firebase chat listener attached.");
}

/**
 * Displays a single chat message in the chat window.
 * @param {object} message - The message object from Firebase {username, text, timestamp}.
 */
function displayChatMessage(message) {
    // Assumes 'chatMessages' element and 'currentUser' variable are available globally.
    if (!chatMessages) {
        console.error("displayChatMessage: chatMessages element not found.");
        return;
    }

    const messageElement = document.createElement('p');
    // Add Tailwind classes or use CSS from the main style block
    messageElement.classList.add('p-1', 'mb-1', 'rounded', 'break-words', 'text-sm', 'new-message-animate'); // Added animation class

    // Create elements for username, text, and timestamp
    const userElement = document.createElement('strong');
    userElement.textContent = message.username + ':';
    userElement.classList.add('mr-2'); // Add some spacing

    const textNode = document.createTextNode(' ' + message.text); // Basic text node

    const timeSpan = document.createElement('span');
    timeSpan.className = 'text-xs opacity-60 ml-2 float-right'; // Style timestamp
    try {
        const date = new Date(message.timestamp);
        // Format time, e.g., HH:MM
        const options = { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo' };
        timeSpan.textContent = `(${date.toLocaleTimeString('no-NO', options)})`;
    } catch (e) { console.warn("Could not format chat timestamp:", e); }

    // Append elements to the message paragraph
    messageElement.appendChild(userElement);
    messageElement.appendChild(textNode);
    messageElement.appendChild(timeSpan); // Add timestamp

    // Style messages from the current user differently (optional)
    if (message.username === currentUser) {
        messageElement.classList.add('bg-blue-900', 'bg-opacity-30', 'border', 'border-blue-700'); // Example self-message style
        messageElement.style.marginLeft = 'auto'; // Align right conceptually
        messageElement.style.width = 'fit-content';
        messageElement.style.maxWidth = '80%';
    } else {
         messageElement.classList.add('bg-gray-700', 'bg-opacity-30'); // Example other-user style
         messageElement.style.marginRight = 'auto'; // Align left conceptually
         messageElement.style.width = 'fit-content';
         messageElement.style.maxWidth = '80%';
    }

    // Add the new message to the top (because of flex-col-reverse)
    chatMessages.prepend(messageElement);

    // Remove animation class after it finishes
    messageElement.addEventListener('animationend', () => {
        messageElement.classList.remove('new-message-animate');
    });

    // Optional: Keep scrolled to bottom (most recent message)
    // Since using flex-col-reverse, scrollTop = 0 is the bottom.
    // Only scroll if user is already near the bottom.
    // const isScrolledToBottom = chatMessages.scrollTop >= -10; // Allow some tolerance
    // if (isScrolledToBottom) {
    //    chatMessages.scrollTop = 0;
    // }
     chatMessages.scrollTop = 0; // Simpler: always scroll down for now


}

/**
 * Sends a chat message to Firebase.
 * Called by the event listener in Script 2.js.
 */
function sendChatMessage() {
    // Assumes 'firebaseInitialized', 'chatRef', 'currentUser', 'chatInput' are available.
    if (!firebaseInitialized || !chatRef) {
        alert("Chat er ikke tilgjengelig (Firebase-feil).");
        return;
    }
    if (!currentUser) {
        alert("Du må være logget inn for å chatte.");
        return;
    }
    if (!chatInput) {
         console.error("sendChatMessage: chatInput element not found.");
         return;
    }

    const messageText = chatInput.value.trim();

    if (messageText && messageText.length > 0 && messageText.length <= 280) {
        const newMessage = {
            username: currentUser,
            text: messageText, // Basic sanitization happens in displayChatMessage or could be added here
            timestamp: firebase.database.ServerValue.TIMESTAMP // Use server timestamp
        };

        // Push the new message to Firebase
        chatRef.push(newMessage)
            .then(() => {
                chatInput.value = ''; // Clear input field on success
                playButtonClickSound(); // Optional: sound on send
                console.log("Chat message sent.");
                chatInput.focus(); // Keep focus on input
            })
            .catch(error => {
                console.error("Error sending chat message:", error);
                alert("Kunne ikke sende melding. Prøv igjen.");
            });
    } else if (messageText.length > 280) {
        alert("Meldingen er for lang (maks 280 tegn).");
    } else {
        // Message is empty, maybe do nothing or give subtle feedback
        chatInput.focus();
    }
}

