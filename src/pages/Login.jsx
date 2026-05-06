import { useState } from "react";

import { supabase } from "../lib/supabase";

import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({

        email,
        password,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0f]">

      <div className="bg-[#141417] p-8 rounded-2xl w-full max-w-md border border-[#23232a]">

        <h1 className="text-3xl font-bold mb-2">

          Welcome Back

        </h1>

        <p className="text-gray-400 mb-6">

          Login to Agency Tool

        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full mb-6"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 transition-all"
        >
          {
            loading
              ? "Logging in..."
              : "Login"
          }
        </button>

      </div>

    </div>
  );
}

export default Login;