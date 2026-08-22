import { Link } from "react-router-dom";
import { ComingSoon } from "../../components/common/ComingSoon";
export function Login() {
  return (
    <div className="grid min-h-screen place-items-center p-5">
      <div className="w-full max-w-xl">
        <ComingSoon
          title="Welcome back"
          description="Secure sign-in will be available in the next build phase."
        />
        <Link className="mt-4 inline-block text-sm text-indigo-600" to="/">
          Back to home
        </Link>
      </div>
    </div>
  );
}
