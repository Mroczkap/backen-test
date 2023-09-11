const sortByProperty = (data, propertyName, ascending) => {
    return data.sort((a, b) => {
        const aValue = a[propertyName];
        const bValue = b[propertyName];
        
        if (ascending) {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }
  
  module.exports = {
    sortByProperty
  };
  