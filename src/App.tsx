import { Outlet } from "react-router-dom";
import "./App.css";
import { Header } from "./shared/components/Header";

export function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Outlet />
    </div>
  );
}
