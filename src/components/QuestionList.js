"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function QuestionList() {
    const [questions, setQuestions] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [sort, setSort] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const [selectedSortLabel, setSelectedSortLabel] = useState('recent');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await fetch('http://localhost:8080/api/v1/category');
            const result = await response.json();
            if (response.status === 200) {
                setCategories(result.data);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const response =
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/question?pageNum=${page}&kw=${searchKeyword}&order=${order}&sort=${sort}&categoryId=${selectedCategory}`,
                    { cache: 'no-store' }
                );
            const data = await response.json();
            setQuestions(data.data.content);
            setTotalPages(data.data.totalPages);
        };

        fetchData();
    }, [page, searchKeyword, sort, order, selectedCategory]);

    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    };

    const handleSearch = () => {
        setPage(0);
        setSearchKeyword(document.getElementById('search_kw').value);
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

    return (
        <div className="container mx-auto my-3">
            <div>
                <ul className="flex space-x-4">
                    <li key='default'
                        className={`cursor-pointer ${selectedCategory === '' ? 'text-blue-500 font-bold' : ''}`}
                        onClick={() => setSelectedCategory('')}
                    >
                        전체보기
                    </li>
                    {categories.map(category => (
                        <li
                            key={category.categoryId}
                            className={`cursor-pointer ${selectedCategory === category.categoryId ? 'text-blue-500 font-bold' : ''}`}
                            onClick={() => setSelectedCategory(category.categoryId)}
                        >
                            {category.categoryDisplayName}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-between my-3">
                <Link href={`/question/create?categoryId=${selectedCategory}`} className="btn btn-primary">질문 등록하기</Link>
                <div className="input-group">
                    <input type="text" id="search_kw" className="form-control" />
                    <button className="btn btn-outline-secondary" type="button" id="btn_search" onClick={handleSearch}>찾기</button>
                    <select className="form-control ml-2" onChange={handleSortChange} value={selectedSortLabel}>
                        <option value='recent'>최근 작성 순</option>
                        <option value='oldest'>오래된 날짜 순</option>
                        <option value='votes'>추천 많은 순</option>
                    </select>
                </div>
            </div>
            <table className="table-auto w-full">
                <thead className="bg-gray-800 text-white">
                    <tr className="text-center">
                        <th>번호</th>
                        <th style={{ width: '50%' }}>제목</th>
                        <th>글쓴이</th>
                        <th>작성일시</th>
                        <th>조회수</th>
                    </tr>
                </thead>
                <tbody>
                    {questions.map((question, index) => (
                        <tr key={question.id} className="text-center">
                            <td>{index + 1}</td>
                            <td className="text-left">
                                <Link href={`/question/${question.id}`}
                                      className="text-blue-500 hover:underline">{question.subject}</Link>
                                {question.answerCount > 0 &&
                                    <span className="text-red-500 small ml-2">[{question.answerCount}]</span>}
                            </td>
                            <td>{question.author?.username}</td>
                            <td>{new Date(question.createdAt).toLocaleString()}</td>
                            <td>{question.viewCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center mt-4">
                <ul className="flex space-x-2">
                    <li className="page-item">
                        <button className="page-link" onClick={() => handlePageChange(page !== 0 ? page - 1 : 0)} disabled={page === 0}>
                            이전
                        </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <li key={index} className={`page-item ${page === index ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(index)}>
                                {index + 1}
                            </button>
                        </li>
                    ))}
                    <li className="page-item">
                        <button className="page-link" onClick={() => handlePageChange(page === totalPages - 1 ? page : page + 1)} disabled={page === totalPages - 1}>
                            다음
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}