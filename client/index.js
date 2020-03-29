const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const BOOKS_PROTO_PATH = path.join(__dirname, 'books.proto');
const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 50051;

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  bytes: String,
  defaults: true,
  arrays: true,
  objects: true,
  oneofs: true,
};
const packageDefinition = protoLoader.loadSync(BOOKS_PROTO_PATH, options);
const booksProto = grpc.loadPackageDefinition(packageDefinition);

const client = new booksProto
  .books
  .BookService(`${SERVER_HOST}:${SERVER_PORT}`, grpc.credentials.createInsecure());

const printResponse = (error, response) => {
  if (error) {
    console.log('Error: ', error);
    return;
  }
  console.log(response);
};

const listBooks = () => {
  client.list({}, (error, books) => {
    printResponse(error, books);
  });
};

const insertBook = (id, title, author) => {
  const book = {
    author,
    title,
    id: parseInt(id, 10),
  };
  client.insert(book, (error, empty) => {
    printResponse(error, empty);
  });
};

const getBook = (id) => {
  client.get({ id: parseInt(id, 10) }, (error, book) => {
    printResponse(error, book);
  });
};

const deleteBook = (id) => {
  client.delete({ id: parseInt(id, 10) }, (error, empty) => {
    printResponse(error, empty);
  });
};

const watchBooks = () => {
  const call = client.watch({});
  call.on('data', (book) => {
    console.log(book);
  });
};

const processName = process.argv.shift();
const scriptName = process.argv.shift();
const command = process.argv.shift();

switch (command) {
  case 'list':
    listBooks();
    break;
  case 'insert':
    insertBook(process.argv[0], process.argv[1], process.argv[2]);
    break;
  case 'get':
    getBook(process.argv[0]);
    break;
  case 'delete':
    deleteBook(process.argv[0]);
    break;
  case 'watch':
    watchBooks();
    break;
}
