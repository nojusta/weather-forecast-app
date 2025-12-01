import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaUserCircle } from "react-icons/fa";
import PropTypes from "prop-types";

const UserMenu = ({
  isAuthenticated,
  isGuest,
  onLogout,
  onLogin,
  onOpenHistory,
  onOpenStats,
  onOpenAlerts,
  onOpenAccount,
}) => {
  if (!isAuthenticated && !isGuest) {
    return null;
  }

  return (
    <div className="relative inline-block text-left">
      <Menu as="div">
        <div>
          <Menu.Button className="flex items-center text-gray-700 hover:text-blue-500 focus:outline-none">
            <FaUserCircle className="w-8 h-8 text-blue-500 hover:text-blue-600" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {isAuthenticated && (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onOpenAccount}
                        className={`${
                          active ? "bg-blue-100 text-blue-600" : "text-gray-700"
                        } group flex items-center w-full px-4 py-2 text-sm`}
                      >
                        Account
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onOpenHistory}
                        className={`${
                          active ? "bg-blue-100 text-blue-600" : "text-gray-700"
                        } group flex items-center w-full px-4 py-2 text-sm`}
                      >
                        History
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onOpenStats}
                        className={`${
                          active ? "bg-blue-100 text-blue-600" : "text-gray-700"
                        } group flex items-center w-full px-4 py-2 text-sm`}
                      >
                        Stats
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onOpenAlerts}
                        className={`${
                          active ? "bg-blue-100 text-blue-600" : "text-gray-700"
                        } group flex items-center w-full px-4 py-2 text-sm`}
                      >
                        Alerts
                      </button>
                    )}
                  </Menu.Item>
                </>
              )}
            </div>
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => {
                      if (isGuest) {
                        localStorage.removeItem("isAuthenticated");
                        localStorage.removeItem("isGuest");
                        onLogin();
                      } else {
                        onLogout();
                      }
                    }}
                    className={`${
                      active
                        ? isGuest
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                        : isGuest
                        ? "text-green-600"
                        : "text-red-600"
                    } group flex items-center w-full px-4 py-2 text-sm`}
                  >
                    {isGuest ? "Login to access more features" : "Logout"}
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

UserMenu.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  isGuest: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onOpenHistory: PropTypes.func.isRequired,
  onOpenStats: PropTypes.func.isRequired,
  onOpenAlerts: PropTypes.func.isRequired,
  onOpenAccount: PropTypes.func.isRequired,
};

export default UserMenu;
