const SmartLendingLibrary = artifacts.require("SmartLendingLibrary");

contract("SmartLendingLibrary", accounts => {
  let sll
  let owner = accounts[0]
  let catchRevert = require("./exceptions.js").catchRevert;

  beforeEach('setup contract for each test', async () => {
    sll = await SmartLendingLibrary.deployed()
  })

  it("owner should be able add a book in the library", async () => {
    let firstBookId = 0
    let bookId = await sll.addBook("ISBN-USER1", 1);
    let counter = await sll.getCount.call()
    assert.equal(counter.toNumber(), 1, "Addition of the book should match what is returned.")
  });

  it("even other users should be able add a book in the library", async () => {
    let b2 = await sll.addBook(accounts[1], "ISBN-USER2", 1);
    let b3 = await sll.addBook(accounts[2], "ISBN-USER3", 1);
    let counter = await sll.getCount.call()
    assert.equal(counter.toNumber(), 3, "Addition of the book should match what is returned.")
  });

  it("users own the books added", async () => {
    assert.equal(await sll.ownerOf(0), accounts[0], "Owner should match the account address.");
    assert.equal(await sll.ownerOf(1), accounts[1], "Owner should match the account address.");
    assert.equal(await sll.ownerOf(2), accounts[2], "Owner should match the account address.");
  });

  it("added book should be available for lending", async () => {
    let book = await sll.books(0)  
    assert.equal(book.available, true, "Book is not available.");
  });

  it("users can borrow available books", async () => {
    let user = accounts[0]
    let bookId = 1
    await sll.borrow(bookId)  
    assert.equal(await sll.ownerOf(bookId), user, "Owner should match the account address.");
  });

  it("borrowed book should not be available for lending", async () => {
    let bookId = 1
    let book = await sll.books(bookId)  
    assert.equal(book.available, false, "Book is available.");
  });

  it("even other users should be able to borrow a book", async () => {
    let user = accounts[1]
    let bookId = 0
    let book = await sll.books(bookId)
    await sll.borrow(user, bookId);
    let owner = await sll.ownerOf(bookId)
    assert.equal(owner, user, "Owner should match the account address.");
  });

  it("borrowed books can't be borrowed again until released", async () => {  
    let user = accounts[2]
    let bookId = 0
 
    await catchRevert(sll.borrow(user, bookId));
  });

  it("book lender can return the book even if not avilable", async () => {
    await sll.returnHome(0);
    assert.equal(await sll.ownerOf(0), accounts[0], "Owner should match the account address.");
  });

  it("returned book should not be available for lending", async () => {
    let book = await sll.books(0)  
    assert.equal(book.available, false, "Book is available.");
  });

  it("book can be let available for lending", async () => {
    await sll.release(0);
    let book = await sll.books(0);
    assert.equal(book.available, true, "Book is not available.");
  });



});