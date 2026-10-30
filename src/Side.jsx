const Side = () => {
  return (
    <div className="h-screen w-64 bg-gray-800 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold">My App</h1>
        <ul className="mt-6">
          <li className="mb-2">
            <a
              className="block p-2 rounded-md hover:bg-gray-700"
              href="#"
            >
              Dashboard
            </a>
          </li>
          <li className="mb-2">
            <a
              className="block p-2 rounded-md hover:bg-gray-700"
              href="#"
            >
              Inbox
            </a>
          </li>
          <li className="mb-2">
            <a
              className="block p-2 rounded-md hover:bg-gray-700"
              href="#"
            >
              Sent
            </a>
          </li>
          <li className="mb-2">
            <a
              className="block p-2 rounded-md hover:bg-gray-700"
              href="#"
            >
              Spam
            </a>
          </li>
          <li>
            <a
              className="block p-2 rounded-md hover:bg-gray-700"
              href="#"
            >
              Trash
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Side;