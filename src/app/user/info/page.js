// src/app/user/info/page.js
"use client";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useUser} from '@/provider/UserProvider';
import Pagination from '@/components/Pagination';

export default function UserInfo() {
    const [userQuestions, setUserQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [userComments, setUserComments] = useState([]);
    const [questionPage, setQuestionPage] = useState(0);
    const [answerPage, setAnswerPage] = useState(0);
    const [commentPage, setCommentPage] = useState(0);
    const [totalQuestionPages, setTotalQuestionPages] = useState(0);
    const [totalAnswerPages, setTotalAnswerPages] = useState(0);
    const [totalCommentPages, setTotalCommentPages] = useState(0);
    const router = useRouter();
    const {username} = useUser();

    useEffect(() => {
        if (!username) return;

        const fetchUserData = async () => {
            const questionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/question?pageNum=${questionPage}&username=${username}`, {
                cache: 'no-store',
                credentials: 'include',
            });
            const questionsData = await questionsResponse.json();
            setUserQuestions(questionsData.data.content);
            setTotalQuestionPages(questionsData.data.totalPages);

            const answersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/answer?pageNum=${answerPage}&username=${username}`, {
                cache: 'no-store',
                credentials: 'include',
            });
            const answersData = await answersResponse.json();
            setUserAnswers(answersData.data.content);
            setTotalAnswerPages(answersData.data.totalPages);

            const commentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment?pageNum=${commentPage}&username=${username}`, {
                cache: 'no-store',
                credentials: 'include',
            });
            const commentsData = await commentsResponse.json();
            setUserComments(commentsData.data.content);
            setTotalCommentPages(commentsData.data.totalPages);
        };

        fetchUserData();
    }, [username, questionPage, answerPage, commentPage]);

    const handlePageChange = (type, pageNumber) => {
        if (type === 'question') setQuestionPage(pageNumber);
        if (type === 'answer') setAnswerPage(pageNumber);
        if (type === 'comment') setCommentPage(pageNumber);
    };

    return (
        <div className="container mx-auto my-8 p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">My Information</h1>
            <Link href="/user/password/change">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4">
                    Change Password
                </button>
            </Link>
            <div className="mb-16">
                <h2 className="text-xl font-bold mb-2">My Questions</h2>
                <table className="table-auto w-3/4 mx-auto">
                    <thead className="bg-gray-800 text-white">
                    <tr>
                        <th>No</th>
                        <th>Title</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Author</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userQuestions.map((question, index) => (
                        <tr key={question.id} className="text-center">
                            <td>{index + 1 + questionPage * 10}</td>
                            <td className="text-left">
                                <Link href={`/question/${question.id}`} className="text-blue-500 hover:underline">
                                    {question.subject}
                                </Link>
                            </td>
                            <td>{new Date(question.createdAt).toLocaleString()}</td>
                            <td>{new Date(question.modifiedAt).toLocaleString()}</td>
                            <td>{question.author}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <Pagination page={questionPage} totalPages={totalQuestionPages}
                            handlePageChange={(pageNumber) => handlePageChange('question', pageNumber)}/>
            </div>
            <div className="mb-16">
                <h2 className="text-xl font-bold mb-2">My Answers</h2>
                <table className="table-auto w-3/4 mx-auto">
                    <thead className="bg-gray-800 text-white">
                    <tr>
                        <th>No</th>
                        <th>Content</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Author</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userAnswers.map((answer, index) => (
                        <tr key={answer.id} className="text-center">
                            <td>{index + 1 + answerPage * 10}</td>
                            <td className="text-left">
                                <Link href={`/question/${answer.questionId}`} className="text-blue-500 hover:underline">
                                    {answer.content}
                                </Link>
                            </td>
                            <td>{new Date(answer.createdAt).toLocaleString()}</td>
                            <td>{new Date(answer.modifiedAt).toLocaleString()}</td>
                            <td>{answer.author}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <Pagination page={answerPage} totalPages={totalAnswerPages}
                            handlePageChange={(pageNumber) => handlePageChange('answer', pageNumber)}/>
            </div>
            <div className="mb-16">
                <h2 className="text-xl font-bold mb-2">My Comments</h2>
                <table className="table-auto w-3/4 mx-auto">
                    <thead className="bg-gray-800 text-white">
                    <tr>
                        <th>No</th>
                        <th>Content</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Author</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userComments.map((comment, index) => (
                        <tr key={comment.commentId} className="text-center">
                            <td>{index + 1 + commentPage * 10}</td>
                            <td className="text-left">
                                <Link href={`/question/${comment.rootQuestionId}`}
                                      className="text-blue-500 hover:underline">
                                    {comment.content}
                                </Link>
                            </td>
                            <td>{new Date(comment.createdAt).toLocaleString()}</td>
                            <td>{new Date(comment.modifiedAt).toLocaleString()}</td>
                            <td>{comment.author}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <Pagination page={commentPage} totalPages={totalCommentPages}
                            handlePageChange={(pageNumber) => handlePageChange('comment', pageNumber)}/>
            </div>
        </div>
    );
}