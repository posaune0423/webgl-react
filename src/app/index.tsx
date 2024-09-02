import { Link } from "react-router-dom";

function App() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-2">
      <Link className="text-2xl text-white font-bold hover:text-gray-400" to="/pixel">
        Pixel
      </Link>
      <Link className="text-2xl text-white font-bold hover:text-gray-400" to="/test">
        Test
      </Link>
    </main>
  );
}

export default App;
