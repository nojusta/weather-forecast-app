import PropTypes from 'prop-types';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-800">Weather Forecast</h1>
          <p className="text-gray-600 mt-2">Check current conditions and forecasts</p>
        </header>

        <main>
          {children}
        </main>

        <footer className="mt-12 text-center text-sm text-gray-500 py-4 border-t border-gray-200">
          <p>Data provided by LHMT (Lietuvos hidrometeorologijos tarnyba)</p>
        </footer>
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;