import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-200 p-4">
      <nav>
        <ul>
          <li className="mb-2">
            <Link to="/" className="hover:text-blue-500">Accueil</Link>
          </li>
          <li className="mb-2">
            <Link to="/tools" className="hover:text-blue-500">Outils</Link>
          </li>
          <li className="mb-2">
            <Link to="/investigation" className="hover:text-blue-500">Investigation</Link>
          </li>
          <li className="mb-2">
            <Link to="/security-dashboard" className="hover:text-blue-500">Tableau de bord de sécurité</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Navigation;
