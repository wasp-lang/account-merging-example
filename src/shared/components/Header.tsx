import { logout, useAuth } from "wasp/client/auth";
import { Link } from "wasp/client/router";
import { Button } from "./Button";

export function Header() {
  const { data: user } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">
            Task Manager
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/account-merge"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Account Merge
                </Link>
                <Button onClick={logout} size="sm" variant="ghost">
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Login
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
