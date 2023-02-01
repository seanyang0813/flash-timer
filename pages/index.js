import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Player } from "../components/player";
import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";

export default function Example() {
  // pass down the function to update the timer taking in the time for the role
  useEffect(() => {
    // actual event on join
    // socket.emit("join", room);
    // setInterval(() => {
    //   setTimers((timers) => {
    //     return timers.map((timer) => {
    //       if (timer == null) {
    //         return null;
    //       }
    //       let res = Math.max(timer - 1, 0);
    //       if (res == 0) {
    //         return null;
    //       }
    //       return res;
    //     });
    //   });
    // }, 100);
  }, []);

  return <div>hello</div>;
}
