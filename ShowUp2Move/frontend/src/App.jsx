import React from 'react';

import "./App.css";

import { useEffect, useState } from 'react';

import LoginPage from './components/LoginPage';

import {
  getUsers,
  setAvailability,
  updateProfile,
}
from './components/services/userService';

import {
  generateGroups
}
from "./components/services/groupService";

const App = () => {

  const [currentUserId, setCurrentUserId] = useState(

    localStorage.getItem("currentUserId")

      ? Number(
          localStorage.getItem("currentUserId")
        )

      : null

  );

  const [users, setUsers] = useState([]);

  const [showProfile, setShowProfile]= useState(false);

  const [joinedGroups, setJoinedGroups]= useState([]);

  const [events, setEvents]= useState([]);

  const [eventSport, setEventSport]= useState("");

  const [eventTime, setEventTime]= useState("");

  const [eventArea, setEventArea]= useState("");

  const [profileName, setProfileName]= useState("");

  const [profileSports, setProfileSports]= useState([]);

  const [profileSkill, setProfileSkill]= useState("");

  const [profileYears, setProfileYears]= useState("");

  const [profileDescription,setProfileDescription]= useState("");

  const currentUser = users.find(user => user.id === currentUserId);

  const generatedGroups =
    generateGroups(users);

  useEffect(() => {

    getUsers()

      .then(data => {

        setUsers(data);

        const current = data.find(

          user =>

            user.id === currentUserId

        );

        if(current){

          setProfileName(current.name);

          setProfileSports(
            current.sports || []
          );

          setProfileSkill(
            current.skillLevel || ""
          );

          setProfileYears(
            current.yearsPlaying || ""
          );

          setProfileDescription(
            current.description || ""
          );

        }

      });

  }, [currentUserId]);

  const handleAvailability = (
    id,
    available
  ) => {

    setAvailability(id, available)

      .then(updatedUser => {

        setUsers(

          users.map(user =>

            user.id === updatedUser.id? updatedUser: user
          )
        );

      });

  };

  if(!currentUserId){

    return (

      <LoginPage
        setCurrentUserId={
          setCurrentUserId
        }
      />

    );

  }

  return (

    <div className="app">

      <div className="layout">

        <div
          className={`sidebar ${
            showProfile ? "open" : ""
          }`}
        >

          <div className="sidebar-header">

            <h2 className="myprofile">
              My Profile
            </h2>

            <button
              className="close-btn"
              onClick={() =>
                setShowProfile(false)
              }
            >
              X
            </button>

          </div>

          <label>
            Full Name
          </label>

          <input
            className="profile-input"
            type="text"
            value={profileName}
            onChange={(e) =>
              setProfileName(
                e.target.value
              )
            }
          />

          <label>
            Sports
          </label>

          <input
            className="profile-input"
            type="text"
            placeholder="Football, Tennis"

            value={profileSports.join(", ")}

            onChange={(e) =>

              setProfileSports(

                e.target.value

                  .split(",")

                  .map(s => s.trim())

              )

            }
          />

          <label>
            Skill Level
          </label>

          <select
            className="profile-input"

            value={profileSkill}

            onChange={(e) =>
              setProfileSkill(
                e.target.value
              )
            }
          >

            <option>
              Beginner
            </option>

            <option>
              Intermediate
            </option>

            <option>
              Advanced
            </option>

          </select>

          <label>
            Years Playing
          </label>

          <input
            className="profile-input"

            type="number"

            value={profileYears}

            onChange={(e) =>
              setProfileYears(
                e.target.value
              )
            }
          />

          <label>
            Bio
          </label>

          <textarea
            className="profile-textarea"

            value={profileDescription}

            onChange={(e) =>
              setProfileDescription(
                e.target.value
              )
            }
          />

          <button
            className="save-btn"

            onClick={() => {

              updateProfile(

                currentUserId,

                {

                  name: profileName,

                  sports: profileSports,

                  description:
                    profileDescription,

                  skillLevel:
                    profileSkill,

                  yearsPlaying:
                    profileYears

                }

              )

              .then(updatedUser => {

                setUsers(

                  users.map(user =>

                    user.id ===
                    updatedUser.id

                      ? updatedUser

                      : user

                  )

                );

                setShowProfile(false);

              });

            }}
          >

            Save Profile

          </button>

        </div>

        <div className="main-content">

          <header className="header">

            <h1 className="logo">
              ShowUp2Move
            </h1>

            <nav>

              <button
                className="nav-btn"
              >
                Home
              </button>

              <button
                className="nav-btn"

                onClick={() =>
                  setShowProfile(
                    !showProfile
                  )
                }
              >
                My Profile
              </button>

              <button
                className="nav-btn"

                onClick={() => {

                  localStorage.removeItem(
                    "currentUserId"
                  );

                  setCurrentUserId(null);

                }}
              >
                Logout
              </button>

            </nav>

          </header>

          <h2 className="section-title">
            Available Players For You
          </h2>

          <div className="users-container">

            {users

              .filter(user =>

                user.id !==
                currentUserId

                &&

                user.available

                &&

                user.sports?.some(

                  sport =>

                    currentUser?.sports

                      ?.includes(sport)

                )

              )

              .map(user => (

                <div
                  className="user-card"
                  key={user.id}
                >

                  <h2 className="user-name">
                    {user.name}
                  </h2>

                  <p>

                    <strong>
                      Sports:
                    </strong>

                    {" "}

                    {user.sports?.join(", ")}

                  </p>

                  <p>

                    <strong>
                      Skill:
                    </strong>

                    {" "}

                    {user.skillLevel}

                  </p>

                  <p>

                    <strong>
                      Experience:
                    </strong>

                    {" "}

                    {user.yearsPlaying}
                    {" "}
                    years

                  </p>

                  <p>
                    {user.description}
                  </p>

                </div>

              ))}

          </div>

          <h2 className="section-title">
            Generated Groups
          </h2>

          <div className="groups-container">

            {generatedGroups.map(group => (

              <div
                className="group-card"
                key={group.sport}
              >

                <h2>
                  {group.sport} Group
                </h2>

                <p>

                  <strong>
                    Captain:
                  </strong>

                  {" "}

                  {group.captain.name}

                </p>

                <p>

                  <strong>
                    Players:
                  </strong>

                  {" "}

                  {group.players.length}

                  /

                  {group.maxPlayers}

                </p>

                <ul>

                  {group.players.map(player => (

                    <li key={player.id}>
                      {player.name}
                    </li>

                  ))}

                </ul>

                <button

                  className="join-btn"

                  onClick={() => {

                    if(

                      !joinedGroups.includes(
                        group.sport
                      )

                    ){

                      setJoinedGroups([

                        ...joinedGroups,

                        group.sport

                      ]);

                    }

                  }}

                >

                  Join Group

                </button>

              </div>

            ))}

          </div>

          <h2 className="section-title">
            My Groups
          </h2>

          <div className="groups-container">

            {generatedGroups

              .filter(group =>

                joinedGroups.includes(
                  group.sport
                )

              )

              .map(group => (

                <div
                  className="group-card"
                  key={group.sport}
                >

                  <h2>
                    {group.sport}
                  </h2>

                  <p>
                    Stable Friend Group
                  </p>

                  <p>

                    Captain:
                    {" "}
                    {group.captain.name}

                  </p>

                </div>

              ))}

          </div>

          <h2 className="section-title">
            Create Event
          </h2>

          <div className="event-form">

            <input

              className="profile-input"

              type="text"

              placeholder="Sport"

              value={eventSport}

              onChange={(e) =>
                setEventSport(
                  e.target.value
                )
              }

            />

            <input

              className="profile-input"

              type="text"

              placeholder="Time"

              value={eventTime}

              onChange={(e) =>
                setEventTime(
                  e.target.value
                )
              }

            />

            <input

              className="profile-input"

              type="text"

              placeholder="Area"

              value={eventArea}

              onChange={(e) =>
                setEventArea(
                  e.target.value
                )
              }

            />

            <button

              className="save-btn"

              onClick={() => {

                const newEvent = {

                  id: Date.now(),

                  sport: eventSport,

                  time: eventTime,

                  area: eventArea,

                  creator:
                    currentUser.name,

                  participants: [
                    currentUser.name
                  ]

                };

                setEvents([
                  ...events,
                  newEvent
                ]);

                setEventSport("");
                setEventTime("");
                setEventArea("");

              }}

            >

              Create Event

            </button>

          </div>

          <h2 className="section-title">
            Upcoming Events
          </h2>

          <div className="groups-container">

            {events.map(event => (

              <div
                className="group-card"
                key={event.id}
              >

                <h2>
                  {event.sport}
                </h2>

                <p>

                  <strong>Time:</strong>
                  {" "}
                  {event.time}

                </p>

                <p>

                  <strong>Area:</strong>
                  {" "}
                  {event.area}

                </p>

                <p>

                  <strong>Organizer:</strong>
                  {" "}
                  {event.creator}

                </p>

                <p>

                  <strong>Participants:</strong>
                  {" "}
                  {event.participants.length}

                </p>

                <button

                  className="join-btn"

                  onClick={() => {

                    setEvents(

                      events.map(e =>

                        e.id === event.id

                          ? {

                              ...e,

                              participants: [

                                ...e.participants,

                                currentUser.name

                              ]

                            }

                          : e

                      )

                    );

                  }}

                >

                  Confirm Participation

                </button>

              </div>

            ))}

          </div>

          <h2 className="section-title">
            All Players
          </h2>

          <div className="users-container">

            {users.map(user => (

              <div
                className="user-card"
                key={user.id}
              >

                <h2 className="user-name">
                  {user.name}
                </h2>

                <p>

                  <strong>
                    Sports:
                  </strong>

                  {" "}

                  {user.sports?.join(", ")}

                </p>

                <p>

                  <strong>
                    Skill:
                  </strong>

                  {" "}

                  {user.skillLevel}

                </p>

                <p>

                  <strong>
                    Experience:
                  </strong>

                  {" "}

                  {user.yearsPlaying}
                  {" "}
                  years

                </p>

                <p>
                  {user.description}
                </p>

                <p className="available">

                  ShowUpToday?

                  {user.available
                    ? " YES"
                    : " NO"}

                </p>

                {user.id === currentUserId && (

                  <div className="buttons">

                    <button
                      className="yes-btn"

                      onClick={() =>

                        handleAvailability(
                          user.id,
                          true
                        )

                      }
                    >
                      YES
                    </button>

                    <button
                      className="no-btn"

                      onClick={() =>

                        handleAvailability(
                          user.id,
                          false
                        )

                      }
                    >
                      NO
                    </button>

                  </div>

                )}

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>

  );

};

export default App;