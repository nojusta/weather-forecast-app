import PropTypes from "prop-types";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 to-blue-50 relative">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <main>{children}</main>
      </div>

      <footer className="bg-gray-100 text-center text-sm text-gray-500 py-4 border-t border-gray-200">
        <p>Data provided by LHMT (Lietuvos hidrometeorologijos tarnyba)</p>
      </footer>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
