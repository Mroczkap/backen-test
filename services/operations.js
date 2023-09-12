const sortByProperty = (data, primaryPropertyName, secondaryPropertyName, ascending) => {
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

  
  module.exports = {
    sortByProperty
  };
  