"use client";
import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export default function QuestionDetail({params}) {
    const [question, setQuestion] = useState(null);
    const [answerList, setAnswerList] = useState([]);
    const [id, setId] = useState(null);
    const [answerContent, setAnswerContent] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
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
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                router.push('/login');
            }
            const fetchQuestion = async () => {
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
                } else {
                    setQuestion(result.data);
                }
            };
            fetchQuestion();
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                router.push('/login');
            }
            const fetchAnswer = async () => {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer?questionId=${id}`, {
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
                } else {
                    setAnswerList(result.data.content);
                }
            };

            fetchAnswer();
        }
    }, [id]);

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) {
            return;
        }

        setIsLoading(true)
        setErrors({});

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setIsLoading(false);
            router.push('/login');
        } else {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken
                },
                body: JSON.stringify({questionId: id, content: answerContent})
            });
            const result = await response.json();

            if (response.ok) {
                setAnswerContent('');
                setIsLoading(false);

                setAnswerList((prevData) => [
                    ...prevData,
                    result.data
                ]);
            } else if (result.code === 400) {
                const newErrors = {};
                result.errorDetail.errors.forEach(error => {
                    newErrors[error.field] = error.reason;
                });
                setErrors(newErrors);
                setIsLoading(false);

            }
        }
    };

    const deleteQuestionCheck = () => {
        if (confirm("정말 삭제하시겠습니까??") == true) {    //확인
            handleQuestionDelete();
        } else {   //취소
            return false;
        }
    }

    const handleQuestionDelete = async () => {
        setErrors({});

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            router.push('/login');
        } else {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/question/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken
                },
            });
            console.log(response);

            const result = await response.json();

            if (result.code === 401) {
                alert('질문 삭제는 질문 작성자만 가능합니다.');
            } else if (response.ok) {
                alert('질문이 삭제되었습니다.');
                router.push('/');
            }
        }
    };

    const deleteAnswerCheck = async (answerId) => {
        if (confirm("정말 삭제하시겠습니까??") == true) {    //확인
            handleAnswerDelete(answerId);
        } else {   //취소
            return false;
        }
    }

    const handleAnswerDelete = async (answerId) => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            router.push('/login');
        } else {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer/${answerId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken
                },
            });

            if (response.ok) {
                setAnswerList((prevData) => prevData.filter((answer) => answer.id !== answerId));
            } else if (response.code === 401) {
                alert('답변 삭제는 답변 작성자만 가능합니다.');
            } else if (response.code === 400) {
                alert('답변 삭제 중 오류가 발생했습니다.');
            } else {
                alert('답변 삭제 중 오류가 발생했습니다.');
            }
        }
    };
    const handlePostVoter = async (id, type) => {
        const accessToken = localStorage.getItem('accessToken');
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        if (!accessToken) {
            setIsLoading(false);
            router.push('/login');
        } else {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voter/${id}?voterType=${type}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken
                }
            });

            if (response.ok) {
                if (type === 'question') {
                    setQuestion((prevData) => ({
                        ...prevData,
                        voterCount: prevData.voterCount + 1,
                        isVoter: true
                    }));
                } else if (type === 'answer') {
                    setAnswerList((prevData) => prevData.map((answer) =>
                        answer.id === id
                            ? {...answer, voterCount: answer.voterCount + 1, isVoter: true}
                            : answer
                    ));
                }
            } else if (response.status === 400) {
                const result = await response.json();
                alert(result.message);
            } else {
                alert('추천 중 오류가 발생했습니다.');
            }
            setIsLoading(false);
        }
    };

    const handleDeleteVoter = async (id, type) => {
        if (isLoading) {
            return;
        }

        setIsLoading(true);

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setIsLoading(false);
            router.push('/login');
        } else {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voter/${id}?voterType=${type}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken
                }
            });

            if (response.ok) {
                if (type === 'question') {
                    setQuestion((prevData) => ({
                        ...prevData,
                        voterCount: prevData.voterCount - 1,
                        isVoter: false
                    }));
                } else if (type === 'answer') {
                    setAnswerList((prevData) => prevData.map((answer) =>
                        answer.id === id
                            ? {...answer, voterCount: answer.voterCount - 1, isVoter: false}
                            : answer
                    ));
                }
            } else if (response.status === 400) {
                const result = await response.json();
                alert(result.message);
            } else {
                alert('추천 중 오류가 발생했습니다.');
            }
            setIsLoading(false);
        }
    };


    if (!question) {
        return <div>Loading...</div>;
    }

    const {subject, content, author, createdAt, modifiedAt, voterCount, isAuthor, isVoter} = question;

    return (
        <div className="container mx-auto my-8 px-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">{subject}</h1>
                        {isAuthor && (
                            <div className="flex space-x-2">
                                <Link href={`/question/edit/${id}`}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300">
                                    Edit
                                </Link>
                                <button onClick={deleteQuestionCheck}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300">
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="prose max-w-none mb-6">
                        <ReactMarkdown className="text-gray-700">
                            {content}
                        </ReactMarkdown>
                    </div>
                    <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6">
                        <div className="flex items-center mr-6 mb-2">
                            <span>{author}</span>
                        </div>
                        <div className="flex items-center mr-6 mb-2">
                            <span>Created: {new Date(createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center mr-6 mb-2">
                            <span>Modified: {new Date(modifiedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center mr-6 mb-2">
                            <button
                                className={`px-4 py-2 rounded ${isVoter ? 'bg-green-600 text-white' : 'bg-transparent text-gray-800 border border-gray-800'} transition-colors duration-300`}
                                onClick={() => isVoter ? handleDeleteVoter(id, 'question') : handlePostVoter(id, 'question')}
                            >
                                {isVoter ? '추천 취소' : '추천하기'}
                            </button>
                            <span className="ml-4">추천 수: {voterCount}</span>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-200 px-6 py-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        Answers
                    </h2>
                    {answerList.length > 0 ? (
                        <ul className="space-y-6">
                            {answerList.map((answer) => (
                                <li key={answer.id} className="bg-gray-50 rounded-lg p-4 shadow">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-700 mb-2">{answer.content}</p>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="mr-4">{answer.author}</span>
                                                <span>Created: {new Date(answer.createdAt).toLocaleString()}</span>
                                                <span
                                                    className="ml-4">Modified: {new Date(answer.modifiedAt).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center mr-6 mb-2">
                                                <button
                                                    className={`px-4 py-2 rounded ${answer.isVoter ? 'bg-green-600 text-white' : 'bg-transparent text-gray-800 border border-gray-800'} transition-colors duration-300`}
                                                    onClick={() => answer.isVoter ? handleDeleteVoter(answer.id, 'answer') : handlePostVoter(answer.id, 'answer')}
                                                >
                                                    {answer.isVoter ? '추천 취소' : '추천하기'}
                                                </button>
                                                <span className="ml-4">추천 수: {answer.voterCount}</span>
                                            </div>
                                        </div>
                                        {answer.isAuthor && (
                                            <div className="flex space-x-2">
                                                <Link href={`/answer/edit/${answer.id}`}
                                                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300">
                                                    Edit
                                                </Link>
                                                <button onClick={() => deleteAnswerCheck(answer.id)}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300">
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 italic">No answers yet.</p>
                    )}
                </div>
                <div className="border-t border-gray-200 px-6 py-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Write an Answer</h2>
                    <form onSubmit={handleAnswerSubmit} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="answerContent">
                                Content
                            </label>
                            <textarea
                                id="answerContent"
                                name="answerContent"
                                value={answerContent}
                                onChange={(e) => setAnswerContent(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Enter your answer"
                                rows="5"
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
            </div>
        </div>
    );
}