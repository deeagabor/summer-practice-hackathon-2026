export const getUsers = () => {

  return fetch("/users")
    .then(res => res.json());

};

export const addUser = (userData) => {
  return fetch("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  })
  .then(res => res.json());
};

export const setAvailability = (id, available) => {
  return fetch(`/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ available })
  })
  .then(res => res.json());
};

export const updateProfile = (
  id,
  profileData
) => {

  return fetch(`/users/${id}`, {

    method: "PATCH",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(profileData)

  })

  .then(res => res.json());

};