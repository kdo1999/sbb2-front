// src/components/AnswerList.js
import React from 'react';
import Link from 'next/link';
import CommentSection from "@/components/CommentSection";

const AnswerList = ({ answerList, handlePostVoter, handleDeleteVoter, deleteAnswerCheck }) => {
    return (
        <ul className="space-y-6">
            {answerList.map((answer) => (
                <li key={answer.id} className="bg-gray-50 rounded-lg p-4 shadow">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-700 mb-2">{answer.content}</p>
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="mr-4">{answer.author}</span>
                                <span>Created: {new Date(answer.createdAt).toLocaleString()}</span>
                                <span className="ml-4">Modified: {new Date(answer.modifiedAt).toLocaleString()}</span>
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
                        <CommentSection parentId={answer.id} parentType='answer' commentCount={answer.commentCount} />

                </li>
            ))}
        </ul>
    );
};

export default AnswerList;