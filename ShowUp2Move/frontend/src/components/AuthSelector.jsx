const AuthSelector = ({
  users,
  currentUserId,
  setCurrentUserId
}) => {

  return (

    <select
      value={currentUserId}

      onChange={(e) =>
        setCurrentUserId(
          Number(e.target.value)
        )
      }
    >

      {users.map(user => (

        <option
          key={user.id}
          value={user.id}
        >
          {user.name || "Unnamed"}
        </option>

      ))}

    </select>

  );

};

export default AuthSelector;