const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors()); 

// In-memory storage for messages
let messages = [];
let longPollingClients = [];

// Configuration constants
const LONG_POLL_TIMEOUT = 50000; // 30 seconds timeout for long-polling

/**
 * Endpoint to send a new message
 */
app.post("/send", (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Add the new message with a timestamp
  const newMessage = { message, timestamp: Date.now() };
  messages.push(newMessage);

  // Notify all long-polling clients
  longPollingClients.forEach(({ res }) => {
    res.json([newMessage]);
  });
  longPollingClients = []; // Clear the long-polling queue

  console.log(`New message received: ${message}`);
  res.status(200).json({ success: true, message: "Message sent successfully." });
});

/**
 * Short polling endpoint to fetch messages
 * Accepts an optional `since` query parameter for fetching recent messages.
 */
app.get("/short-polling", (req, res) => {
  const since = parseInt(req.query.since, 10) || 0;
  const recentMessages = messages.filter((msg) => msg.timestamp > since);

  res.json(recentMessages);
});

/**
 * Long polling endpoint to fetch messages
 */
app.get("/long-polling", (req, res) => {
  if (messages.length > 0) {
    return res.json(messages); // Send existing messages immediately
  }

  // Add the client to the long-polling queue
  const client = { req, res };
  longPollingClients.push(client);

  // Set a timeout to prevent indefinite hanging
  setTimeout(() => {
    const index = longPollingClients.indexOf(client);
    if (index !== -1) {
      longPollingClients.splice(index, 1); // Remove stale client
      res.json([]); // Send an empty response
    }
  }, LONG_POLL_TIMEOUT);

  console.log("Client added to long-polling queue");
});

/**
 * Start the server
 */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
});
