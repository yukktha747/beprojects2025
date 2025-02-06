import React, { useState } from "react";
import Sync from "../assets/sync.png";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate()

  const handleLogin = () => {};
  return (
    <div className="w-full flex">
      <img src={Sync} className="w-[85%] h-screen" />
      <div className="absolute right-0 h-screen  w-[35%] bg-gradient-to-t from-[#555554] via-[#171717] to-[#181919] flex items-center justify-center flex-col">
        <div className="w-[85%] flex flex-col justify-center items-start">
            <div className="flex gap-3">
            <ChevronLeft className="text-white cursor-pointer" onClick={()=> navigate("/login")}/><p className="text-white">Back to Login</p>
            </div>
          <h1 className="text-[36px] text-white font-bold mb-16">
            Set a Password
          </h1>
          <p className="text-white mb-5">Your previous password has been reseted. Please set a new password for your account.</p>
          <form onSubmit={handleLogin} className="w-full">
            <div className="mb-4">
              <Label
                htmlFor="email"
                className="text-white text-[17px] font-semibold"
              >
                Create Password
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="h-[44px] text-white"
                required
              />
            </div>
            <div className="mb-4">
              <Label
                htmlFor="email"
                className="text-white text-[17px] font-semibold"
              >
                Re - enter Password
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="h-[44px] text-white"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-400 font-bold"
            >
              Submit
            </Button>
          </form>
          <div className="my-6 border-b border-gray-600 text-center">
            <span className="bg-gray-800 px-4 text-sm text-gray-400">Or</span>
          </div>
          <div>
            <div className="flex flex-row border w-full justify-between">
              <Button
                className="w-[30%] bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-100"
                type="button"
                variant="outline"
              >
                <span>Google</span>
              </Button>
              <Button
                className="w-[30%] bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500"
                type="button"
                variant="outline"
              >
                <span>Microsoft</span>
              </Button>
              <Button
                className="w-[30%] bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500"
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
