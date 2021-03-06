const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader')
const events = require('events');
const path = require('path');

const BOOKS_PROTO_PATH = path.join(__dirname, 'books.proto');
const HOST = '0.0.0.0';
const PORT = 50051;

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

const bookStream = new events.EventEmitter();

const books = [{
  id: 123,
  title: 'A Tale of Two Cities',
  author: 'Charles Dickens',
}];

const server = new grpc.Server();
server.addService(booksProto.books.BookService.service, {
  list(call, callback) {
    callback(null, { books });
  },
  insert(call, callback) {
    const book = call.request;
    books.push(book);
    bookStream.emit('new_book', book);
    callback(null, {});
  },
  get(call, callback) {
    for (let i = 0; i < books.length; i++) {
      if (books[i].id === call.request.id) {
        return callback(null, books[i]);
      }
    }
    callback({
      code: grpc.status.NOT_FOUND,
      details: 'Not found',
    });
  },
  delete(call, callback) {
    for (let i = 0; i < books.length; i++) {
      if (books[i].id === call.request.id) {
        books.splice(i, 1);
        return callback(null, {});
      }
    }
    callback({
      code: grpc.status.NOT_FOUND,
      details: 'Not found',
    });
  },
  watch(stream) {
    bookStream.on('new_book', (book) => {
      stream.write(book);
    });
  },
});

server.bind(`${HOST}:${PORT}`, grpc.ServerCredentials.createInsecure());
server.start();
