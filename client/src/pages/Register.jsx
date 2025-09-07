import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../css/Register.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/auth/register", {
        username,
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      alert("Registration token: " + response.data.token);
      navigate("/chat");
      setError("");
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Unknown error";
      setError(message);
      alert("Registration failed: " + message);
    }
  };

  return (
    <div className="bg-gray-100 h-screen flex items-center justify-center">

      <div className="relative w-full max-w-4xl mx-auto">

        <div className="flex flex-col lg:flex-row-reverse bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">

            <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center lg:text-left">
              TEXT'EM
            </h1>
            <h2 className="text-3xl font-semibold text-gray-700 mb-8 text-center lg:text-left">
              Sign Up
            </h2>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label htmlFor="username" className="text-sm font-medium text-gray-900">
                  Username
                </label>
                <div className="relative mt-2">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    person
                  </span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="JohnDoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-gray-900 w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Email
                </label>
                <div className="relative mt-2">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    email
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-gray-900 w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-900">
                  Password
                </label>
                <div className="relative mt-2">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-gray-900 w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                    required
                  />
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer`}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 shadow-md"
                >
                  SIGN UP
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium text-center">{error}</p>
              )}
            </form>
          </div>

          <div className="w-full lg:w-1/2 bg-blue-600 flex items-center justify-center p-8 sm:p-12 clip-path-diagonal-reverse">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Already have an Account?</h2>
              <p className="mb-8">
                Welcome back! Log in to access your account and continue connecting.
              </p>
              <Link
                to="/login"
                className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300 shadow-md"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
