import Sidebar from "./Sidebar";

import { supabase } from "../lib/supabase";

import { useNavigate } from "react-router-dom";

function Layout({ children }) {

  const navigate = useNavigate();

  const handleLogout = async () => {

    await supabase.auth.signOut();

    navigate("/login");
  };

  return (

    <div className="flex min-h-screen bg-[#0c0c0f] text-white">

      <Sidebar />

      <div className="flex-1 ml-[90px] md:ml-[250px]">

        <div className="h-[70px] border-b border-[#23232a] flex items-center justify-between px-6 bg-[#111114]">

          <div>

            <h1 className="font-semibold text-lg">

              Purple Media

            </h1>

            <p className="text-xs text-gray-400">

              Agency Tool Pro

            </p>

          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm transition-all"
          >
            Logout
          </button>

        </div>

        <div className="p-6">

          {children}

        </div>

      </div>

    </div>
  );
}

export default Layout;