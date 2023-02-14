// import ref
import { useRef, useEffect } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";

const socket = io("https://flash-timer-server-production.up.railway.app/");
// const socket = io("http://localhost:3001");

export default function Example() {
  // get ref of the input
  const inputRef = useRef(null);
  const router = useRouter();

  function join() {
    console.log("join", inputRef.current.value);
    // change route to inputRef.current.value
    if (inputRef.current.value == "") {
      return;
    }
    router.push(`/room/${inputRef.current.value}`);
  }

  function startNew() {
    console.log("start new");
    socket.emit("join", -1);
  }

  // register for callback from server for assigning room based on socket.emit("room-number", {
  //   room: room,
  // });
  useEffect(() => {
    socket.on("room-number", (payload) => {
      console.log("room-number", payload);
      router.push(`/room/${payload.room}`);
    });
    return () => {
      socket.off("room-number");
    };
  }, []);

  return (
    <div className="isolate -space-y-px rounded-md shadow-sm grid place-items-center h-screen">
      <div>
        <div className="inline-flex items-center">
          <div className="relative rounded-md  rounded-b-none border border-gray-300 px-3 py-2 focus-within:z-10 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-indigo-600">
            <label
              htmlFor="room"
              className="block text-xs font-medium text-gray-900"
            >
              Room
            </label>
            <input
              type="number"
              name="room"
              id="room"
              className="block border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
              placeholder="123"
              ref={inputRef}
            />
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 mx-5 rounded-full h-10  "
            onClick={join}
          >
            Join
          </button>
        </div>
        <div className="grid justify-items-center my-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={startNew}
          >
            Start new
          </button>
        </div>
      </div>
    </div>
  );
}
