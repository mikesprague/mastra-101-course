// pseudo-code: This file is part of the Mastra 101 course demonstrating how one might handle working with an agent with conversation memory
import { useState } from "react";
import { memoryAgent } from "./agents/memory-agent.ts";

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSendMessage = async () => {
    // Add user message to UI
    setMessages([...messages, { role: "user", content: input }]);

    // Only send the newest message to the agent
    const response = await memoryAgent.stream(input, {
      resourceId: "user_123",
      threadId: "conversation_456",
    });

    // Add agent response to UI
    setMessages([...messages, { role: "assistant", content: response }]);
    setInput("");
  };

  return (
    <div>
      {/* Display messages */}
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>

      {/* Input for new messages */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}
