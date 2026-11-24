import { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AUTHENTICATION from './AUTHENTICATION';
import ADMIN from './ADMIN';
import LECTURER from './LECTURER';
import STUDENT from './STUDENT';

function App() {
  const [currentPage, setCurrentPage] = useState('auth');
  const [userRole, setUserRole] = useState('');

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    setCurrentPage(role.toLowerCase());
  };

  const handleLogout = () => {
    setCurrentPage('auth');
    setUserRole('');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        return <ADMIN onLogout={handleLogout} />;
      case 'lecturer':
        return <LECTURER onLogout={handleLogout} />;
      case 'student':
        return <STUDENT onLogout={handleLogout} />;
      default:
        return <AUTHENTICATION onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;
