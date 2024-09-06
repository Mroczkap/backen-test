const selectRound = (round, idmeczu) => {
    let match;
    switch (round) {
      case "1/4":
        match = do14(idmeczu);
        break;
      case "1/2":
        match = do12(idmeczu);
        break;
      case "final":
        match = dofinalu(idmeczu);
        break;
      case "wyniki":
        match = final(idmeczu);
        break;
      default:
        console.log(`Sorry, we are out of ${round}.`);
    }
  
    return match;
  };
  
  const do14 = (idmeczu) => {
    let dodatek = 0;
    if (idmeczu > 8) {
      dodatek = 8;
      idmeczu = idmeczu - dodatek;
    }
    if (idmeczu % 2 == 0) {
      return [2, idmeczu / 2 + dodatek, idmeczu / 2 + 4 + dodatek];
    } else {
      return [1, (idmeczu + 1) / 2 + dodatek, (idmeczu + 1) / 2 + 4 + dodatek];
    }
  };
  
  const do12 = (idmeczu) => {
    let dodatek;
    if (idmeczu % 4 == 0) {
      dodatek = (idmeczu / 4 - 1) * 4;
    } else {
      dodatek = idmeczu - (idmeczu % 4);
    }
  
    if (idmeczu % 2 == 0) {
      return [
        2,
        (idmeczu - dodatek) / 2 + dodatek,
        (idmeczu - dodatek) / 2 + 2 + dodatek,
      ];
    } else {
      return [
        1,
        (idmeczu - dodatek + 1) / 2 + dodatek,
        (idmeczu - dodatek + 1) / 2 + 2 + dodatek,
      ];
    }
  };
  
  const dofinalu = (idmeczu) => {
    if (idmeczu % 2 == 0) {
      return [2, idmeczu - 1, idmeczu];
    } else {
      return [1, idmeczu, idmeczu + 1];
    }
  };
  
  const final = (idmeczu) => {
    return [-1, 2 * idmeczu - 1, 2 * idmeczu];
  };

  const determineMaxAndRound = (length, groupNo) => {
    let max, runda;
    if (length <= 8) {
      max = 8;
      runda = "1/2";
    } else if (length <= 16) {
      max = 16;
      runda = groupNo == 2 ? "1/2" : "1/4";
    } else if (length <= 24 && groupNo == 4) {
      max = 24;
      runda = "1/4";
    } else {
      max = 32;
      runda = "1/8";
    }
    return { max, runda };
  };

  //wychodiz 16 ale 8 grup
const outFromGroup = (groupId, miejsce) => {
  const do18 = [
    [1, 8, 9, 16],
    [8, 1, 16, 9],
    [6, 3, 14, 11],
    [3, 6, 11, 14],
    [4, 5, 12, 13],
    [5, 4, 13, 12],
    [2, 7, 10, 15],
    [7, 2, 15, 10],
  ];
  return do18[groupId][miejsce];
};

//wychodiz z 4 grup do 24
const outFrom4Group = (miejsce) => {
  const do14 = [
    1, 4, 3, 2, 4, 1, 2, 3, 5, 8, 7, 6, 8, 5, 6, 7, 9, 12, 11, 10, 12, 9, 10,
    11,
  ];
  return do14[miejsce];
};
//wychodzi 16
const outFromGroup2 = (miejsce) => {
  const out16 = [
    1, 8, 3, 5, 6, 4, 7, 2, 2, 7, 4, 6, 5, 3, 8, 1, 9, 16, 11, 13, 14, 12, 15,
    10, 10, 15, 12, 14, 13, 11, 16, 9,
  ];
  return out16[miejsce];
};
//wychodzi 8 ale wiecej niż 2 grupy
const outFromGroup3 = (miejsce) => {
  const out8 = [1, 4, 3, 2, 4, 1, 2, 3, 5, 8, 7, 6, 8, 5, 6, 7];
  return out8[miejsce];
};
//wychodzi 8 ale 2 grupy
const outFromGroup35 = (miejsce) => {
  const out8 = [1, 4, 3, 2, 2, 3, 4, 1, 5, 8, 7, 6, 6, 7, 8, 5];
  return out8[miejsce];
};

//wychodzi po 4 na ssekcje przy do 16 z 2 grup
const outFromGroup32 = (miejsce) => {
  const out8 = [1, 2, 2, 1, 3, 4, 4, 3, 5, 6, 6, 5, 7, 8, 8, 7];
  return out8[miejsce];
};

//wychodzi 4
const outFromGroup4 = (miejsce) => {
  const out4 = [1, 2, 2, 1, 3, 4, 4, 3];
  return out4[miejsce];
};

  
  module.exports = {
    selectRound,determineMaxAndRound,outFromGroup,
    outFromGroup2,
    outFromGroup3,
    outFromGroup35,
    outFromGroup32,
    outFromGroup4,
    outFrom4Group,
  };