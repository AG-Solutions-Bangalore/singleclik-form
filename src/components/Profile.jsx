import { useRef, useState } from "react";
// import PencilIcon from "./PencilIcon";
import Modal from "./Modal";

const Profile = () => {
  const avatarUrl = useRef(
    "https://avatarfiles.alphacoders.com/161/161002.jpg"
  );
  const [modalOpen, setModalOpen] = useState(false);

  const updateAvatar = (imgSrc) => {
    avatarUrl.current = imgSrc;
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-400 rounded-md  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <div className={`${inputClass} flex items-center justify-between h-12 `}>
      <div className="flex items-center space-x-4">
        <img
          src={avatarUrl.current}
          alt="Avatar"
          className="w-10 h-10 rounded-lg border-2 border-gray-300"
        />
        <button
          className={`${inputClass} bg-white hover:bg-gray-50 text-gray-700 text-sm`}
          onClick={() => setModalOpen(true)}
        >
          Choose Image
        </button>
      </div>

      {modalOpen && (
        <Modal
          updateAvatar={updateAvatar}
          closeModal={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Profile;
