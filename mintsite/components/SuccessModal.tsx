import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  txDigest: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, txDigest }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">NFT Minted Successfully!</h2>
        <p>
          View transaction: {' '}
          <a 
            href={`https://suiscan.xyz/testnet/tx/${txDigest}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Transaction Success
          </a>
        </p>
        <button 
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};
