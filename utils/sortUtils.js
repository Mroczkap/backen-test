const sortByProperty = (array, property, secondProperty, asc = true) => {
    return array.sort((a, b) => {
      if (a[property] !== b[property]) {
        return asc ? a[property] - b[property] : b[property] - a[property];
      } else {
        return a[secondProperty].localeCompare(b[secondProperty]);
      }
    });
  };

  const sortByProperty2 = (data, primaryPropertyName, secondaryPropertyName, ascending) => {
    return data.sort((a, b) => {
      const aValue = a[primaryPropertyName];
      const bValue = b[primaryPropertyName];
      
      if (aValue === null || bValue === null) {
        if (aValue === bValue) {
          // If both secondary values are null or equal, use the primary property for sorting.
          if (ascending) {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        } else {
          // If one of the secondary values is null, consider the non-null one as greater.
          if (aValue === null) {
            return ascending ? 1 : -1;
          } else {
            return ascending ? -1 : 1;
          }
        }
      } else {
        // Both secondary values are not null, so perform two-level sorting.
        if (aValue === bValue) {
          // If the primary values are equal, use the secondary property for sorting.
          const secondaryAValue = a[secondaryPropertyName];
          const secondaryBValue = b[secondaryPropertyName];
          if (ascending) {
            return secondaryAValue - secondaryBValue;
          } else {
            return secondaryBValue - secondaryAValue;
          }
        } else {
          // If the primary values are not equal, use them for sorting.
          if (ascending) {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        }
      }
    });
  }

  const groupByMiejsce = (gru) => {
    const groupedByMiejsce = {};
    gru.forEach((subarray) => {
      const ile = subarray.length;
      subarray.forEach((item) => {
        const miejsce = item.miejsce;
        if (!groupedByMiejsce[miejsce]) {
          groupedByMiejsce[miejsce] = [];
        }
        groupedByMiejsce[miejsce].push({
          id: item.id,
          sety: item.sety / (ile - 1),
          wygrane: item.wygrane / (ile - 1),
          grupid: item.grupid,
        });
      });
    });
    return groupedByMiejsce;
  };

  const prepareResult = (groupedByMiejsce) => {
    return Object.entries(groupedByMiejsce)
      .map(([miejsce, items]) => ({
        miejsce: parseInt(miejsce),
        items: items.sort((a, b) => a.grupid - b.grupid),
      }))
      .sort((a, b) => a.miejsce - b.miejsce);
  };
  
  const prepareWynikKoncowy = (result, integerValue) => {
    const wynikKoncowy = [];
    result.forEach((item) => {
      if (item.miejsce === integerValue + 1) {
        const granica = result[integerValue].items;
        granica.sort((a, b) => {
          if (a.wygrane !== b.wygrane) {
            return b.wygrane - a.wygrane;
          } else if (a.sety !== b.sety) {
            return b.sety - a.sety;
          }
          return a.grupid - b.grupid;
        });
        granica.forEach((wynik) => {
          wynikKoncowy.push(wynik.id);
        });
      } else {
        item.items.forEach((wynik) => {
          wynikKoncowy.push(wynik.id);
        });
      }
    });
    return wynikKoncowy;
  };

  const sortWynikiGrupy = (wynikiGrupy, mecze) => {
    const equal = [];
  
    wynikiGrupy.sort((a, b) => {
      if (b.wygrane - a.wygrane !== 0) return b.wygrane - a.wygrane;
      if (b.sety - a.sety !== 0) return b.sety - a.sety;
      
      if (!equal.includes(a)) equal.push(a);
      if (!equal.includes(b)) equal.push(b);
  
      const foundmecz = mecze.find(
        (item) =>
          (item.player1id.equals(b.id) || item.player2id.equals(b.id)) &&
          (item.player1id.equals(a.id) || item.player2id.equals(a.id))
      );
  
      if (b.id.equals(foundmecz.player1id) && foundmecz.player1sets == 3) return 1;
      if (b.id.equals(foundmecz.player2id) && foundmecz.player2sets == 3) return 1;
      if (a.id.equals(foundmecz.player1id) && foundmecz.player1sets == 3) return -1;
      if (a.id.equals(foundmecz.player2id) && foundmecz.player2sets == 3) return -1;
  
      return 0;
    });
  
    return { wynikiGrupy, equal };
  };
  
  const sortEqualPlayers = (equal, ratios) => {

    return equal.sort((a, b) => {
      const ratioA = (ratios.find((player) => player.playerid.equals(a.id)) || { ratio: 0 }).ratio;
      const ratioB = (ratios.find((player) => player.playerid.equals(b.id)) || { ratio: 0 }).ratio;
      return ratioB - ratioA;
    });
  };
  
    
  
  module.exports = { sortByProperty, sortWynikiGrupy, sortByProperty2,groupByMiejsce,sortEqualPlayers, prepareResult, prepareWynikKoncowy };