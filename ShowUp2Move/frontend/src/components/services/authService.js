export const login = (username, password) => {

  return fetch("/auth/login", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      username,
      password
    })

  })

  .then(res => {

    if(!res.ok){
      throw new Error("Invalid credentials");
    }

    return res.json();

  });

};