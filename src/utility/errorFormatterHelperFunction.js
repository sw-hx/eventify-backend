const errorFormatter = {
  printError: (err, message) => {
    console.log(`\n .............${message}..................... \n`);
    console.log(err);
    console.log(`\n .............${message}..................... \n`);
  },
  // 2 helper
  throwError: (status, message) => {
    throw {
      status: status || 500,
      message: message || "Internal Server Error",
    };
  },
};

export default errorFormatter;
