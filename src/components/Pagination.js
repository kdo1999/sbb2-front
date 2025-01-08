// src/components/Pagination.js
import React from 'react';

const Pagination = ({ page, totalPages, handlePageChange }) => {
    return (
        <div className="flex justify-center mt-4">
            <ul className="flex space-x-2">
                <li className="page-item">
                    <button className="page-link" onClick={() => handlePageChange(page !== 0 ? page - 1 : 0)}
                            disabled={page === 0}>
                        이전
                    </button>
                </li>
                {Array.from({length: totalPages}, (_, index) => (
                    <li key={index} className={`page-item ${page === index ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(index)}>
                            {index + 1}
                        </button>
                    </li>
                ))}
                <li className="page-item">
                    <button className="page-link"
                            onClick={() => handlePageChange(page === totalPages - 1 ? page : page + 1)}
                            disabled={page === totalPages - 1}>
                        다음
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Pagination;