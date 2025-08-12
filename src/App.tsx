import Header from "./component/Header";
import Meme from "./component/Meme";

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <Meme />
    </div>
  );
}

export default App;
