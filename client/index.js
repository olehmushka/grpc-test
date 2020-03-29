const grpc = require('grpc');

const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 50051;

const booksProto = grpc.load('books.proto');
const client = new booksProto.books
  .BookService(`${SERVER_HOST}:${SERVER_PORT}`, grpc.credentials.createInsecure());

const printResponse = (error, response) => {
    if (error)
        console.log('Error: ', error);
    else
        console.log(response);
};

const listBooks = () => {
    client.list({}, function(error, books) {
        printResponse(error, books);
    });
};

const insertBook = (id, title, author) => {
    var book = {
        id: parseInt(id),
        title: title,
        author: author
    };
    client.insert(book, function(error, empty) {
        printResponse(error, empty);
    });
};

const getBook = (id) => {
    client.get({
        id: parseInt(id)
    }, function(error, book) {
        printResponse(error, book);
    });
};

const deleteBook = (id) => {
    client.delete({
        id: parseInt(id)
    }, function(error, empty) {
        printResponse(error, empty);
    });
};

const watchBooks = () => {
    var call = client.watch({});
    call.on('data', function(book) {
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
