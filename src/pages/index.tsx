import { Web3ReactProvider } from "@web3-react/core";

import Demo, { getLibrary } from "../components/Demo";

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="container mx-auto min-h-screen">
        <Demo />
      </div>
    </Web3ReactProvider>
  );
}

export default App;
