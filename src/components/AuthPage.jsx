  import React, { useState } from "react";
  import Register from "./Register";
  import Login from "./Login";

  const AuthPage = () => {
    const [showRegister, setShowRegister] = useState(false);

    return (
      <div className="relative w-full h-full">
        {/* Login Form */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            showRegister ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
          }`}
        >
          <Login setShowRegister={setShowRegister} />
        </div>

        {/* Register Form */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            showRegister ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <Register setShowRegister={setShowRegister} />
        </div>
      </div>
    );
  };

  export default AuthPage;
