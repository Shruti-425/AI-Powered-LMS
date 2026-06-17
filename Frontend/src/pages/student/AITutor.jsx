import DashboardLayout from "../../components/layout/DashboardLayout";
import ChatWindow from "../../components/ai/ChatWindow";
import PromptInput from "../../components/ai/PromptInput";

function AiTutor() {
  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-6">
        AI Tutor
      </h1>

      <div className="bg-white rounded-xl shadow p-6">

        <div className="h-96 overflow-y-auto border rounded p-4 mb-4">
          <ChatWindow />
        </div>

        <PromptInput />

      </div>

    </DashboardLayout>
  );
}

export default AiTutor;