import React from "react";
import "./DemoCredentials.css";

const DemoCredentials = ({ setEmail, setPassword }) => {
  const fillDemo = (email, password) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="demo-box">
      <p className="demo-title">Demo Accounts</p>

      <div className="demo-item" onClick={() => fillDemo("viewer@test.com", "viewer123")}>
        <span className="role">Viewer</span>
        <span className="creds">viewer@test.com / viewer123</span>
      </div>

      <div className="demo-item" onClick={() => fillDemo("analyst@test.com", "analyst123")}>
        <span className="role">Analyst</span>
        <span className="creds">analyst@test.com / analyst123</span>
      </div>

      <div className="demo-item" onClick={() => fillDemo("admin@test.com", "admin123")}>
        <span className="role">Admin</span>
        <span className="creds">admin@test.com / admin123</span>
      </div>
    </div>
  );
};

export default DemoCredentials;