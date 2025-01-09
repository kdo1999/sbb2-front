// src/app/question/[id]/page.js
"use client";
import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import AnswerList from '@/components/AnswerList';
import Pagination from '@/components/Pagination';
import AnswerForm from '@/components/AnswerForm';
import CommentSection from '@/components/CommentSection';

export default function QuestionDetail({params}) {
    const [question, setQuestion] = useState(null);
    const [answerList, setAnswerList] = useState([]);
    const [id, setId] = useState(null);
    const [answerContent, setAnswerContent] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sort, setSort] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const [selectedSortLabel, setSelectedSortLabel] = useState('recent');
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
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer?questionId=${id}&pageNum=${page}&order=${order}&sort=${sort}`, {
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
                    setTotalPages(result.data.totalPages);
                }
            };

            fetchAnswer();
        }
    }, [id, page, sort, order]);

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

    const handleSortChange = (e) => {
        if (e.target.value === 'recent') {
            setSort('createdAt');
            setOrder('desc');
            setSelectedSortLabel('recent');
        } else if (e.target.value === 'oldest') {
            setSort('createdAt');
            setOrder('asc');
            setSelectedSortLabel('oldest');
        } else if (e.target.value === 'votes') {
            setSort('voter');
            setOrder('desc');
            setSelectedSortLabel('votes')
        } else {
            return;
        }
    };

    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    };

    if (!question) {
        return <div>Loading...</div>;
    }

    const {subject, content, author, createdAt, modifiedAt, voterCount, commentCount, isAuthor, isVoter, categoryResponse, viewCount} = question;

    return (
        <div className="container mx-auto my-8 px-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <h1 className="text-3xl font-bold text-gray-800 mr-4">{subject}</h1>
                            <select className="form-control" disabled>
                                <option value={categoryResponse.categoryName}>{categoryResponse.categoryDisplayName}</option>
                            </select>
                        </div>
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
                            <span>ViewCount: {viewCount}</span>
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
                    <CommentSection commentCount={commentCount} parentId={id} parentType='question'/>
                </div>
                <div className="border-t border-gray-200 px-6 py-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            Answers
                        </h2>
                        <div className="input-group">
                            <select className="form-control ml-2" onChange={handleSortChange} value={selectedSortLabel}>
                                <option value='recent'>최근 작성 순</option>
                                <option value='oldest'>오래된 날짜 순</option>
                                <option value='votes'>추천 많은 순</option>
                            </select>
                        </div>
                    </div>
                    <AnswerList
                        answerList={answerList}
                        handlePostVoter={handlePostVoter}
                        handleDeleteVoter={handleDeleteVoter}
                        deleteAnswerCheck={deleteAnswerCheck}
                    />
                </div>
                <Pagination page={page} totalPages={totalPages} handlePageChange={handlePageChange} />
                <AnswerForm
                    answerContent={answerContent}
                    setAnswerContent={setAnswerContent}
                    handleAnswerSubmit={handleAnswerSubmit}
                    errors={errors}
                />
            </div>
        </div>
    );
}