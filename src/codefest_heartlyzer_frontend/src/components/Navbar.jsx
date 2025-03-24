const Navbar = ({ AuthState, logout, login, userInfo }) => {
    const Button = ({ onClick, children, className = "" }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded font-medium focus:outline-none ${className}`}
        >
            {children}
        </button>
    );

    return (
        AuthState.isAuthenticated ? (
            <div className="hidden md:flex items-center ml-auto">
                <div className="flex items-center mr-4">
                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                    <span className="text-sm text-gray-600">Connected to ICP</span>
                </div>
                <div className="border-l border-gray-300 h-6 mx-4"></div>
                <div className="flex items-center">
                    <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                        <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">ID Pengguna</span>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                            {userInfo?.principal ? `${userInfo.principal.substring(0, 16)}...` : "Loading..."}
                        </span>
                    </div>
                    <Button
                        onClick={logout}
                        className="ml-4 text-sm text-gray-600 hover:text-gray-900"
                    >
                        Keluar
                    </Button>
                </div>
            </div>
        ) : (
            <div className="hidden md:block ml-auto">
                <Button
                    onClick={login}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    Masuk dengan Internet Identity
                </Button>
            </div>
        )
    );
};

export default Navbar;