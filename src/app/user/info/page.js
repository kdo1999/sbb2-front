// src/app/user/info/page.js
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserInfo() {
    const [userQuestion, setUserQuestion] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [userComments, setUserComments] = useState([]);
    const router = useRouter();

    /*useEffect(() => {
        const fetchUserData = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                router.push('/login');
            } else {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/info`, {
                    headers: {
                        'Authorization': accessToken
                    }
                });
                const result = await response.json();
                if (response.ok) {
                    setUserQuestion(result.data.posts);
                    setUserAnswers(result.data.answers);
                    setUserComments(result.data.comments);
                } else {
                    router.push('/login');
                }
            }
        };

        fetchUserData();
    }, [router]);*/

    return (
        <div className="container mx-auto my-8 p-4">
            <h1 className="text-2xl font-bold mb-4">My Information</h1>
            <Link href="/user/password/change">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4">
                    Change Password
                </button>
            </Link>
            {/*<div className="mb-8">
                <h2 className="text-xl font-bold mb-2">My Posts</h2>
                <ul>
                    {userQuestion.map(post => (
                        <li key={post.id} className="mb-2">
                            <Link href={`/question/${post.id}`} className="text-blue-500 hover:underline">
                                {post.subject}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">My Answers</h2>
                <ul>
                    {userAnswers.map(answer => (
                        <li key={answer.id} className="mb-2">
                            <Link href={`/question/${answer.questionId}`} className="text-blue-500 hover:underline">
                                {answer.content}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">My Comments</h2>
                <ul>
                    {userComments.map(comment => (
                        <li key={comment.id} className="mb-2">
                            <Link href={`/question/${comment.questionId}`} className="text-blue-500 hover:underline">
                                {comment.content}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>*/}
        </div>
    );
}