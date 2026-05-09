export const generateGroups = (users) => {

  const sportsGroups = {

    Football: [],
    Basketball: [],
    Tennis: []

  };

  users.forEach(user => {

    if(user.available){

      user.sports?.forEach(sport => {

        if(sportsGroups[sport]){

          sportsGroups[sport].push(user);

        }

      });

    }

  });

  return Object.entries(sportsGroups)

    .map(([sport, players]) => {

      if(players.length === 0){

        return null;

      }

      const maxPlayers =

        sport === "Football"

          ? 14

          : sport === "Basketball"

          ? 10

          : 4;

      const captain =

        players[
          Math.floor(
            Math.random() * players.length
          )
        ];

      return {

        sport,

        players:
          players.slice(0, maxPlayers),

        waitingList:

          players.length > maxPlayers

            ? players.slice(maxPlayers)

            : [],

        captain,

        maxPlayers

      };

    })

    .filter(Boolean);

};