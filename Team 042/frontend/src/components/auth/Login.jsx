import React, { useState } from "react";
import Sync from "../../assets/sync.png";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { CircleUserRound, EyeIcon, EyeOffIcon } from "lucide-react";
import { LockKeyhole } from "lucide-react";
import api from "@/src/api/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(e)
    try {
      const response = await api.post(
        "http://localhost:3000/api/v1/client/login",
        {
          email: email,
          password: password,
        }
      );
      console.log(email)
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      navigate("/dashboard");
    } catch (error) {
      console.log(email)
      toast.error("Invalid Credentials");
    }
  };

  return (
    <div className="w-full flex">
      <img src={Sync} className="w-screen h-screen" />
      <div className="absolute right-0 h-screen  w-[35%] bg-gradient-to-t from-[#555554] via-[#171717] to-[#181919] flex items-center justify-center flex-col">
        <div className="w-[85%] flex flex-col justify-center items-start">
          <h1 className="text-[36px] text-white font-bold mb-16">
            Login to SyncZero
          </h1>
          <form onSubmit={handleLogin} className="w-full">
            <div className="mb-4">
              <Label
                htmlFor="email"
                className="text-white text-[17px] font-normal"
              >
                Username or email
              </Label>

              <CircleUserRound className="text-white relative left-2 top-8" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your username or email"
                className="h-[44px] text-white pl-10 border-none bg-black focus:outline-none"
                required
              />
            </div>

            <div className="mb-4">
              <Label
                htmlFor="password"
                className="text-white text-[17px] font-normal"
              >
                Password
              </Label>
              <LockKeyhole className="text-white relative left-2 top-8" />
              <div className="flex items-center bg-black">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-[44px] text-white pl-10 border-none bg-black focus:outline-none"
                  required
                />
                {show ? (
                  <EyeIcon
                    className="text-white relative right-2 top-0 cursor-pointer"
                    onClick={() => setShow(!show)}
                  />
                ) : (
                  <EyeOffIcon
                    className="text-white relative right-2 top-0 cursor-pointer"
                    onClick={() => setShow(!show)}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-500"
                  />
                  <span className="ml-2 text-white">Remember Me</span>
                </label>
              </div>
              <div>
                <a href="#" className="text-blue-500 hover:text-blue-400">
                  Forgot Password?
                </a>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-400"
            >
              Log In
            </Button>
          </form>
          <div className="relative flex py-5 items-center w-full">
            <div className="flex-grow border-t border"></div>
            <span className="flex-shrink mx-4 text-gray-400">Or</span>
            <div className="flex-grow border-t border"></div>
          </div>

          <div>
            <div className="flex flex-row w-full justify-between">
              <Button
                className="w-[30%] bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500 border-none"
                type="button"
                variant="outline"
              >
                <span>Google</span>
              </Button>
              <Button
                className="w-[30%] bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500 border-none"
                type="button"
                variant="outline"
              >
                <span>Microsoft</span>
              </Button>
              <Button
                className="w-[30%] bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500 border-none"
                type="button"
                variant="outline"
              >
                <span>SSO</span>
              </Button>
            </div>
            <div className="mt-4 text-gray-400 text-start">
              By creating an account, you agree to the{" "}
              <a href="#" className="text-blue-500 hover:text-blue-400">
                Terms of Service
              </a>
              . We'll occasionally send you account-related emails.
            </div>
          </div>
        </div>

        <div className="absolute right-10 bottom-10 w-[85%] mt-8 text-gray-400 text-sm flex items-center justify-between">
          <div className="space-x-5">
            <a href="#" className="hover:text-gray-300">
              Terms
            </a>
            <a href="#" className="hover:text-gray-300">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-300">
              Docs
            </a>
            <a href="#" className="hover:text-gray-300">
              Helps
            </a>
          </div>
          <div className="flex items-center">
            <span className="mr-2">English</span>
            <div className="w-6 h-6 bg-gray-500 rounded-full flex justify-center items-center cursor-pointer hover:bg-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
