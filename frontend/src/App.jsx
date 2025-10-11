import { Routes, Route } from "react-router-dom";
import Avatars from "./pages/Avatars";
import AvatarProfile from "./pages/AvatarProfile";
import Store from "./pages/Store";
import Login from "./pages/Login";
import "./App.css";

function App() {
  return (
    <div className='app'>
      <nav className='navbar'>
        <h1>Spanish Quest - Avatar Gallery</h1>
      </nav>

      <main className='main-content'>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Avatars />} />
          <Route path='/avatar/:id' element={<AvatarProfile />} />
          <Route path='/store' element={<Store />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
