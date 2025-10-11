import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/login" : "/api/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Authentication failed");
      }

      const data = await response.json();

      // Store token and user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to home page
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-container'>
      <div className='login-card'>
        <div className='login-header'>
          <h1>
            <i className='fa-solid fa-dragon'></i> Spanish Quest
          </h1>
          <p className='login-subtitle'>
            {isLogin ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='login-form'>
          <div className='form-group'>
            <label htmlFor='name'>
              <i className='fa-solid fa-user'></i> Username
            </label>
            <input
              type='text'
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter your username'
              required
              autoComplete='username'
            />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>
              <i className='fa-solid fa-lock'></i> Password
            </label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <div className='error-message'>
              <i className='fa-solid fa-triangle-exclamation'></i> {error}
            </div>
          )}

          <button type='submit' className='login-btn' disabled={loading}>
            {loading ? (
              <>
                <i className='fa-solid fa-spinner fa-spin'></i> Processing...
              </>
            ) : (
              <>
                <i
                  className={`fa-solid ${
                    isLogin ? "fa-right-to-bracket" : "fa-user-plus"
                  }`}
                ></i>
                {isLogin ? "Login" : "Register"}
              </>
            )}
          </button>
        </form>

        <div className='login-footer'>
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type='button'
              className='toggle-btn'
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              {isLogin ? "Register here" : "Login here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
