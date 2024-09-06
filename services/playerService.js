const playerRepository = require("../repositories/playerRepository");

const getAllPlayers = async (sorting) => {
  return await playerRepository.findAll(sorting);
};

const createPlayer = async (playerData) => {
  const newPlayer = {
    ...playerData,
    imie: playerData.imie,
    nazwisko: playerData.nazwisko,
    plec: playerData.plec,
    wiek: parseInt(playerData.wiek),
    okladziny: playerData.okladziny,
    ranking: parseInt(playerData.ranking),
    usuniety: false,
  };
  return await playerRepository.create(newPlayer);
};

const updatePlayer = async (id, playerData) => {
  const updatedPlayer = {
    imie: playerData.imie,
    nazwisko: playerData.nazwisko,
    plec: playerData.plec,
    okladziny: playerData.okladziny,
    wiek: parseInt(playerData.wiek),
    ranking: parseInt(playerData.ranking),
  };
  return await playerRepository.update(id, updatedPlayer);
};

const deletePlayer = async (id) => {
  return await playerRepository.softDelete(id);
};

module.exports = {
  getAllPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
