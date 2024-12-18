import React from "react";

const GamePage = ({ settings, handleSettingsChange }) => {
  return (
    <div className='w-full max-w-sm p-6 bg-white rounded-lg shadow-lg'>
      <h2 className='mb-4 text-xl font-semibold text-center'>게임 설정</h2>

      <div className='mb-4'>
        <label className='block text-sm font-medium'>다크 모드</label>
        <input
          type='checkbox'
          name='darkMode'
          checked={settings.darkMode}
          onChange={handleSettingsChange}
          className='w-4 h-4 ml-2'
        />
      </div>

      <div className='mb-4'>
        <label className='block text-sm font-medium'>타일 크기</label>
        <input
          type='range'
          name='tileSize'
          min='10'
          max='50'
          value={settings.tileSize}
          onChange={handleSettingsChange}
          className='w-full mt-2'
        />
        <span>{settings.tileSize}px</span>
      </div>

      <div className='mb-4'>
        <label className='block text-sm font-medium'>음식 가치</label>
        <input
          type='number'
          name='foodValue'
          value={settings.foodValue}
          onChange={handleSettingsChange}
          className='w-full p-2 mt-2 border rounded-lg'
        />
      </div>

      <div className='mb-4'>
        <label className='block text-sm font-medium'>음식 수</label>
        <input
          type='number'
          name='foodAmount'
          value={settings.foodAmount}
          onChange={handleSettingsChange}
          className='w-full p-2 mt-2 border rounded-lg'
        />
      </div>
    </div>
  );
};

export default GamePage;
