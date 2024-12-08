import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const SERVER_URL = "http://localhost:3000";

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [mode, setMode] = useState("short-polling"); // Toggle between short-polling and long-polling

  // Fetch messages using long polling
  const fetchMessagesLongPolling = useCallback(async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/long-polling`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages (long-polling):", error);
    } finally {
      // Automatically reconnect for long polling
      setTimeout(fetchMessagesLongPolling, 100); // Add a delay to prevent blocking
    }
  }, [setMessages]);

  // Fetch messages using short polling
  const fetchMessagesShortPolling = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/short-polling`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages (short-polling):", error);
    }
  };

  // Initialize polling based on the selected mode
  useEffect(() => {
    if (mode === "short-polling") {
      const interval = setInterval(fetchMessagesShortPolling, 3000); // Fetch every 3 seconds
      return () => clearInterval(interval);
    } else if (mode === "long-polling") {
      fetchMessagesLongPolling();
    }
  }, [mode, fetchMessagesLongPolling]);

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post(`${SERVER_URL}/send`, { message: newMessage });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Chat App</h1>

      {/* Toggle between Short Polling and Long Polling */}
      <div>
        <label>
          <input
            type="radio"
            name="polling-mode"
            value="short-polling"
            checked={mode === "short-polling"}
            onChange={() => setMode("short-polling")}
          />
          Short Polling
        </label>
        <label style={{ marginLeft: "10px" }}>
          <input
            type="radio"
            name="polling-mode"
            value="long-polling"
            checked={mode === "long-polling"}
            onChange={() => setMode("long-polling")}
          />
          Long Polling
        </label>
      </div>

      {/* Display Messages */}
      <div style={{ marginTop: "20px", maxHeight: "300px", overflowY: "auto" }}>
        <h3>Messages:</h3>
        {messages.length === 0 ? (
          <p>No messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <b>Message {index + 1}:</b> {msg.message}
            </div>
          ))
        )}
      </div>

      {/* Send Message Form */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ padding: "10px", width: "70%" }}
        />
        <button onClick={sendMessage} style={{ padding: "10px 20px", marginLeft: "10px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
