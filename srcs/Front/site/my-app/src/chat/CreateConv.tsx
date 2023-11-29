import './my_modal.css'
import React, { useEffect } from "react";
import { CSSTransition } from "react-transition-group";

interface CreateConvProps {
  onClose: () => void;
  show: boolean;
  title?: string;
  children?: React.ReactNode;
}


const CreateConv: React.FC<CreateConvProps> = (props) => {
  const closeOnEscapeKeyDown = (e: KeyboardEvent) => {
    if ((e.key || e.code) === 'Escape') {
      props.onClose();
    }
  };

  useEffect(() => {
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
          <div className="modal-body" onClick={props.onClose} style={{ maxHeight: "500px", overflow: "auto" }}>{props.children}</div>
          <button onClick={props.onClose}>
            DONE
          </button>
        </div>
      </div>
    </CSSTransition>
  );
};

export default CreateConv;