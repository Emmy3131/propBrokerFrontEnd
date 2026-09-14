import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import GuestLayout from "./layers/GuestLayout";

import Home from "./pages/guest/Home";

function App() {
  return (
    <Router>
      <Routes>

        {/* =========================
            GUEST / PUBLIC ROUTES
        ========================== */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;