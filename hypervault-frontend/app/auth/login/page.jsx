"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/useAuthStore';
import { login as loginFunc } from '@/calls';
import Link from 'next/link';

export default function Login() {
    const { isLoggedIn, login } = useAuthStore();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isLoggedIn)
            router.push('/');
    }, [isLoggedIn]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (await loginFunc(username, password)) {
            setMessage('');
            login();
        }
        else
            setMessage("Invalid username or password")
    };

    return (
        <div className='w-full min-h-screen flex justify-center items-center'>
            <div className='flex flex-col gap-3'>
                <h1 className='text-3xl font-bold text-center'>Login</h1>
                <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className='btn'>Login</button>
                    <span className='text-red-500 text-center'>{message}</span>
                    <span className='text-center'>Don&apos;t have an account? <Link className="link" href="/auth/register">Register</Link></span>
                </form>
            </div>
        </div>
    );
}
