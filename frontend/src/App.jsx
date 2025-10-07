import { Routes, Route } from "react-router-dom";
import Avatars from "./pages/Avatars";
import AvatarProfile from "./pages/AvatarProfile";
import "./App.css";

function App() {
  return (
    <div className='app'>
      <nav className='navbar'>
        <h1>Spanish Quest - Avatar Gallery</h1>
      </nav>

      <main className='main-content'>
        <Routes>
          <Route path='/' element={<Avatars />} />
          <Route path='/avatar/:id' element={<AvatarProfile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
