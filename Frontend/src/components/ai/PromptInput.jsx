function PromptInput() {
  return (
    <div className="flex gap-3">

      <input
        type="text"
        placeholder="Ask AI..."
        className="flex-1 border p-3 rounded"
      />

      <button className="bg-blue-600 text-white px-5 rounded">
        Send
      </button>

    </div>
  );
}

export default PromptInput;