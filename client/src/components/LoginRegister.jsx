import PropTypes from "prop-types";
import useAuth from "../hooks/useAuth";

const LoginRegister = ({ onLoginSuccess, onGuestAccess }) => {
  const {
    isLogin,
    setIsLogin,
    formData,
    error,
    handleInputChange,
    handleSubmit,
  } = useAuth(onLoginSuccess);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-sky-500 text-white px-8 py-8">
          <h2 className="font-bold text-3xl text-center mb-2">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </h2>
          <p className="text-white opacity-90 text-center">
            {isLogin
              ? "Sign in to access your weather dashboard"
              : "Join us to get personalized weather forecasts"}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your username"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-sky-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="mt-2 text-blue-500 font-medium hover:text-blue-600 transition-colors"
            >
              {isLogin ? "Create Account" : "Sign In"}
            </button>
          </div>
        </div>

        <div className="bg-gray-100 px-8 py-6 text-center">
          <button
            onClick={onGuestAccess}
            className=" bg-gradient-to-r from-blue-400 to-sky-500  text-white px-6 py-2 rounded-lg font-medium hover:from-blue-500 hover:to-sky-500 transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

LoginRegister.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
  onGuestAccess: PropTypes.func.isRequired,
};

export default LoginRegister;
