const podliczMecz = (wynikiGrupy, mecz) => {
  const temp = [
    {
      id: mecz.player1id,
      set: mecz.player1sets - mecz.player2sets,
    },
    {
      id: mecz.player2id,
      set: mecz.player2sets - mecz.player1sets,
    },
  ];

  temp.map((t) => {
    const foundObject = wynikiGrupy.find((item) => item.id.equals(t.id));

    if (foundObject) {
      if (t.set > 0) {
        foundObject.wygrane++;
        foundObject.sety += t.set;
      } else {
        foundObject.sety += t.set;
      }
    } else {
      if (t.set > 0) {
        wynikiGrupy.push({
          id: t.id,
          wygrane: 1,
          sety: t.set,
        });
      } else {
        wynikiGrupy.push({
          id: t.id,
          wygrane: 0,
          sety: t.set,
        });
      }
    }
  });
  return wynikiGrupy;
};

const updateWynikiGrupyWithPlace = (wynikiGrupy, grupid) => {
  return wynikiGrupy.map((wynik, index) => ({
    ...wynik,
    miejsce: index + 1,
    grupid: grupid,
  }));
};

const extractResultArrays = (wynikiGrupy) => {
  const wygrane = [];
  const sety = [];
  const miejsca = [];
  const zawodnicy = [];

  wynikiGrupy.forEach((wynik) => {
    wygrane.push(wynik.wygrane);
    sety.push(wynik.sety);
    miejsca.push(wynik.miejsce);
    zawodnicy.push(wynik.id);
  });

  return { wygrane, sety, miejsca, zawodnicy };
};

module.exports = {
  podliczMecz,
  updateWynikiGrupyWithPlace,
  extractResultArrays,
};
