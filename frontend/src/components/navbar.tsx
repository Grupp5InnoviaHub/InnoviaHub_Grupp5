import React, { useContext, useState } from "react";
import "./navbar.css";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext.tsx";


const Navbar: React.FC = () => {
    const [open, setOpen] = useState(false);
    const { token, logout, user } = useContext(UserContext);

    return (
        <nav className="navbar">
            <div className="navbar-brand">Innovia Hub</div>
            <button
                className="navbar-toggle"
                aria-label="Toggle navigation"
                onClick={() => setOpen(!open)}
            >
                <span className="navbar-toggle-icon">&#9776;</span>
            </button>
            <div className={`navbar-links${open ? " open" : ""}`}>
                <Link to="/" className="navbar-link">
                    Home
                </Link>
                <Link to="/devices" className="navbar-link">
                    Devices
                </Link>
                {token && (
                    <Link to="/bookings" className="navbar-link">
                        Booking
                    </Link>
                )}
                {token ? (
                    <>
                    
                        <Link to="/myBookings" className="navbar-link">
                            My Bookings
                        </Link>
                        {/** Admin Link */}
                        {user.role === "Admin" && (
                            <Link to="/admin/dashboard" className="navbar-link">
                                Admin
                            </Link>
                        )}

                        <Link
                            to="/"
                            className="navbar-link"
                            onClick={() => logout()}
                        >
                            Log Out
                        </Link>
                    </>
                ) : (
                    <Link to="/login" className="navbar-link">
                        Log In
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
