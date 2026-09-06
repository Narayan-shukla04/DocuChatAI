import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Chat = lazy(() => import("./pages/Chat"));

function App() {
  return (
    <div className="min-h-screen bg-dark-bg text-text-main font-sans">
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat/:docId" element={<Chat />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
