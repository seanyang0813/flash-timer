import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Player } from "../components/player";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("https://flash-timer-server-production.up.railway.app/");

export default function Example() {
  const [timers, setTimers] = useState([null, null, null, null, null]);
  // depending on the routing this room can be changed
  const [room, setRoom] = useState(100);
  function updateFunctionOnIndex(index) {
    return function updateFunction(time) {
      const new_timers = [...timers];
      new_timers[index] = time;
      setTimers(new_timers);
      console.log("updating flash: ", new_timers);
      socket.emit("update-flash", { room: room, timers: new_timers });
    };
  }

  // pass down the function to update the timer taking in the time for the role
  useEffect(() => {
    // register signals to procss
    // sync with server state on signal sync
    socket.on("sync", (data) => {
      console.log("syncing timers: ", data.timers);
      setTimers(data.timers);
    });

    socket.on("room-number", (room) => {
      console.log("current room number: ", room);
      setRoom(room);
    });

    // actual event on join
    socket.emit("join", room);
    setInterval(() => {
      setTimers((timers) => {
        return timers.map((timer) => {
          if (timer == null) {
            return null;
          }
          return Math.max(timer - 1, 0);
        });
      });
    }, 100);

    return () => {
      socket.off("sync");
      socket.off("room-number");
    };
  }, []);

  return (
    <div className="grid grid-rows-5 grid-flow-row-dense bg-slate-900 h-screen p-6 ">
      <div className="text-grey-darker text-center bg-grey-light px-4 py-2 m-2">
        {Array.from({ length: 5 }, (_, index) => (
          <Player
            key={index}
            index={index}
            timers={timers}
            updateFunction={updateFunctionOnIndex(index)}
          ></Player>
        ))}
      </div>
    </div>
  );
}
