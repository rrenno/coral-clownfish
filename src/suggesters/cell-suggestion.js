export default class CellSuggestion {

    /**
       Cell suggestion constructor.
       @method constructor
       @param {Integer} row Cell row.
       @param {Integer} columns Cell column.
       @return {void}
    */
    constructor(row, column, type = null) {
        this.row = row
        this.column = column;
        this.type = type;
    }
}
