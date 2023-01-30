import { useRouter } from "next/router";

import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/Home.module.css";
import { Player } from "../../components/player";
import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { setConstantValue } from "typescript";

//const socket = io("https://flash-timer-server-production.up.railway.app/");
const socket = io("http://localhost:3001");

export default function Room() {
  const [timers, setTimers] = useState([null, null, null, null, null]);
  const [isLeader, setIsLeader] = useState(false);
  const timerRef = useRef(timers);
  const router = useRouter();
  const { room } = router.query;
  // depending on the routing this room can be changed
  function updateFunctionOnIndex(index) {
    return function updateFunction(time) {
      const new_timers = [...timers];
      new_timers[index] = time;
      setTimers(new_timers);
      console.log("updating flash: ", new_timers);
      socket.emit("update-flash", { room: room, timers: new_timers });
      // assign self as latest updated leader
      //setIsLeader(true);
    };
  }

  // pass down the function to update the timer taking in the time for the role
  useEffect(() => {
    if (router.isReady) {
      console.log("initiial router query: ", router.query);
      // register signals to procss
      // sync with server state on signal sync
      socket.on("sync", (data) => {
        console.log("syncing timers: ", data.timers);
        setTimers(data.timers);
        //setIsLeader(false);
      });

      // actual event on join
      socket.emit("join", room);
      setInterval(() => {
        setTimers((timers) => {
          return timers.map((timer) => {
            if (timer == null) {
              return null;
            }
            let res = Math.max(timer - 1, 0);
            if (res == 0) {
              return null;
            }
            return res;
          });
        });
      }, 100);

      return () => {
        socket.off("sync");
        socket.off("room-number");
      };
    }
  }, [router.isReady]);

  useEffect(() => {
    console.log("isLeader: ", isLeader);
    if (isLeader) {
      const interval = setInterval(() => {
        let local_timers;
        // hacky way to get around closure to retrieve real timers
        // setTimers((timers) => {
        //   // not sure why it's updating twice
        //   console.log("in set timers timers is", timers);
        //   local_timers = timers;
        //   socket.emit("update-flash", { room: room, timers: local_timers });
        //   return timers;
        // });
        socket.emit("update-flash", { room: room, timers: timerRef.current });
        console.log("timer set completed", timerRef.current);
        // sync with the server if you are the leader who last synced
      }, 1000);
      console.log("inteval defined");
      return () => clearInterval(interval);
    }
  }, [isLeader]);

  // update the ref
  useEffect(() => {
    timerRef.current = timers;
  }, [timers]);

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
