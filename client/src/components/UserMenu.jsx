import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaUserCircle } from "react-icons/fa"; // User icon from react-icons
import PropTypes from "prop-types";

const UserMenu = ({ onLogout }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
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
          <div className="px-4 py-3">
            <p className="text-sm text-gray-500">User Options</p>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
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
                  className={`${
                    active ? "bg-blue-100 text-blue-600" : "text-gray-700"
                  } group flex items-center w-full px-4 py-2 text-sm`}
                >
                  Stats
                </button>
              )}
            </Menu.Item>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onLogout}
                  className={`${
                    active ? "bg-red-100 text-red-600" : "text-gray-700"
                  } group flex items-center w-full px-4 py-2 text-sm`}
                >
                  Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

UserMenu.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default UserMenu;
