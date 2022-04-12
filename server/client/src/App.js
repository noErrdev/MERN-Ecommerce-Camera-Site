import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components";
import {
  ForgotPassword,
  Home,
  Login,
  Register,
  ActivationEmail,
  ResetPassword,
  NotFound,
  PrivateRoute,
  UserDashboard,
  Profile,
  Myorders,
} from "./pages";
import { refreshToken } from "./redux/actions/userActions";
import { useDispatch } from "react-redux";
import { ToastProvider } from "react-toast-notifications";
import { useSelector } from "react-redux";
import "./styles/styles.scss";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(refreshToken());
  }, [dispatch]);

  const user = useSelector((state) => state?.userLogin?.userInfo);
  return (
    <ToastProvider placement="top-right">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="register"
          element={user?.access_token ? <Navigate to="/" /> : <Register />}
        />
        <Route path="login" element={<Login />} />

        <Route
          path="/forgotpassword"
          element={
            user?.access_token ? <Navigate to="/" /> : <ForgotPassword />
          }
        ></Route>

        <Route path="/user/reset/:token" element={<ResetPassword />} />

        <Route
          path="/active/:activation_token"
          element={
            user?.access_token ? <Navigate to="/" /> : <ActivationEmail />
          }
        />

        {user?.access_token && user?.user?.role === 0 && (
          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<Profile />} />
            <Route path="myorders" element={<Myorders />} />
          </Route>
        )}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
