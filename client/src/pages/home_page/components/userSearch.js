import React from "react";

function UserSearch(props) {
    return(
        <div className="relative">
            <input type="text" placeholder="Search" className="rounded-xl w-full border-gray-400 pl-10 text-gray-500 h-14" 
                value={props.searchKey}
                onChange={(event) => props.setSearchKey(event.target.value)}
            />
        <i className="ri-search-line absolute top-4 left-4 text-gray-600"></i>
        </div>
    );
}

export default UserSearch;