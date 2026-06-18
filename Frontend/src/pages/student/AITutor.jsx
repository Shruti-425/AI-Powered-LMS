import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAiReply } from "../../utils/aiReplies";

function AiTutor() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I am your AI Tutor. Ask me about SQL, algorithms, DBMS, cloud computing, or operating systems.",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;

    const answer = getAiReply(question);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "assistant", text: answer },
    ]);
    setInput("");
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">AI Tutor</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="h-96 overflow-y-auto border rounded p-4 mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded max-w-[85%] whitespace-pre-line ${
                message.role === "user" ? "bg-blue-100 ml-auto" : "bg-green-100"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            placeholder="Ask AI... e.g. What is SQL?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border p-3 rounded"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded">
            Send
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default AiTutor;
