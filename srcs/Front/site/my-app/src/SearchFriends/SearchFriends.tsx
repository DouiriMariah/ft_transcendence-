import './SearchFriends.css'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchFriendsProps {
  users: ft_User[];
  show: boolean;
  onClose: () => void;
}

const SearchFriends: React.FC<SearchFriendsProps> = ({ users, show, onClose }):JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<ft_User[]>(users);
  const navigate = useNavigate();

  const closeOnEscapeKeyDown = (e:KeyboardEvent) => {
    if ((e.key || e.code) === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.body.addEventListener("keydown", closeOnEscapeKeyDown);
    return function cleanup() {
      document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
    };
  },);

  const handleSearch = (query:string) => {

      const normalizedQuery = query?.toLowerCase();
      const filteredList = users.filter((user) => user.user?.toLowerCase().includes(normalizedQuery));
      setFilteredUsers(filteredList);
      setSearchQuery(query);
  };

  const goProfile = ( name:string|undefined) => {
    onClose();
    navigate('/profile/' + name)
  };

  return (
    <div> {show && (
      <div>
        <div className="overlay" onClick={(e) => { e.stopPropagation(); onClose(); }} />
        <div className="user-search-container" onClick={onClose}>
          <div className="search-container" onClick={e => e.stopPropagation()}>
            <input
              className="search-input"
              type="text"
              placeholder="Search users"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="user-list-container" onClick={e => e.stopPropagation()}>
            <div className="user-list">
              {filteredUsers.map((user) => (
                <div className="item" key={user.user}>
                  <div className='avatar-container'>
                    <img onClick={() => goProfile(user.user)} src={user.avatar} alt="Item" />
                    <span className={`dot ${user.status === 'ingame' ? "ingame" : "online"}`}></span>
                  </div>
                  <div className="text"><p onClick={() => goProfile(user.user)}>{user.user}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default SearchFriends;