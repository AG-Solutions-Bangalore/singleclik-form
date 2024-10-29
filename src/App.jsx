import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/auth/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-image-crop/dist/ReactCrop.css";
const App = () => {
  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="/" element={<Register />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
