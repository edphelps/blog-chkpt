const expect = chai.expect // or the other dialects
const model = require('../model');

describe('model', () =>{

  describe('#bookInsert', () => {
    it('insert a new book should return the book with UUID', () => {
      const book = model.bookInsert();
    }); // it

  }); // #insert

}); // calculator
