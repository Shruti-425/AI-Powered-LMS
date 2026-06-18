import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAiReply } from "../../utils/aiReplies";

const tools = [
  {
    title: "Quiz Question Generator",
    description: "Generate MCQ ideas for your next class test.",
    prompt: "Generate 5 MCQ questions on binary trees for CS301",
  },
  {
    title: "Assignment Rubric Helper",
    description: "Draft marking criteria for programming assignments.",
    prompt: "Create a rubric for a linked list assignment out of 100 marks",
  },
  {
    title: "Lecture Summary",
    description: "Summarize a topic for student revision notes.",
    prompt: "Summarize normalization in DBMS for students",
  },
];

function AiTools() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome to AI Teaching Tools. Use a quick tool below or ask me to generate quiz questions, rubrics, or lecture summaries.",
    },
  ]);
  const [input, setInput] = useState("");

  const runPrompt = (prompt) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: prompt },
      { role: "assistant", text: getAiReply(prompt) },
    ]);
  };

  const sendMessage = (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    runPrompt(question);
    setInput("");
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-2">AI Teaching Tools</h1>
      <p className="text-slate-500 mb-6">Generate quiz questions, rubrics, and lecture summaries</p>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {tools.map((tool) => (
          <button
            key={tool.title}
            onClick={() => runPrompt(tool.prompt)}
            className="bg-white rounded-xl shadow p-5 text-left hover:shadow-md transition"
          >
            <h3 className="font-semibold text-blue-700">{tool.title}</h3>
            <p className="text-sm text-gray-500 mt-2">{tool.description}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="h-80 overflow-y-auto border rounded p-4 mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded whitespace-pre-line max-w-[90%] ${
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
            placeholder="Ask for quiz questions, rubrics, summaries..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border p-3 rounded"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded">
            Generate
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default AiTools;
