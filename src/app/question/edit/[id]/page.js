"use client";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export default function UpdateQuestion({params}) {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [id, setId] = useState();
    const [errors, setErrors] = useState({});
    const router = useRouter();

    useEffect(() => {
        async function unwrapParams() {
            const unwrappedParams = await params;
            setId(unwrappedParams.id);
        }

        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    router.push('/login');
                } else {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/question/${id}`, {
                        cache: 'no-store',
                        credentials: 'include',
                        headers: {
                            'Authorization': accessToken
                        }
                    });
                    const result = await response.json();
                    if (result.code === 401) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('username');
                        router.push('/login');
                    } else if (!result.data.isAuthor) {
                        alert('질문 작성자만 수정할 수 있습니다.');
                        router.push('/');
                    } else {
                        setSubject(result.data.subject);
                        setContent(result.data.content);
                    }
                }
            };
            fetchData();
        }
    }, [id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            router.push('/login');
        } else {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/question/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken
                },
                body: JSON.stringify({subject: subject, content: content})
            });

            const result = await response.json();

            if (response.ok) {
                router.push(`/question/${id}`);
            } else if (result.code === 400) {
                const newErrors = {};
                result.errorDetail.errors.forEach(error => {
                    newErrors[error.field] = error.reason;
                });
                setErrors(newErrors);
            }
        }
    };

    return (
        <div className="container mx-auto my-8 p-4">
            <h1 className="text-2xl font-bold mb-4">Update Question</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
                        Title
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Enter the title"
                    />
                    {errors.subject && <p className="text-red-500 text-xs italic">{errors.subject}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                        Content
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Enter the body"
                        rows="10"
                    />
                    {errors.content && <p className="text-red-500 text-xs italic">{errors.content}</p>}
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}