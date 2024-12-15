import React from 'react';
import { NavLink } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-4 text-sm font-medium ${
                isActive
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            게임 로비
          </NavLink>
          <NavLink
            to="/ranking"
            className={({ isActive }) =>
              `px-3 py-4 text-sm font-medium ${
                isActive
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            랭킹
          </NavLink>
          <NavLink
            to="/mypage"
            className={({ isActive }) =>
              `px-3 py-4 text-sm font-medium ${
                isActive
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            마이페이지
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
