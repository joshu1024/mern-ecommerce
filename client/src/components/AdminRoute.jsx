import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
const AdminRoute = ({ children }) => {
  const { isLoggedIn, user } = useSelector((state) => state.user);

  const savedUser = !isLoggedIn
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const adminUser = user || savedUser?.user;

  if (!adminUser || adminUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
