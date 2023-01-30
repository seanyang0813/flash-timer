import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import flashImg from "../assets/flash.png";
import topImage from "../assets/top.png";
import jungleImage from "../assets/jungle.png";
import midImage from "../assets/mid.png";
import botImage from "../assets/bot.png";
import supportImage from "../assets/support.png";

const roles = ["top", "jungle", "mid", "bot", "support"];

const role_image_map = {
  top: topImage,
  jungle: jungleImage,
  mid: midImage,
  bot: botImage,
  support: supportImage,
};

export const Player = ({ index, timers, updateFunction }) => {
  const role = roles[index];

  function subtract_10_sec() {
    if (timers[index] == null) {
      return;
    }
    updateFunction(Math.max(timers[index] - 100, 0));
  }

  function use_flash() {
    updateFunction(3000);
  }

  return (
    <div className="grid grid-cols-3 grid-rows-2">
      <div className="col-span-1 row-span-2">
        <Image
          className="object-contain rounded-full"
          src={role_image_map[role]}
          alt={role}
        ></Image>
      </div>
      <div className="col-span-2 row-span-1">
        <h1 className="text-xl font-bold text-gray-300">{role}</h1>
        <div className="justify-center flex">
          <div>
            <button>
              <Image
                src={flashImg}
                width={50}
                height={50}
                alt={"flash icon"}
                onClick={() => use_flash()}
              ></Image>
            </button>
            <div>
              <button
                className="text-gray-300 bg-blue-500 hover:bg-blue-700  font-bold px-4 rounded"
                onClick={subtract_10_sec}
              >
                -10
              </button>
            </div>
            <p className="text-xl font-bold text-gray-300">
              {timers[index] == null
                ? "not on cd"
                : Math.floor(timers[index] / 10)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
