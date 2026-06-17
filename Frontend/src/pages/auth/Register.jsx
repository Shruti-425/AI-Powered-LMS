import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    navigate("/");
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-96 p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">
          Register
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2 mb-3"
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-3"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 w-full"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;