import Header from "./component/Header";
import Meme from "./component/Meme";
import { Analytics } from "@vercel/analytics/react";

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <Meme />
      <Analytics />
    </div>
  );
}

export default App;
