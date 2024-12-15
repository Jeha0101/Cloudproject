import React, { useState } from 'react';

function NicknameInput({ onSubmit }) {
  const [inputName, setInputName] = useState('');

  const handleSubmit = () => {
    if (inputName.trim()) {
      onSubmit(inputName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-gray-100 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
        <h1 className="text-2xl font-bold text-purple-600 mb-6">닉네임을 입력하세요</h1>
        <input
          type="text"
          value={inputName}
          onChange={e => setInputName(e.target.value)}
          placeholder="닉네임"
          className="border border-gray-300 px-4 py-2 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleSubmit}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded w-full text-center"
        >
          확인
        </button>
      </div>
    </div>
  );
}

export default NicknameInput;
