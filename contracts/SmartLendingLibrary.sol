pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol";

contract SmartLendingLibrary is ERC721Mintable {
    
    struct Book {
        string isbn;
        uint deposit;
        address lender;
        bool available;
    }
    
    Book[] public books;
    address public owner;
    
    constructor() public {
        owner = msg.sender;
    }

    // Everyone can add books in the library
    function isMinter(address account) public view returns (bool) {
        account;
        return true;
    }
    
    // Override to permit beneficiary to start the trasfer
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(to, tokenId));

        super._transferFrom(from, to, tokenId);
    }

    // Everyone can borrow a book
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        Book memory book = books[tokenId];
        if (book.available || spender == book.lender)
          return true;
        
        return false;
    }

    // Add a book to the library
    function addBook(address acct, string memory _isbn, uint _deposit) public returns (uint) {
        uint id = books.length;
        books.push(Book(_isbn, _deposit, acct, true));
        super.mint(acct, id);
        return id;
    }

    // Add a book to the library
    function addBook(string memory _isbn, uint _deposit) public returns (uint) {
        return addBook(msg.sender, _isbn, _deposit);
    }

    // Borrow a book
    function borrow(address myAcct, uint _id) public {
        require(_id <= books.length, "This book does not exists");
        Book storage book = books[_id];
        require(myAcct != super.ownerOf(_id), "You already own this book");
        super.safeTransferFrom(super.ownerOf(_id), myAcct, _id);
        book.available = false;
    }

    // Borrow a book
    function borrow(uint _id) public {
        borrow(msg.sender, _id);
    }

    // Release a book
    function release(uint _id) public returns (bool) {
        require(_id <= books.length, "This book does not exists");
        require(msg.sender == super.ownerOf(_id), "You do not own this book");
        Book storage book = books[_id];
        book.available = true;
        return true;
    }

    // Return a book
    function returnHome(uint _id) public {
        require(_id <= books.length, "This book does not exists");
        Book memory book = books[_id];
        if (msg.sender == book.lender || msg.sender == super.ownerOf(_id))
            super.safeTransferFrom(ownerOf(_id), book.lender, _id);
    }
    
    // Get the lender of the book
    function getLender(uint _id) view public returns (address) {
        require(_id <= books.length, "This book does not exists");
        Book memory book = books[_id];
        return book.lender;
    }

    // Return the number of books in library
    function getCount() view public returns (uint) {
        return books.length;
    }      
}