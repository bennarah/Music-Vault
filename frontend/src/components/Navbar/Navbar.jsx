import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <Link to="/">Music Vault</Link>

      <div>
        <Link to="/login ">Login</Link>
        <Link to="/register ">Register</Link>
        <Link to="/dashboard ">Dashboard</Link>
        <Link to="/recommendations ">Recommendations</Link>
        <Link to="/songs ">Select Songs</Link>
      </div>
    </nav>
  );
}

export default Navbar;