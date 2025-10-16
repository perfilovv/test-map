import type { FC } from 'react';

interface ModalInfoProps {
  visible: boolean;
  attrs?: Record<string, string> | null;
  onClose: () => void;
}

const ModalInfo: FC<ModalInfoProps> = ({ visible, attrs, onClose }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 400,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          width: '250px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0px' }}>Информация об объекте</h3>
        {attrs ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {Object.entries(attrs).map(([key, val]) => (
              <li
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px',
                }}
              >
                <b>{key}:</b>
                <span>{val}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Нет данных об атрибутах</p>
        )}
        <button
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#518ac4ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default ModalInfo;

