import React, { useState, useEffect } from 'react';
import Pagination from "@/components/Pagination";
import { useRouter } from 'next/navigation';

const CommentSection = ({ rootQuestionId, commentCount, parentId, parentType }) => {
    const [showComments, setShowComments] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentCommentCount, setCurrentCommentCount] = useState(commentCount);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const router = useRouter();

    const handleToggleComments = async () => {
        setShowComments(!showComments);
        if (!showComments && currentCommentCount > 0) {
            await fetchComments(0);
        }
    };

    const fetchComments = async (pageNumber) => {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment?parentId=${parentId}&parentType=${parentType}&page=${pageNumber}`, {
            headers: {
                'Authorization': accessToken
            }
        });
        const result = await response.json();
        if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');
            router.push('/login');
        } else if (result.data && response.status === 200) {
            setComments(result.data.content || []);
            setPage(result.data.number || 0);
            setTotalPages(result.data.totalPages || 0);
        }
    };

    const handleToggleForm = () => {
        setShowForm(!showForm);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken
            },
            body: JSON.stringify({ rootQuestionId: rootQuestionId, parentId: parentId, parentType: parentType, content: commentContent })
        });
        const result = await response.json();
        if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');
            router.push('/login');
        } else if (result.data && response.status === 201) {
            setComments([...comments, result.data]);
            setCommentContent('');
            setShowForm(false);
            setCurrentCommentCount(currentCommentCount + 1);
        }
    };

    const handlePageChange = (pageNumber) => {
        fetchComments(pageNumber);
    };

    const handleEditClick = (commentId, content) => {
        setEditingCommentId(commentId);
        setEditingCommentContent(content);
    };

    const handleEditSubmit = async (e, commentId) => {
        e.preventDefault();
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment/${commentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken
            },
            body: JSON.stringify({ content: editingCommentContent })
        });
        const result = await response.json();
        if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');
            router.push('/login');
        } else if (result.data && response.status === 200) {
            setComments(comments.map(comment => comment.commentId === commentId ? result.data : comment));
            setEditingCommentId(null);
            setEditingCommentContent('');
        }
    };

    const deleteCommentCheck = async (commentId) => {
        if (confirm("정말 삭제하시겠습니까??") == true) {    //확인
            handleDeleteComment(commentId);
        } else {   //취소
            return false;
        }
    }

    const handleDeleteComment = async (commentId) => {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comment/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': accessToken
            }
        });
        if (response.status === 401) {
            alert('댓글 작성자만 삭제할 수 있습니다.');
        } else if (response.status === 200) {
            setComments(comments.filter(comment => comment.commentId !== commentId));
            setCurrentCommentCount(currentCommentCount - 1);
        }
    };

    return (
        <div className="mt-4">
            <p>{currentCommentCount}개의 댓글이 있습니다.</p>
            <button
                onClick={handleToggleComments}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-300"
            >
                {showComments ? '댓글 숨기기' : '댓글 보기'}
            </button>
            <button
                onClick={handleToggleForm}
                className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-300"
            >
                {showForm ? '작성 취소' : '댓글 작성'}
            </button>
            {showComments && (
                <div>
                    <ul className="mt-4">
                        {comments.map((comment) => (
                            <li key={comment.commentId} className="mb-4">
                                {editingCommentId === comment.commentId ? (
                                    <form onSubmit={(e) => handleEditSubmit(e, comment.commentId)}>
                                        <textarea
                                            value={editingCommentContent}
                                            onChange={(e) => setEditingCommentContent(e.target.value)}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            rows="3"
                                        />
                                        <button
                                            type="submit"
                                            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        >
                                            수정 완료
                                        </button>
                                    </form>
                                ) : (
                                    <>
                                        <p>{comment.content}</p>
                                        <div className="text-sm text-gray-600 mt-2">
                                            <span>작성자: {comment.author}</span> |
                                            <span> 작성 날짜: {new Date(comment.createdAt).toLocaleString()}</span> |
                                            <span> 수정 날짜: {new Date(comment.modifiedAt).toLocaleString()}</span>
                                        </div>
                                        {comment.isAuthor && (
                                            <div className="flex space-x-2 mt-2">
                                                <button
                                                    onClick={() => handleEditClick(comment.commentId, comment.content)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => deleteCommentCheck(comment.commentId)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                    <Pagination page={page} totalPages={totalPages} handlePageChange={handlePageChange} />
                </div>
            )}
            {showForm && (
                <form onSubmit={handleCommentSubmit} className="mt-4">
                    <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="댓글을 입력하세요"
                        rows="3"
                    />
                    <button
                        type="submit"
                        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        댓글 작성
                    </button>
                </form>
            )}
        </div>
    );
};

export default CommentSection;