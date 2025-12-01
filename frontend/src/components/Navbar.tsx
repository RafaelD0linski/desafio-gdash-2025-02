import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth";
import { Cloud, Users, LogOut } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Cloud className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">GDASH Weather</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              {user?.role === "admin" && (
                <Link to="/users">
                  <Button variant="ghost">
                    <Users className="h-4 w-4 mr-2" />
                    Usuários
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-slate-600">
                {user.name} ({user.role})
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
