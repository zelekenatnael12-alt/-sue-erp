import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NetworkStatus from './layout/NetworkStatus';
import './Header.css';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? '?';

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">{title}</h1>
        <span className="badge badge--primary">
          {user?.role === 'EXECUTIVE' ? 'Executive' : `${user?.region || 'Coordinator'}`}
        </span>
      </div>
      
      <div className="header__right">
        <div className="language-selector">
          <button type="button" className="language-selector__btn language-selector__btn--active">English</button>
          <button type="button" className="language-selector__btn">አማርኛ</button>
        </div>
        
        <div className="header__actions">
          <NetworkStatus />
          <button type="button" className="header__action-btn">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button type="button" className="header__action-btn">
            <span className="material-symbols-outlined">search</span>
          </button>
          
          {/* User Avatar with Dropdown */}
          <div className="header__user-menu">
            <div className="header__avatar" title={user?.name || user?.email}>
              {initials}
            </div>
            <div className="header__user-dropdown">
              <div className="header__user-info">
                <p className="header__user-name">{user?.name || 'User'}</p>
                <p className="header__user-email">{user?.email}</p>
                <p className="header__user-role">{user?.role === 'EXECUTIVE' ? '★ Executive' : `📍 ${user?.region || 'Coordinator'}`}</p>
              </div>
              <div className="header__dropdown-divider"></div>
              <button type="button" className="header__dropdown-item" onClick={() => navigate('/')}>
                <span className="material-symbols-outlined">dashboard</span>
                Dashboard
              </button>
              <button type="button" className="header__dropdown-item header__dropdown-item--danger" onClick={handleLogout}>
                <span className="material-symbols-outlined">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
