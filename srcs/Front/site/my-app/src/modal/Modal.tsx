import './Modal.css'
import React, { useEffect } from "react";
import { CSSTransition } from "react-transition-group";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  children:React.ReactNode;
}

const Modal: React.FC<ModalProps> = (props) => {
  const closeOnEscapeKeyDown = (e: KeyboardEvent) => {
    if ((e.key || e.code) === 'Escape') {
      props.onClose();
    }
  };
  useEffect(():()=>void => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return function cleanup() {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
  },);

  return (
    <CSSTransition
      in={props.show}
      unmountOnExit
      timeout={{ enter: 0, exit: 300 }}
    >
      <div className="modal" onClick={props.onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h4 className="modal-title">{props.title}</h4>
          <div className="modal-body">{props.children}</div>
          <button onClick={props.onClose}>
            CANCEL
          </button>
        </div>
      </div>
    </CSSTransition>
  );
};

export default Modal;
