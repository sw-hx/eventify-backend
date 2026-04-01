const errorFormatter = {
  printError: (err, message) => {
    console.log(`\n .............${message}..................... \n`);
    console.log(err);
    console.log(`\n .............${message}..................... \n`);
  },
  // custom exception thrower to have a standard exception formate
  throwError: (status, message) => {
    throw {
      status: status || 500,
      message: message || "Internal Server Error",
    };
  },
};

export default errorFormatter;
