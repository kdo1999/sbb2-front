// src/components/AnswerForm.js
import React from 'react';

const AnswerForm = ({ answerContent, setAnswerContent, handleAnswerSubmit, errors }) => {
    return (
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
    );
};

export default AnswerForm;