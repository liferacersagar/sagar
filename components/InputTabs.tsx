
import React from 'react';
import { InputMode } from '../types';
import { BarcodeIcon, TextIcon, CameraIcon } from './icons';

interface InputTabsProps {
  activeTab: InputMode;
  setActiveTab: (tab: InputMode) => void;
}

const tabs = [
  { id: InputMode.TEXT, name: 'Label Text', icon: TextIcon },
  { id: InputMode.IMAGE, name: 'Image', icon: CameraIcon },
  { id: InputMode.BARCODE, name: 'Barcode', icon: BarcodeIcon },
];

export const InputTabs: React.FC<InputTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <tab.icon
                className={`${
                  activeTab === tab.id ? 'text-brand-primary' : 'text-gray-500 group-hover:text-gray-300'
                } -ml-0.5 mr-2 h-5 w-5 transition-colors duration-200`}
                aria-hidden="true"
              />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
