import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: userSession } = useSession();
  return (
    <div className="drawer">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col lg:!translate-x-0">
        {/* <!-- Navbar --> */}
        <div className="navbar w-full bg-base-300">
          <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-3" className="btn-ghost btn btn-square">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="mx-2 flex-1 px-2">
            <Link href="/">tRPC Chat Demo</Link>
          </div>
          <div className="hidden flex-none lg:block">
            <ul className="menu menu-horizontal gap-2">
              {userSession ? (
                <Link href="/chat">
                  <li className="btn btn-link text-slate-200">Chat</li>
                </Link>
              ) : null}
              <Link href="/">
                <li
                  className={`btn ${
                    userSession ? "btn-active" : "btn-success"
                  }`}
                  onClick={
                    userSession ? () => void signOut() : () => void signIn()
                  }
                >
                  {userSession ? "Sign out" : "Sign in"}
                </li>
              </Link>
            </ul>
          </div>
        </div>

        {/* <!-- Page content here --> */}
        <main className="flex h-[calc(100vh-64px)] flex-col">{children}</main>
      </div>
      <div className="drawer-side lg:!hidden">
        <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
        <ul className="menu w-80 bg-base-100 p-4">
          <li className="btn btn-link text-slate-300">
            <Link href="/">Home</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
