import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home_page";
import Login from "./pages/login_page";
import Register from "./pages/register_page";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/protectedRoute";
import { useSelector } from "react-redux";
import Loader from "./components/loader";
import Profile from "./pages/profile";


function App() {
  const {loader} = useSelector(state => state.loaderReducer)
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      {loader && <Loader />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute> <Home /> </ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
