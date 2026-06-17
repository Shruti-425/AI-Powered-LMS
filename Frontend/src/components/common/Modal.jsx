function Modal({ children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded">
        {children}
      </div>
    </div>
  );
}

export default Modal;